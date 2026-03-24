/**
 * GEAPA-EVENTOS
 * API pública do módulo
 */

function eventos_criarEvento(dados) {
  return eventos_criarEvento_(dados);
}

function eventos_atualizarEvento(idEvento, updates) {
  return eventos_atualizarEvento_(idEvento, updates);
}

function eventos_buscarEventoPorId(idEvento) {
  return eventos_buscarEventoPorId_(idEvento);
}

function eventos_listarEventos(filtros) {
  return eventos_listarEventos_(filtros || {});
}

function eventos_listarPendentes() {
  return eventos_listarPendentes_();
}

function eventos_enviarConvocacoes() {
  return eventos_enviarConvocacoes_();
}

function eventos_enviarLembretes() {
  return eventos_enviarLembretes_();
}

function eventos_marcarRealizado(idEvento) {
  return eventos_marcarRealizado_(idEvento);
}

function eventos_encerrarEvento(idEvento) {
  return eventos_encerrarEvento_(idEvento);
}

function eventos_cobrarAtaPendentes() {
  return eventos_cobrarAtaPendentes_();
}

function eventos_cobrarMaterialPendentes() {
  return eventos_cobrarMaterialPendentes_();
}

function eventos_registrarAta(idEvento, linkAta) {
  return eventos_registrarAta_(idEvento, linkAta);
}

function eventos_registrarMaterial(idEvento, linkMaterial) {
  return eventos_registrarMaterial_(idEvento, linkMaterial);
}

function eventos_exportarAtividadesParaFrequencia() {
  return eventos_exportarAtividadesParaFrequencia_();
}

function eventos_processarRotinas() {
  return eventos_processarRotinas_();
}
