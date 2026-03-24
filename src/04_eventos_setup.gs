/**
 * GEAPA-EVENTOS
 * Setup e utilidades de inicialização
 */

function eventos_setupPopularConfigPadrao() {
  const sheet = eventos_getSheetConfig_();
  const values = sheet.getDataRange().getValues();

  let headerOk = false;
  if (values.length > 0) {
    const headers = values[0];
    headerOk = headers.indexOf('CHAVE') !== -1 && headers.indexOf('VALOR') !== -1 && headers.indexOf('DESCRICAO') !== -1;
  }

  if (!headerOk) {
    sheet.clearContents();
    sheet.getRange(1, 1, 1, EVENTOS_HEADERS.CONFIG.length).setValues([EVENTOS_HEADERS.CONFIG]);
  }

  const atuais = eventos_getConfigMap_();
  const rows = [];

  Object.keys(EVENTOS_CONFIG_DEFAULTS).forEach(function(key) {
    if (!Object.prototype.hasOwnProperty.call(atuais, key)) {
      rows.push([key, EVENTOS_CONFIG_DEFAULTS[key], 'Configuração padrão do módulo de eventos']);
    }
  });

  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }

  return { inserted: rows.length };
}

function eventos_testeCriacaoRapida() {
  return eventos_criarEvento({
    TIPO_EVENTO: EVENTOS_TIPOS.REUNIAO_GERAL,
    TITULO: 'Reunião Geral de Teste',
    DESCRICAO: 'Evento de teste inicial do módulo geapa-eventos.',
    DATA_EVENTO: new Date(),
    HORARIO_INICIO: '19:00',
    HORARIO_FIM: '21:00',
    LOCAL: 'Sala do GEAPA',
    FORMATO: 'Presencial',
    RESPONSAVEL_INTERNO: 'Diretoria',
    RESPONSAVEL_EMAIL: 'teste@exemplo.com',
    PUBLICO_ALVO: 'Membros',
    RESTRITO_A_DIRETORIA: false,
    OBRIGATORIA: true,
    EXIGE_CONVOCACAO: true,
    EXIGE_LEMBRETE: true,
    EXIGE_ATA: true,
    EXIGE_MATERIAL: false,
    EXIGE_LISTA_PRESENCA: true,
    CONTA_PRESENCA: true,
    CONTA_FALTA: true,
    GERA_CERTIFICADO: false,
    CARGA_HORARIA: 2,
    STATUS: EVENTOS_STATUS.PLANEJADO,
    OBSERVACOES: 'Criado automaticamente por eventos_testeCriacaoRapida().'
  });
}

function eventos_obterCabecalhos() {
  return {
    Eventos: EVENTOS_HEADERS.EVENTOS,
    Convidados: EVENTOS_HEADERS.CONVIDADOS,
    Email_Log: EVENTOS_HEADERS.EMAIL_LOG,
    Config: EVENTOS_HEADERS.CONFIG
  };
}
