## 2026-11-25 · Efeito canal sem tábua de maré

**Motivo:** quando a maré era desconhecida, `tideAt` devolvia `null` e a regra do efeito canal era ignorada. Vento sul de 13 nós com maré ausente dava 🟡, e deveria dar 🔴.

**Mudança (`index.html`, `kayakV`):**
- Maré ausente passa a ser tratada como vazante (segurança primeiro).
- O motivo exibido é "sem tábua de maré (tratado como vazante) + vento sul >12 nós".

**Teste:** 1 caso novo em `semaforo.test.mjs`. Falhava antes (`1 !== 2`) e passa depois.

**Confirmado no Terminal (25/11):** 25 testes, 25 aprovados, 0 falhas.

**Ainda não conferido:**
- ❓ Na tela, com a maré fora da tábua.
- ❓ Se `surfV` e as outras telas precisam da mesma regra (surfe não usa maré).

**Como desfazer:** voltar ao `index-backup.html`.


# Changelog · Clima Baixada

## 2026-11-22
- Melhor janela: dia 🔴 não mostra mais horário de janela (limitaJanela).
- Melhor janela: só considera horas que ainda não passaram (bestRun + melhorJanela).
- Motivo: às 20h34, com dia 🔴, o painel mostrava "🔴 05h–11h", que parecia uma recomendação.
- Teste novo em semaforo.test.mjs (32 casos).
- 
026-11-22 · Janela de horário nunca mais otimista que o veredito
Motivo: o "Melhor hora" podia mostrar 🟢 ou 🟡 num dia com veredito 🔴. Segurança primeiro: a janela é derivada do veredito e nunca pode ser mais otimista que ele.

Mudanças (index.html):

Nova função limitaJanela(nivel, janela), dentro do bloco SEMAFORO-INI/SEMAFORO-FIM. Dia 🔴 devolve janela 🔴. Dia ⚪ ou inválido devolve null (sem janela). Nunca melhora um nível pior.
resumo(): kw e sw passam por limitaJanela com D.k e D.s.
tripBox: best passa por limitaJanela (caiaque usa .k, surfe usa .s).
autoLvl não foi alterada de propósito. Ela gera o veredito automático a partir do bestRun, então é a origem e não um derivado.
Testes: 3 casos novos em semaforo.test.mjs (janela com dia 🔴, nunca mais otimista, ⚪/inválido/sem janela). Total: 23 passando, 0 falhas.

Conferido na tela (22/11, 19:54, celular): dia 🔴 mostra "nenhum horário seguro hoje" em Caiaque e Surfe.

Ainda não coberto:

❓ Sem teste automático da ligação entre limitaJanela e resumo()/tripBox, que ficam na interface.
❓ Casos 🟡 e 🟢 não conferidos na tela.
🔎 Dia ⚪ mostra "sem dados ao vivo" no resumo(). É conservador, mas o texto é impreciso. Possível melhoria futura: "sem avaliação".
Como desfazer: voltar ao index-backup.html.

--------------



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
