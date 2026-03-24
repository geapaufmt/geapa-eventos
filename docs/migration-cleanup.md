# Migração para estrutura limpa do `geapa-eventos`

## Branch
`refactor/clean-core-integration`

## Objetivo
Consolidar a integração com o `geapa-core` usando a API pública exportada pela Library, e não nomes internos/legados.

## Arquivos canônicos novos
Estes arquivos passam a ser a base da estrutura limpa:

- `src/09_eventos_library_adapter.gs`
- `src/11_eventos_registry_clean.gs`
- `src/12_eventos_service_clean.gs`

## Arquivos de apoio ainda válidos
- `src/00_eventos_public_api.gs`
- `src/01_eventos_constants.gs`
- `src/04_eventos_setup.gs`
- `src/05_eventos_templates.gs`
- `src/06_eventos_validators.gs`
- `src/07_eventos_frequency_export.gs`

## Arquivos antigos que podem sair depois da validação
Esses foram úteis na transição, mas deixam de ser necessários quando a base limpa estiver consolidada:

- `src/02_eventos_registry.gs`
- `src/03_eventos_service.gs`
- `src/08_eventos_core_compat.gs`
- `src/10_eventos_legacy_aliases.gs`

## Estratégia recomendada no VS Code
1. Validar a Library `GEAPA_CORE` no projeto Apps Script.
2. Ajustar a API pública para apontar para a camada limpa.
3. Validar leitura do Registry:
   - `EVENTOS_GERAL`
   - `EVENTOS_CONVIDADOS`
   - `EVENTOS_EMAIL_LOG`
   - `EVENTOS_CONFIG`
4. Testar criação de evento, leitura de config e envio de e-mail.
5. Após validação, remover os arquivos antigos listados acima.

## Observação
A integração real do core foi baseada na API pública exportada em `20_public_exports.js`, especialmente wrappers como:
- `coreGetSheetByKey`
- `coreHeaderMap`
- `coreNow`
- `coreAddDays`
- `coreSendEmailText`
- `coreLogInfo`
- `coreLogError`
