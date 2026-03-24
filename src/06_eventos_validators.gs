/**
 * GEAPA-EVENTOS
 * Validadores básicos
 */

function eventos_validarEvento_(dados) {
  const erros = [];

  if (!dados) {
    erros.push('Dados do evento não informados.');
    return erros;
  }

  if (!dados.TIPO_EVENTO) erros.push('TIPO_EVENTO é obrigatório.');
  if (!dados.TITULO) erros.push('TITULO é obrigatório.');
  if (!dados.DATA_EVENTO) erros.push('DATA_EVENTO é obrigatória.');

  return erros;
}

function eventos_assertEventoValido_(dados) {
  const erros = eventos_validarEvento_(dados);
  if (erros.length > 0) {
    throw new Error('Evento inválido: ' + erros.join(' | '));
  }
}
