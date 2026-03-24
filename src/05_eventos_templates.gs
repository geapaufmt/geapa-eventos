/**
 * GEAPA-EVENTOS
 * Templates auxiliares de comunicação
 */

function eventos_templateConvocacao_(ev) {
  return {
    saudacao: 'Olá,',
    introducao: 'Esta é uma convocação/organização referente ao evento abaixo:',
    encerramento: 'Atenciosamente,\nGEAPA'
  };
}

function eventos_templateLembrete_(ev) {
  return {
    saudacao: 'Olá,',
    introducao: 'Passando para lembrar do evento abaixo:',
    encerramento: 'Atenciosamente,\nGEAPA'
  };
}

function eventos_templateCobrancaAta_(ev) {
  return {
    saudacao: 'Olá,',
    introducao: 'Consta pendente o registro da ata do evento abaixo:',
    encerramento: 'Atenciosamente,\nGEAPA'
  };
}

function eventos_templateCobrancaMaterial_(ev) {
  return {
    saudacao: 'Olá,',
    introducao: 'Consta pendente o material do evento abaixo:',
    encerramento: 'Atenciosamente,\nGEAPA'
  };
}
