# Compatibilidade com GEAPA-CORE

Como o conector não expôs diretamente os arquivos-fonte do `geapa-core`, este módulo foi preparado com uma camada de compatibilidade em `src/08_eventos_core_compat.gs`.

## Ordem de uso
O módulo tentará usar, nesta ordem:

1. `core_getSheetByRegistryKey_`
2. fallback via `core_getRegistry_`

Também tenta usar, se existirem:
- `core_getHeaderMap_`
- `core_makeId_`
- `core_sendEmail_`

Se essas funções não existirem, são aplicados fallbacks mínimos.

## Suposição confirmada
Pelo histórico operacional do sistema GEAPA, há indício forte de que `core_getRegistry_` existe e é utilizado em produção.

## Registry do módulo
Na Planilha Geral já existem as seguintes keys do módulo:
- `EVENTOS_GERAL`
- `EVENTOS_CONVIDADOS`
- `EVENTOS_EMAIL_LOG`
- `EVENTOS_CONFIG`

Todas apontam para a planilha `GESTÃO DE EVENTOS`.
