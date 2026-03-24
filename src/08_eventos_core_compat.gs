/**
 * GEAPA-EVENTOS
 * Camada de compatibilidade com GEAPA-CORE
 *
 * Objetivo:
 * - usar funções do core quando existirem
 * - fornecer fallback mínimo quando não existirem
 */

var EVENTOS_GLOBAL = (typeof globalThis !== 'undefined') ? globalThis : this;

if (typeof EVENTOS_GLOBAL.core_getSheetByRegistryKey_ !== 'function') {
  EVENTOS_GLOBAL.core_getSheetByRegistryKey_ = function(key) {
    if (typeof EVENTOS_GLOBAL.core_getRegistry_ === 'function') {
      var registry = EVENTOS_GLOBAL.core_getRegistry_();
      var entry = registry && registry[key];

      if (!entry) {
        throw new Error('Registry KEY não encontrada no fallback de compatibilidade: ' + key);
      }

      var spreadsheetId = entry.SPREADSHEET_ID || entry.spreadsheetId || entry.id;
      var sheetName = entry.SHEET_NAME || entry.sheetName || entry.name;

      if (!spreadsheetId || !sheetName) {
        throw new Error('Entrada de Registry incompleta para a KEY: ' + key);
      }

      var ss = SpreadsheetApp.openById(spreadsheetId);
      var sh = ss.getSheetByName(sheetName);
      if (!sh) {
        throw new Error('Aba não encontrada para a KEY ' + key + ': ' + sheetName);
      }

      return sh;
    }

    throw new Error('Nem core_getSheetByRegistryKey_ nem core_getRegistry_ estão disponíveis.');
  };
}

if (typeof EVENTOS_GLOBAL.core_getHeaderMap_ !== 'function') {
  EVENTOS_GLOBAL.core_getHeaderMap_ = function(sheet) {
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) return {};

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var map = {};
    for (var i = 0; i < headers.length; i++) {
      if (headers[i]) map[String(headers[i]).trim()] = i;
    }
    return map;
  };
}

if (typeof EVENTOS_GLOBAL.core_makeId_ !== 'function') {
  EVENTOS_GLOBAL.core_makeId_ = function(prefix) {
    var p = prefix || 'ID';
    var rand = Math.floor(Math.random() * 100000);
    return p + '_' + new Date().getTime() + '_' + rand;
  };
}

if (typeof EVENTOS_GLOBAL.core_sendEmail_ !== 'function') {
  EVENTOS_GLOBAL.core_sendEmail_ = function(payload) {
    if (!payload || !payload.to) {
      throw new Error('Payload de e-mail inválido no fallback de compatibilidade.');
    }

    MailApp.sendEmail({
      to: payload.to,
      subject: payload.subject || '',
      body: payload.body || '',
      bcc: payload.bcc || ''
    });
  };
}
