/**
 * GEAPA-EVENTOS
 * Registry limpo do módulo
 *
 * Este arquivo usa diretamente o adapter da Library pública do GEAPA-CORE.
 * A versão antiga permanece temporariamente para facilitar transição e comparação.
 */

function eventosGetSheetEventos() {
  return eventos_coreGetSheetByKey_(EVENTOS_REGISTRY_KEYS.EVENTOS_GERAL);
}

function eventosGetSheetConvidados() {
  return eventos_coreGetSheetByKey_(EVENTOS_REGISTRY_KEYS.EVENTOS_CONVIDADOS);
}

function eventosGetSheetEmailLog() {
  return eventos_coreGetSheetByKey_(EVENTOS_REGISTRY_KEYS.EVENTOS_EMAIL_LOG);
}

function eventosGetSheetConfig() {
  return eventos_coreGetSheetByKey_(EVENTOS_REGISTRY_KEYS.EVENTOS_CONFIG);
}

function eventosGetHeaderMapOrThrow(sheet) {
  var map = eventos_coreHeaderMap_(sheet, 1);
  if (!map || Object.keys(map).length === 0) {
    throw new Error('Cabeçalhos não encontrados na aba: ' + sheet.getName());
  }
  return map;
}

function eventosGetConfigMap() {
  var sheet = eventosGetSheetConfig();
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return {};

  var headers = values[0];
  var idxChave = headers.indexOf('CHAVE');
  var idxValor = headers.indexOf('VALOR');

  if (idxChave === -1 || idxValor === -1) {
    throw new Error('A aba EVENTOS_CONFIG precisa ter colunas CHAVE e VALOR.');
  }

  var out = {};
  for (var i = 1; i < values.length; i++) {
    var chave = values[i][idxChave];
    var valor = values[i][idxValor];
    if (chave !== '') out[chave] = valor;
  }

  return out;
}

function eventosGetConfigValue(key, fallback) {
  var cfg = eventosGetConfigMap();
  return Object.prototype.hasOwnProperty.call(cfg, key) ? cfg[key] : fallback;
}
