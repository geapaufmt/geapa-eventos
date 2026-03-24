/**
 * GEAPA-EVENTOS
 * Regras de negócio
 */

function eventos_criarEvento_(dados) {
  const sheet = eventos_getSheetEventos_();
  const headerMap = eventos_getHeaderMapOrThrow_(sheet);

  const now = new Date();
  const evento = eventos_normalizarLinhaEvento_(dados || {});

  evento.ID_EVENTO = core_makeId_('EV');
  evento.STATUS = evento.STATUS || EVENTOS_STATUS.PLANEJADO;
  evento.CRIADO_EM = now;
  evento.ATUALIZADO_EM = now;

  if (evento.EXIGE_ATA === true && !evento.DATA_LIMITE_ATA && evento.DATA_EVENTO) {
    evento.DATA_LIMITE_ATA = eventos_addDays_(new Date(evento.DATA_EVENTO), Number(eventos_getConfigValue_('PRAZO_ATA_DIAS', EVENTOS_CONFIG_DEFAULTS.PRAZO_ATA_DIAS)));
  }

  if (evento.EXIGE_MATERIAL === true && !evento.DATA_LIMITE_MATERIAL && evento.DATA_EVENTO) {
    evento.DATA_LIMITE_MATERIAL = eventos_addDays_(new Date(evento.DATA_EVENTO), Number(eventos_getConfigValue_('PRAZO_MATERIAL_DIAS', EVENTOS_CONFIG_DEFAULTS.PRAZO_MATERIAL_DIAS)));
  }

  const row = eventos_buildRowFromObject_(headerMap, evento);
  sheet.appendRow(row);

  return evento.ID_EVENTO;
}

function eventos_atualizarEvento_(idEvento, updates) {
  const sheet = eventos_getSheetEventos_();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return false;

  const headers = values[0];
  const rowIndex = eventos_findRowIndexById_(values, 'ID_EVENTO', idEvento);
  if (rowIndex === -1) return false;

  const idxAtualizadoEm = headers.indexOf('ATUALIZADO_EM');
  const updateKeys = Object.keys(updates || {});

  for (let k = 0; k < updateKeys.length; k++) {
    const key = updateKeys[k];
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1) {
      sheet.getRange(rowIndex + 1, colIndex + 1).setValue(updates[key]);
    }
  }

  if (idxAtualizadoEm !== -1) {
    sheet.getRange(rowIndex + 1, idxAtualizadoEm + 1).setValue(new Date());
  }

  return true;
}

function eventos_buscarEventoPorId_(idEvento) {
  const eventos = eventos_listarEventos_({});
  for (let i = 0; i < eventos.length; i++) {
    if (String(eventos[i].ID_EVENTO) === String(idEvento)) return eventos[i];
  }
  return null;
}

function eventos_listarEventos_(filtros) {
  const sheet = eventos_getSheetEventos_();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  const out = [];

  for (let i = 1; i < values.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[i][j];
    }

    if (eventos_matchFiltros_(obj, filtros)) {
      out.push(obj);
    }
  }

  return out;
}

function eventos_listarPendentes_() {
  const eventos = eventos_listarEventos_({});
  return eventos.filter(function(ev) {
    return [
      EVENTOS_STATUS.PLANEJADO,
      EVENTOS_STATUS.CONFIRMADO,
      EVENTOS_STATUS.AGUARDANDO_CONFIRMACAO,
      EVENTOS_STATUS.CONVOCADO,
      EVENTOS_STATUS.LEMBRETE_ENVIADO,
      EVENTOS_STATUS.ATA_PENDENTE,
      EVENTOS_STATUS.MATERIAL_PENDENTE
    ].indexOf(String(ev.STATUS)) !== -1;
  });
}

