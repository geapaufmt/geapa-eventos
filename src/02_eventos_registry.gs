/**
 * GEAPA-EVENTOS
 * Acesso às abas / registry
 */

function eventos_getSheetEventos_() {
  return core_getSheetByRegistryKey_(EVENTOS_REGISTRY_KEYS.EVENTOS_GERAL);
}

function eventos_getSheetConvidados_() {
  return core_getSheetByRegistryKey_(EVENTOS_REGISTRY_KEYS.EVENTOS_CONVIDADOS);
}

function eventos_getSheetEmailLog_() {
  return core_getSheetByRegistryKey_(EVENTOS_REGISTRY_KEYS.EVENTOS_EMAIL_LOG);
}

function eventos_getSheetConfig_() {
  return core_getSheetByRegistryKey_(EVENTOS_REGISTRY_KEYS.EVENTOS_CONFIG);
}

function eventos_getHeaderMapOrThrow_(sheet) {
  const map = core_getHeaderMap_(sheet);
  if (!map || Object.keys(map).length === 0) {
    throw new Error('Cabeçalhos não encontrados na aba: ' + sheet.getName());
  }
  return map;
}

function eventos_getConfigMap_() {
  const sheet = eventos_getSheetConfig_();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return {};

  const headers = values[0];
  const idxChave = headers.indexOf('CHAVE');
  const idxValor = headers.indexOf('VALOR');

  if (idxChave === -1 || idxValor === -1) {
    throw new Error('A aba EVENTOS_CONFIG precisa ter colunas CHAVE e VALOR.');
  }

  const out = {};
  for (let i = 1; i < values.length; i++) {
    const chave = values[i][idxChave];
    const valor = values[i][idxValor];
    if (chave !== '') out[chave] = valor;
  }

  return out;
}

function eventos_getConfigValue_(key, fallback) {
  const cfg = eventos_getConfigMap_();
  return Object.prototype.hasOwnProperty.call(cfg, key) ? cfg[key] : fallback;
}
