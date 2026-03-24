/**
 * GEAPA-EVENTOS
 * Adapter para GEAPA-CORE (Library pública)
 *
 * Baseado na API exportada em 20_public_exports.js do geapa-core.
 * O objetivo é manter o módulo compatível com a Library real,
 * sem depender diretamente de funções internas terminadas em "_".
 */

var EVENTOS_CTX = (typeof globalThis !== 'undefined') ? globalThis : this;

function eventos_hasCoreLibrary_() {
  return typeof EVENTOS_CTX.GEAPA_CORE !== 'undefined' && EVENTOS_CTX.GEAPA_CORE;
}

function eventos_coreGetSheetByKey_(key) {
  if (eventos_hasCoreLibrary_() && typeof GEAPA_CORE.coreGetSheetByKey === 'function') {
    return GEAPA_CORE.coreGetSheetByKey(key);
  }
  if (typeof EVENTOS_CTX.coreGetSheetByKey === 'function') {
    return EVENTOS_CTX.coreGetSheetByKey(key);
  }
  if (typeof EVENTOS_CTX.core_getSheetByRegistryKey_ === 'function') {
    return EVENTOS_CTX.core_getSheetByRegistryKey_(key);
  }
  if (typeof EVENTOS_CTX.core_getSheetByKey_ === 'function') {
    return EVENTOS_CTX.core_getSheetByKey_(key);
  }
  throw new Error('Nenhuma função compatível para obter Sheet por KEY do Registry foi encontrada.');
}

function eventos_coreHeaderMap_(sheet, headerRow) {
  if (eventos_hasCoreLibrary_() && typeof GEAPA_CORE.coreHeaderMap === 'function') {
    return GEAPA_CORE.coreHeaderMap(sheet, headerRow || 1);
  }
  if (typeof EVENTOS_CTX.coreHeaderMap === 'function') {
    return EVENTOS_CTX.coreHeaderMap(sheet, headerRow || 1);
  }
  if (typeof EVENTOS_CTX.core_getHeaderMap_ === 'function') {
    return EVENTOS_CTX.core_getHeaderMap_(sheet, headerRow || 1);
  }
  if (typeof EVENTOS_CTX.core_headerMap_ === 'function') {
    return EVENTOS_CTX.core_headerMap_(sheet, headerRow || 1);
  }

  var headers = sheet.getRange(headerRow || 1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    if (headers[i]) map[String(headers[i]).trim()] = i;
  }
  return map;
}

function eventos_coreNow_() {
  if (eventos_hasCoreLibrary_() && typeof GEAPA_CORE.coreNow === 'function') {
    return GEAPA_CORE.coreNow();
  }
  if (typeof EVENTOS_CTX.coreNow === 'function') {
    return EVENTOS_CTX.coreNow();
  }
  if (typeof EVENTOS_CTX.core_now_ === 'function') {
    return EVENTOS_CTX.core_now_();
  }
  return new Date();
}

function eventos_coreAddDays_(date, days) {
  if (eventos_hasCoreLibrary_() && typeof GEAPA_CORE.coreAddDays === 'function') {
    return GEAPA_CORE.coreAddDays(date, days);
  }
  if (typeof EVENTOS_CTX.coreAddDays === 'function') {
    return EVENTOS_CTX.coreAddDays(date, days);
  }
  if (typeof EVENTOS_CTX.core_addDays_ === 'function') {
    return EVENTOS_CTX.core_addDays_(date, days);
  }
  var d = new Date(date);
  d.setDate(d.getDate() + Number(days || 0));
  return d;
}

function eventos_coreSendEmailText_(opts) {
  if (eventos_hasCoreLibrary_() && typeof GEAPA_CORE.coreSendEmailText === 'function') {
    return GEAPA_CORE.coreSendEmailText(opts);
  }
  if (typeof EVENTOS_CTX.coreSendEmailText === 'function') {
    return EVENTOS_CTX.coreSendEmailText(opts);
  }
  if (typeof EVENTOS_CTX.core_sendEmailText_ === 'function') {
    return EVENTOS_CTX.core_sendEmailText_(opts);
  }
  if (typeof EVENTOS_CTX.core_sendEmail_ === 'function') {
    return EVENTOS_CTX.core_sendEmail_(opts);
  }
  MailApp.sendEmail({
    to: opts.to,
    subject: opts.subject || '',
    body: opts.body || '',
    bcc: opts.bcc || ''
  });
}

function eventos_coreLogInfo_(runId, msg, obj) {
  if (eventos_hasCoreLibrary_() && typeof GEAPA_CORE.coreLogInfo === 'function') {
    return GEAPA_CORE.coreLogInfo(runId, msg, obj);
  }
  if (typeof EVENTOS_CTX.coreLogInfo === 'function') {
    return EVENTOS_CTX.coreLogInfo(runId, msg, obj);
  }
  if (typeof EVENTOS_CTX.core_logInfo_ === 'function') {
    return EVENTOS_CTX.core_logInfo_(runId, msg, obj);
  }
  Logger.log('[INFO] ' + msg + (obj ? ' | ' + JSON.stringify(obj) : ''));
}

function eventos_coreLogError_(runId, msg, obj) {
  if (eventos_hasCoreLibrary_() && typeof GEAPA_CORE.coreLogError === 'function') {
    return GEAPA_CORE.coreLogError(runId, msg, obj);
  }
  if (typeof EVENTOS_CTX.coreLogError === 'function') {
    return EVENTOS_CTX.coreLogError(runId, msg, obj);
  }
  if (typeof EVENTOS_CTX.core_logError_ === 'function') {
    return EVENTOS_CTX.core_logError_(runId, msg, obj);
  }
  Logger.log('[ERROR] ' + msg + (obj ? ' | ' + JSON.stringify(obj) : ''));
}

function eventos_makeId_(prefix) {
  var p = prefix || 'EV';
  return p + '_' + eventos_coreNow_().getTime() + '_' + Math.floor(Math.random() * 100000);
}