function eventos_enviarConvocacoes_() {
  const pendentes = eventos_listarPendentes_();
  let enviados = 0;

  for (let i = 0; i < pendentes.length; i++) {
    const ev = pendentes[i];
    if (!eventos_shouldSendConvocacao_(ev)) continue;
    if (!ev.RESPONSAVEL_EMAIL) continue;

    const mail = eventos_buildEmailConvocacao_(ev);
    core_sendEmail_({
      to: ev.RESPONSAVEL_EMAIL,
      subject: mail.subject,
      body: mail.body,
      bcc: String(eventos_getConfigValue_('EMAIL_BCC_PADRAO', EVENTOS_CONFIG_DEFAULTS.EMAIL_BCC_PADRAO) || '')
    });

    eventos_logEmail_(ev.ID_EVENTO, 'CONVOCACAO', ev.RESPONSAVEL_EMAIL, mail.subject, '', 'ENVIADO', '');
    eventos_atualizarEvento_(ev.ID_EVENTO, {
      STATUS: EVENTOS_STATUS.CONVOCADO,
      DATA_CONVOCACAO: new Date()
    });

    enviados++;
  }

  return enviados;
}

function eventos_enviarLembretes_() {
  const pendentes = eventos_listarPendentes_();
  let enviados = 0;

  for (let i = 0; i < pendentes.length; i++) {
    const ev = pendentes[i];
    if (!eventos_shouldSendLembrete_(ev)) continue;
    if (!ev.RESPONSAVEL_EMAIL) continue;

    const mail = eventos_buildEmailLembrete_(ev);
    core_sendEmail_({
      to: ev.RESPONSAVEL_EMAIL,
      subject: mail.subject,
      body: mail.body,
      bcc: String(eventos_getConfigValue_('EMAIL_BCC_PADRAO', EVENTOS_CONFIG_DEFAULTS.EMAIL_BCC_PADRAO) || '')
    });

    eventos_logEmail_(ev.ID_EVENTO, 'LEMBRETE', ev.RESPONSAVEL_EMAIL, mail.subject, '', 'ENVIADO', '');
    eventos_atualizarEvento_(ev.ID_EVENTO, {
      STATUS: EVENTOS_STATUS.LEMBRETE_ENVIADO,
      DATA_LEMBRETE: new Date()
    });

    enviados++;
  }

  return enviados;
}

function eventos_marcarRealizado_(idEvento) {
  const evento = eventos_buscarEventoPorId_(idEvento);
  if (!evento) return false;

  const updates = {
    STATUS: EVENTOS_STATUS.REALIZADO,
    DATA_REALIZACAO: new Date()
  };

  if (eventos_toBoolean_(evento.EXIGE_ATA) && !evento.LINK_ATA) {
    updates.STATUS = EVENTOS_STATUS.ATA_PENDENTE;
  } else if (eventos_toBoolean_(evento.EXIGE_MATERIAL) && !evento.LINK_MATERIAL) {
    updates.STATUS = EVENTOS_STATUS.MATERIAL_PENDENTE;
  }

  return eventos_atualizarEvento_(idEvento, updates);
}

function eventos_encerrarEvento_(idEvento) {
  return eventos_atualizarEvento_(idEvento, {
    STATUS: EVENTOS_STATUS.CONCLUIDO
  });
}

function eventos_cobrarAtaPendentes_() {
  const eventos = eventos_listarEventos_({ STATUS: EVENTOS_STATUS.ATA_PENDENTE });
  let enviados = 0;

  for (let i = 0; i < eventos.length; i++) {
    const ev = eventos[i];
    if (!eventos_shouldCobrarAta_(ev)) continue;
    if (!ev.RESPONSAVEL_EMAIL) continue;

    const mail = eventos_buildEmailCobrancaAta_(ev);
    core_sendEmail_({
      to: ev.RESPONSAVEL_EMAIL,
      subject: mail.subject,
      body: mail.body,
      bcc: String(eventos_getConfigValue_('EMAIL_BCC_PADRAO', EVENTOS_CONFIG_DEFAULTS.EMAIL_BCC_PADRAO) || '')
    });

    eventos_logEmail_(ev.ID_EVENTO, 'COBRANCA_ATA', ev.RESPONSAVEL_EMAIL, mail.subject, '', 'ENVIADO', '');
    enviados++;
  }

  return enviados;
}

