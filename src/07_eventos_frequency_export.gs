/**
 * GEAPA-EVENTOS
 * Helpers dedicados à exportação para frequência
 */

function eventos_mapEventoParaAtividade_(ev) {
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
}

function eventos_exportarAtividadesApenasValidas_() {
  return eventos_listarEventos_({}).filter(function(ev) {
    return String(ev.STATUS) !== EVENTOS_STATUS.CANCELADO;
  }).map(eventos_mapEventoParaAtividade_);
}
