/**
 * GEAPA-EVENTOS
 * Ponte entre nomes legados do starter e o adapter real da Library.
 *
 * Mantém compatibilidade com os arquivos já criados no módulo,
 * mas passa a direcionar a execução para os wrappers públicos do GEAPA-CORE.
 */

var EVENTOS_LEGACY_CTX = (typeof globalThis !== 'undefined') ? globalThis : this;

EVENTOS_LEGACY_CTX.core_getSheetByRegistryKey_ = function(key) {
  return eventos_coreGetSheetByKey_(key);
};

EVENTOS_LEGACY_CTX.core_getHeaderMap_ = function(sheet, headerRow) {
  return eventos_coreHeaderMap_(sheet, headerRow || 1);
};

EVENTOS_LEGACY_CTX.core_makeId_ = function(prefix) {
  return eventos_makeId_(prefix);
};

EVENTOS_LEGACY_CTX.core_sendEmail_ = function(opts) {
  return eventos_coreSendEmailText_(opts);
};

EVENTOS_LEGACY_CTX.core_now_ = function() {
  return eventos_coreNow_();
};

EVENTOS_LEGACY_CTX.core_addDays_ = function(date, days) {
  return eventos_coreAddDays_(date, days);
};

EVENTOS_LEGACY_CTX.core_logInfo_ = function(runId, msg, obj) {
  return eventos_coreLogInfo_(runId, msg, obj);
};

EVENTOS_LEGACY_CTX.core_logError_ = function(runId, msg, obj) {
  return eventos_coreLogError_(runId, msg, obj);
};