function eventos_cobrarMaterialPendentes_() {
  const eventos = eventos_listarEventos_({ STATUS: EVENTOS_STATUS.MATERIAL_PENDENTE });
  let enviados = 0;

  for (let i = 0; i < eventos.length; i++) {
    const ev = eventos[i];
    if (!eventos_shouldCobrarMaterial_(ev)) continue;
    if (!ev.RESPONSAVEL_EMAIL) continue;

    const mail = eventos_buildEmailCobrancaMaterial_(ev);
    core_sendEmail_({
      to: ev.RESPONSAVEL_EMAIL,
      subject: mail.subject,
      body: mail.body,
      bcc: String(eventos_getConfigValue_('EMAIL_BCC_PADRAO', EVENTOS_CONFIG_DEFAULTS.EMAIL_BCC_PADRAO) || '')
    });

    eventos_logEmail_(ev.ID_EVENTO, 'COBRANCA_MATERIAL', ev.RESPONSAVEL_EMAIL, mail.subject, '', 'ENVIADO', '');
    enviados++;
  }

  return enviados;
}

function eventos_registrarAta_(idEvento, linkAta) {
  const ok = eventos_atualizarEvento_(idEvento, {
    LINK_ATA: linkAta
  });

  if (!ok) return false;

  const ev = eventos_buscarEventoPorId_(idEvento);
  if (!ev) return false;

  if (eventos_toBoolean_(ev.EXIGE_MATERIAL) && !ev.LINK_MATERIAL) {
    return eventos_atualizarEvento_(idEvento, { STATUS: EVENTOS_STATUS.MATERIAL_PENDENTE });
  }

  return eventos_atualizarEvento_(idEvento, { STATUS: EVENTOS_STATUS.CONCLUIDO });
}

function eventos_registrarMaterial_(idEvento, linkMaterial) {
  const ok = eventos_atualizarEvento_(idEvento, {
    LINK_MATERIAL: linkMaterial
  });

  if (!ok) return false;

  const ev = eventos_buscarEventoPorId_(idEvento);
  if (!ev) return false;

  if (eventos_toBoolean_(ev.EXIGE_ATA) && !ev.LINK_ATA) {
    return eventos_atualizarEvento_(idEvento, { STATUS: EVENTOS_STATUS.ATA_PENDENTE });
  }

  return eventos_atualizarEvento_(idEvento, { STATUS: EVENTOS_STATUS.CONCLUIDO });
}

function eventos_exportarAtividadesParaFrequencia_() {
  const eventos = eventos_listarEventos_({});
  return eventos.map(function(ev) {
    return {
      ID_ATIVIDADE: 'EV-' + ev.ID_EVENTO,
      ORIGEM_MODULO: 'EVENTOS',
      ID_ORIGEM: ev.ID_EVENTO,
      TIPO_ATIVIDADE: ev.TIPO_EVENTO,
      DATA: ev.DATA_EVENTO,
      HORARIO_INICIO: ev.HORARIO_INICIO,
      HORARIO_FIM: ev.HORARIO_FIM,
      TITULO: ev.TITULO,
      RESPONSAVEL: ev.RESPONSAVEL_INTERNO,
      PUBLICO_APLICAVEL: ev.PUBLICO_ALVO,
      OBRIGATORIA: ev.OBRIGATORIA,
      CONTA_PRESENCA: ev.CONTA_PRESENCA,
      CONTA_FALTA: ev.CONTA_FALTA,
      GERA_CERTIFICADO: ev.GERA_CERTIFICADO,
      CARGA_HORARIA: ev.CARGA_HORARIA,
      STATUS: ev.STATUS,
      OBSERVACOES: ev.OBSERVACOES
    };
  });
}

function eventos_processarRotinas_() {
  const enviadosConvocacoes = eventos_enviarConvocacoes_();
  const enviadosLembretes = eventos_enviarLembretes_();
  const cobrancasAta = eventos_cobrarAtaPendentes_();
  const cobrancasMaterial = eventos_cobrarMaterialPendentes_();

  return {
    enviadosConvocacoes: enviadosConvocacoes,
    enviadosLembretes: enviadosLembretes,
    cobrancasAta: cobrancasAta,
    cobrancasMaterial: cobrancasMaterial
  };
}

