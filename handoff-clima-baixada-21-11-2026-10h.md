# Handoff: Clima Baixada

**Gerado em:** 21/11/2026 (sábado), ~10h (America/Sao_Paulo) · **Responsável:** Alexandre
**Complementa** o handoff de 14/11 (`handoff-clima-baixada-14-11`). Aqui só entra o que mudou desde então.

**Legenda:** ✅ confirmado · 🔎 inferência · ❓ não verificado

## 1. Como o novo chat deve agir
1. Peça os arquivos reais (`index.html` **completo**, `dados.json`, `gerar-dados.mjs`, os workflows e `sw.js`) antes de editar. Nunca altere de memória.
2. Não invente dados de tempo, maré ou CETESB.
3. Alexandre é leigo: dê passos detalhados, em português simples.
4. Segurança primeiro: ⚪ é "sem avaliação", nunca "seguro".

## 2. Situação em 21/11
| Item | Estado |
|---|---|
| Testes do semáforo | ✅ 31 aprovados, 0 falhas |
| **Atualizar dados.json #20** | ✅ rodou à mão, 18 s, sucesso |
| Deploy do Pages (#451, #452) | ✅ concluídos depois da execução #20 |
| Falha de ontem em `gerar-dados.mjs` | ✅ `CONNECT_TIMEOUT` em `ecmwf_ifs025` e `gfs_seamless`. O script manteve o `dados.json` anterior |
| 5 tentativas no `get()` | 🔎 código entregue em 21/11. ❓ Falta publicar e testar |
| Cron de `dados.yml` (`23 9,21` + reserva `47 11`) | ❓ recomendado, sem confirmação |
| Cron de `noticias.yml` (`41 */3 * * *`) | ❓ recomendado, sem confirmação |
| Outros crons | ✅ cache-clima `7 * * * *` e CPTEC `20 */3 * * *` estão bons |
| Nota do Resumão (`onst`, "lám baixo") | ❓ corrigir no arquivo real |

## 3. Pendências (por prioridade)
1. **Publicar o `gerar-dados.mjs` novo** e rodar **Actions → Atualizar dados.json → Run workflow**.
2. **Trocar os crons** de `dados.yml` e `noticias.yml` (item 2).
3. **Conferir o `index.html`:** a linha `const rs=...` e o texto "tem… lá embaixo".
4. **Amanhã, depois das 06h23:** conferir em Actions se o `dados.json` rodou sozinho.
5. **Marés:** a tábua embutida de 2026 já acabou. Confirmar que o `mares.json` (com 2027) está publicado. ❓ Não verificado.
6. **CETESB:** conferir o boletim vigente e atualizar `dados.json` e os textos fixos do HTML.
7. **Acessibilidade fase 2** (só se pedir): `.strip` com teclado, `aria-live` e emojis soltos.

## 4. Decisões que valem (não desfazer sem aprovação)
- Publicar `index.html` e `dados.json` juntos quando ambos mudarem.
- `gerar-dados.mjs` recusa gravar dado incompleto e mantém o arquivo anterior. Manter assim.
- A avaliação vira ⚪ depois de 48 h. Entre 24 e 48 h aparece "papo velho".
- Previsão de modelo não substitui Marinha, Defesa Civil, Bombeiros nem o bom senso.

## 5. Perguntas para o Alexandre
1. Os dois crons já foram trocados?
2. O `gerar-dados.mjs` novo foi publicado? O próximo run passou?
3. O `index.html` do site está com a linha `const rs=` correta?
4. O `mares.json` com 2027 está no ar?