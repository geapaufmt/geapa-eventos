/**
 * GEAPA-EVENTOS
 * Service limpo do módulo
 *
 * Esta versão usa diretamente o adapter público do GEAPA-CORE
 * e a camada limpa de registry, reduzindo dependência dos nomes legados.
 */

function eventosCreate(dados) {
  eventos_assertEventoValido_(dados);

  var sheet = eventosGetSheetEventos();
  var headerMap = eventosGetHeaderMapOrThrow(sheet);
  var now = eventos_coreNow_();
  var evento = eventos_normalizarLinhaEvento_(dados || {});

  evento.ID_EVENTO = eventos_makeId_('EV');
  evento.STATUS = evento.STATUS || EVENTOS_STATUS.PLANEJADO;
  evento.CRIADO_EM = now;
  evento.ATUALIZADO_EM = now;

  if (evento.EXIGE_ATA === true && !evento.DATA_LIMITE_ATA && evento.DATA_EVENTO) {
    evento.DATA_LIMITE_ATA = eventos_coreAddDays_(new Date(evento.DATA_EVENTO), Number(eventosGetConfigValue('PRAZO_ATA_DIAS', EVENTOS_CONFIG_DEFAULTS.PRAZO_ATA_DIAS)));
  }

  if (evento.EXIGE_MATERIAL === true && !evento.DATA_LIMITE_MATERIAL && evento.DATA_EVENTO) {
    evento.DATA_LIMITE_MATERIAL = eventos_coreAddDays_(new Date(evento.DATA_EVENTO), Number(eventosGetConfigValue('PRAZO_MATERIAL_DIAS', EVENTOS_CONFIG_DEFAULTS.PRAZO_MATERIAL_DIAS)));
  }

  var row = eventos_buildRowFromObject_(headerMap, evento);
  sheet.appendRow(row);
  return evento.ID_EVENTO;
}

function eventosList(filtros) {
  var sheet = eventosGetSheetEventos();
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  var headers = values[0];
  var out = [];

  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = values[i][j];
    if (eventos_matchFiltros_(obj, filtros || {})) out.push(obj);
  }

  return out;
}

function eventosSendConvocations() {
  var runId = 'eventosSendConvocations';
  var pendentes = eventos_listarPendentes_();
  var enviados = 0;

  for (var i = 0; i < pendentes.length; i++) {
    var ev = pendentes[i];
    if (!eventos_shouldSendConvocacao_(ev)) continue;
    if (!ev.RESPONSAVEL_EMAIL) continue;

    var mail = eventos_buildEmailConvocacao_(ev);
    eventos_coreSendEmailText_({
      to: ev.RESPONSAVEL_EMAIL,
      subject: mail.subject,
      body: mail.body,
      bcc: String(eventosGetConfigValue('EMAIL_BCC_PADRAO', EVENTOS_CONFIG_DEFAULTS.EMAIL_BCC_PADRAO) || '')
    });

    eventos_coreLogInfo_(runId, 'Convocação enviada', { idEvento: ev.ID_EVENTO, email: ev.RESPONSAVEL_EMAIL });
    enviados++;
  }

  return enviados;
}

function eventosSendReminders() {
  var runId = 'eventosSendReminders';
  var pendentes = eventos_listarPendentes_();
  var enviados = 0;

  for (var i = 0; i < pendentes.length; i++) {
    var ev = pendentes[i];
    if (!eventos_shouldSendLembrete_(ev)) continue;
    if (!ev.RESPONSAVEL_EMAIL) continue;

    var mail = eventos_buildEmailLembrete_(ev);
    eventos_coreSendEmailText_({
      to: ev.RESPONSAVEL_EMAIL,
      subject: mail.subject,
      body: mail.body,
      bcc: String(eventosGetConfigValue('EMAIL_BCC_PADRAO', EVENTOS_CONFIG_DEFAULTS.EMAIL_BCC_PADRAO) || '')
    });

    eventos_coreLogInfo_(runId, 'Lembrete enviado', { idEvento: ev.ID_EVENTO, email: ev.RESPONSAVEL_EMAIL });
    enviados++;
  }

  return enviados;
}