function eventos_normalizarLinhaEvento_(dados) {
  return {
    ID_EVENTO: dados.ID_EVENTO || '',
    TIPO_EVENTO: dados.TIPO_EVENTO || '',
    SUBTIPO_EVENTO: dados.SUBTIPO_EVENTO || '',
    TITULO: dados.TITULO || '',
    DESCRICAO: dados.DESCRICAO || '',
    DATA_EVENTO: dados.DATA_EVENTO || '',
    HORARIO_INICIO: dados.HORARIO_INICIO || '',
    HORARIO_FIM: dados.HORARIO_FIM || '',
    LOCAL: dados.LOCAL || '',
    FORMATO: dados.FORMATO || '',
    RESPONSAVEL_INTERNO: dados.RESPONSAVEL_INTERNO || '',
    RESPONSAVEL_EMAIL: dados.RESPONSAVEL_EMAIL || '',
    CONVIDADO_NOME: dados.CONVIDADO_NOME || '',
    CONVIDADO_EMAIL: dados.CONVIDADO_EMAIL || '',
    PUBLICO_ALVO: dados.PUBLICO_ALVO || '',
    RESTRITO_A_DIRETORIA: eventos_toBoolean_(dados.RESTRITO_A_DIRETORIA),
    OBRIGATORIA: eventos_toBoolean_(dados.OBRIGATORIA),
    EXIGE_CONVOCACAO: eventos_toBoolean_(dados.EXIGE_CONVOCACAO),
    EXIGE_LEMBRETE: eventos_toBoolean_(dados.EXIGE_LEMBRETE),
    EXIGE_ATA: eventos_toBoolean_(dados.EXIGE_ATA),
    EXIGE_MATERIAL: eventos_toBoolean_(dados.EXIGE_MATERIAL),
    EXIGE_LISTA_PRESENCA: eventos_toBoolean_(dados.EXIGE_LISTA_PRESENCA),
    CONTA_PRESENCA: eventos_toBoolean_(dados.CONTA_PRESENCA),
    CONTA_FALTA: eventos_toBoolean_(dados.CONTA_FALTA),
    GERA_CERTIFICADO: eventos_toBoolean_(dados.GERA_CERTIFICADO),
    CARGA_HORARIA: dados.CARGA_HORARIA || '',
    STATUS: dados.STATUS || '',
    DATA_CONVOCACAO: dados.DATA_CONVOCACAO || '',
    DATA_LEMBRETE: dados.DATA_LEMBRETE || '',
    DATA_REALIZACAO: dados.DATA_REALIZACAO || '',
    DATA_LIMITE_ATA: dados.DATA_LIMITE_ATA || '',
    DATA_LIMITE_MATERIAL: dados.DATA_LIMITE_MATERIAL || '',
    LINK_ATA: dados.LINK_ATA || '',
    LINK_MATERIAL: dados.LINK_MATERIAL || '',
    OBSERVACOES: dados.OBSERVACOES || '',
    CRIADO_EM: dados.CRIADO_EM || '',
    ATUALIZADO_EM: dados.ATUALIZADO_EM || ''
  };
}

function eventos_matchFiltros_(obj, filtros) {
  const keys = Object.keys(filtros || {});
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (filtros[key] === '' || filtros[key] === null || typeof filtros[key] === 'undefined') continue;
    if (String(obj[key]) !== String(filtros[key])) return false;
  }
  return true;
}

