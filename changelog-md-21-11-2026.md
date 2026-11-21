# Changelog · Clima Baixada

Formato: o que mudou, quando e se foi confirmado.

## [21/11/2026]

### Confirmado
- ✅ Testes das regras do semáforo (`semaforo.test.mjs`): **31 aprovados, 0 falhas** (maré, caiaque, surfe, trovoada e chance de chuva).
- ✅ Workflow **Atualizar dados.json #20** rodou à mão, no `main`, com sucesso (18 s).
- ✅ **pages build and deployment** #451 e #452 concluídos com sucesso depois dessa execução.

### Preparado, ainda não publicado
- `gerar-dados.mjs`: `get()` passa de 3 para **5 tentativas**, com limite de 30 s e pausas de 3, 6, 12 e 24 s. Erros 4xx (exceto 429) não são repetidos. Motivo: em 20/11 houve `CONNECT_TIMEOUT` nos modelos de vento/chuva (`ecmwf_ifs025`, `gfs_seamless`). O script recusou gravar dados incompletos e manteve o `dados.json` anterior, que é o comportamento correto.

### Recomendado, sem confirmação de que foi feito
- `dados.yml`: trocar `0 9,21 * * *` por `23 9,21 * * *` (06h23 e 18h23 de Brasília), mais a reserva `47 11 * * *` (08h47). Evita a hora redonda, quando o GitHub fica mais cheio.
- `noticias.yml`: trocar `0 */3 * * *` por `41 */3 * * *`.

### Correção de código
- No `index.html`, trecho da nota do Resumão: `onst` → `const`, "têm" → "tem", "lám baixo" → "lá embaixo". ❓ Confirmar no arquivo real se já foi corrigido.

### Conhecido
- Os horários do `schedule` do GitHub Actions são "melhor esforço" e podem atrasar.