function eventos_shouldSendConvocacao_(ev) {
  if (!eventos_toBoolean_(ev.EXIGE_CONVOCACAO)) return false;
  if (String(ev.STATUS) === EVENTOS_STATUS.CANCELADO) return false;
  if (ev.DATA_CONVOCACAO) return false;
  if (!ev.DATA_EVENTO) return false;

  const diasAntes = Number(eventos_getConfigValue_('DIAS_ANTES_CONVOCACAO', EVENTOS_CONFIG_DEFAULTS.DIAS_ANTES_CONVOCACAO));
  const hoje = eventos_onlyDate_(new Date());
  const dataEvento = eventos_onlyDate_(new Date(ev.DATA_EVENTO));
  const diff = eventos_diffDays_(hoje, dataEvento);

  return diff <= diasAntes && diff >= 0;
}

function eventos_shouldSendLembrete_(ev) {
  if (!eventos_toBoolean_(ev.EXIGE_LEMBRETE)) return false;
  if (String(ev.STATUS) === EVENTOS_STATUS.CANCELADO) return false;
  if (ev.DATA_LEMBRETE) return false;
  if (!ev.DATA_EVENTO) return false;

  const diasAntes = Number(eventos_getConfigValue_('DIAS_ANTES_LEMBRETE', EVENTOS_CONFIG_DEFAULTS.DIAS_ANTES_LEMBRETE));
  const hoje = eventos_onlyDate_(new Date());
  const dataEvento = eventos_onlyDate_(new Date(ev.DATA_EVENTO));
  const diff = eventos_diffDays_(hoje, dataEvento);

  return diff <= diasAntes && diff >= 0;
}

function eventos_shouldCobrarAta_(ev) {
  if (!eventos_toBoolean_(ev.EXIGE_ATA)) return false;
  if (ev.LINK_ATA) return false;
  if (!ev.DATA_LIMITE_ATA) return true;

  const hoje = eventos_onlyDate_(new Date());
  const limite = eventos_onlyDate_(new Date(ev.DATA_LIMITE_ATA));
  return hoje.getTime() >= limite.getTime();
}

function eventos_shouldCobrarMaterial_(ev) {
  if (!eventos_toBoolean_(ev.EXIGE_MATERIAL)) return false;
  if (ev.LINK_MATERIAL) return false;
  if (!ev.DATA_LIMITE_MATERIAL) return true;

  const hoje = eventos_onlyDate_(new Date());
  const limite = eventos_onlyDate_(new Date(ev.DATA_LIMITE_MATERIAL));
  return hoje.getTime() >= limite.getTime();
}

function eventos_buildEmailConvocacao_(ev) {
  const prefix = String(eventos_getConfigValue_('ASSUNTO_CONVOCACAO_PREFIXO', EVENTOS_CONFIG_DEFAULTS.ASSUNTO_CONVOCACAO_PREFIXO));
  const subject = prefix + ev.TITULO;

  const body = [
    'Olá,',
    '',
    'Esta é uma convocação/organização referente ao evento abaixo:',
    '',
    'Título: ' + (ev.TITULO || ''),
    'Tipo: ' + (ev.TIPO_EVENTO || ''),
    'Data: ' + (ev.DATA_EVENTO || ''),
    'Horário: ' + (ev.HORARIO_INICIO || '') + (ev.HORARIO_FIM ? ' às ' + ev.HORARIO_FIM : ''),
    'Local: ' + (ev.LOCAL || ''),
    '',
    'Responsável: ' + (ev.RESPONSAVEL_INTERNO || ''),
    '',
    'Descrição/observações:',
    String(ev.DESCRICAO || ev.OBSERVACOES || ''),
    '',
    'Atenciosamente,',
    'GEAPA'
  ].join('\n');

  return { subject: subject, body: body };
}

function eventos_buildEmailLembrete_(ev) {
  const prefix = String(eventos_getConfigValue_('ASSUNTO_LEMBRETE_PREFIXO', EVENTOS_CONFIG_DEFAULTS.ASSUNTO_LEMBRETE_PREFIXO));
  const subject = prefix + ev.TITULO;

  const body = [
    'Olá,',
    '',
    'Passando para lembrar do evento abaixo:',
    '',
    'Título: ' + (ev.TITULO || ''),
    'Tipo: ' + (ev.TIPO_EVENTO || ''),
    'Data: ' + (ev.DATA_EVENTO || ''),
    'Horário: ' + (ev.HORARIO_INICIO || '') + (ev.HORARIO_FIM ? ' às ' + ev.HORARIO_FIM : ''),
    'Local: ' + (ev.LOCAL || ''),
    '',
    'Atenciosamente,',
    'GEAPA'
  ].join('\n');

  return { subject: subject, body: body };
}

function eventos_buildEmailCobrancaAta_(ev) {
  const prefix = String(eventos_getConfigValue_('ASSUNTO_COBRANCA_ATA_PREFIXO', EVENTOS_CONFIG_DEFAULTS.ASSUNTO_COBRANCA_ATA_PREFIXO));
  const subject = prefix + ev.TITULO;

  const body = [
    'Olá,',
    '',
    'Consta pendente o registro da ata do evento abaixo:',
    '',
    'Título: ' + (ev.TITULO || ''),
    'Data: ' + (ev.DATA_EVENTO || ''),
    'Responsável: ' + (ev.RESPONSAVEL_INTERNO || ''),
    '',
    'Solicitamos o envio/registro da ata.',
    '',
    'Atenciosamente,',
    'GEAPA'
  ].join('\n');

  return { subject: subject, body: body };
}

function eventos_buildEmailCobrancaMaterial_(ev) {
  const prefix = String(eventos_getConfigValue_('ASSUNTO_COBRANCA_MATERIAL_PREFIXO', EVENTOS_CONFIG_DEFAULTS.ASSUNTO_COBRANCA_MATERIAL_PREFIXO));
  const subject = prefix + ev.TITULO;

  const body = [
    'Olá,',
    '',
    'Consta pendente o material do evento abaixo:',
    '',
    'Título: ' + (ev.TITULO || ''),
    'Data: ' + (ev.DATA_EVENTO || ''),
    'Responsável: ' + (ev.RESPONSAVEL_INTERNO || ''),
    '',
    'Solicitamos o envio/registro do material.',
    '',
    'Atenciosamente,',
    'GEAPA'
  ].join('\n');

  return { subject: subject, body: body };
}

function eventos_logEmail_(idEvento, tipoEmail, destinatario, assunto, threadId, statusEnvio, observacao) {
  const sheet = eventos_getSheetEmailLog_();
  const headerMap = eventos_getHeaderMapOrThrow_(sheet);

  const rowObj = {
    ID_LOG: core_makeId_('EVLOG'),
    ID_EVENTO: idEvento || '',
    TIPO_EMAIL: tipoEmail || '',
    DESTINATARIO: destinatario || '',
    ASSUNTO: assunto || '',
    THREAD_ID: threadId || '',
    DATA_ENVIO: new Date(),
    STATUS_ENVIO: statusEnvio || '',
    OBSERVACAO: observacao || ''
  };

  const row = eventos_buildRowFromObject_(headerMap, rowObj);
  sheet.appendRow(row);
}

function eventos_buildRowFromObject_(headerMap, obj) {
  const headers = Object.keys(headerMap).sort(function(a, b) {
    return headerMap[a] - headerMap[b];
  });

  const row = [];
  for (let i = 0; i < headers.length; i++) {
    row.push(Object.prototype.hasOwnProperty.call(obj, headers[i]) ? obj[headers[i]] : '');
  }
  return row;
}

function eventos_findRowIndexById_(values, idHeader, idValue) {
  const headers = values[0];
  const idxId = headers.indexOf(idHeader);
  if (idxId === -1) return -1;

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idxId]) === String(idValue)) return i;
  }
  return -1;
}

function eventos_toBoolean_(value) {
  if (typeof value === 'boolean') return value;
  const v = String(value || '').trim().toLowerCase();
  return ['true', '1', 'sim', 's', 'yes'].indexOf(v) !== -1;
}

function eventos_onlyDate_(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function eventos_diffDays_(dateA, dateB) {
  const ms = dateB.getTime() - dateA.getTime();
  return Math.floor(ms / 86400000);
}

function eventos_addDays_(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
