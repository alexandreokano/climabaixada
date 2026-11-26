# Changelog · Clima Baixada

Formato: o que mudou, quando e se foi confirmado.

## 2026-11-26 · Hora a hora nunca mais otimista que o veredito do dia

**Motivo:** o semáforo por hora (Surf e Caiaque) podia mostrar 🟢 ou 🟡 em dia com veredito manual do Capitão 🔴. A hora e o dia se contradiziam. Em 26/11, o surfe estava 🔴 no dia (`s: 2`), mas a hora de onda de 1,4 m aparecia 🟡 pela regra automática.

**Mudanças (`index.html`):**
- Nova função `limitaHora(nivelDia, h)` dentro do bloco `SEMAFORO-INI/FIM`. Se o dia for pior que a hora, a hora sobe para o nível do dia e ganha o motivo "veredito do Capitão para o dia é pior que esta hora".
- Hora sem dados continua sem dados. Veredito ⚪ ou inválido não altera nada.
- `hourInfo()` aplica `limitaHora` a `k` (caiaque) e `s` (surfe) só quando o dia tem veredito manual (`!D.auto && !D.ext`). Dia automático nasce das próprias horas e não é limitado.
- Como `bestRun`, `strip`, `infoHTML` e `tripBox` leem `hourInfo`, todos passam a respeitar a trava.
- O aviso de efeito canal (`warn`) é preservado.

**Testes:**
- 5 casos novos de `limitaHora` em `semaforo.test.mjs`.
- Arquivo novo `hora-ligacao.test.mjs`, com 9 testes que cobrem a ligação real entre `hourInfo()` e o semáforo: controle sem veredito, dia manual 🔴, dia manual 🟡, `k` e `s` separados, dia ⚪, dias `auto` e `ext`, bairro sem mar e dia inexistente.
- Resultado: 79 testes passando no total (`node --test`), 0 falhas.

**Prova de regressão (26/11, 9h40):** gerei uma cópia do `index.html` sem as duas chamadas `limitaHora(D.k,k)` e `limitaHora(D.s,s)` e rodei `hora-ligacao.test.mjs` nela. Resultado: 6 passaram e 3 falharam (dia manual 🔴, dia manual 🟡 e vereditos separados de caiaque e surfe). Isso prova que os testes detectam a remoção da ligação. A cópia foi apagada e o `git status` ficou limpo.

**Conferido também na tela (26/11):** 🔴 em todas as horas de dia (05h–18h) no Surf e no Caiaque.

**Como desfazer:** voltar ao `index-backup.html`.


## 2026-11-25 (regra de segurança)
- Maré: `parada` (estofa, diferença menor que 10 cm) agora conta como vazante em `tratarComoVazante`.
- Motivo: na estofa o aviso de efeito canal (vazante + vento sul acima de 12 nós) não disparava, e o semáforo ficava mais otimista que a regra.
- Teste: novo caso em `mare-tendencia.test.mjs`.


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


## 2026-11-22
- Melhor janela: dia 🔴 não mostra mais horário de janela (limitaJanela).
- Melhor janela: só considera horas que ainda não passaram (bestRun + melhorJanela).
- Motivo: às 20h34, com dia 🔴, o painel mostrava "🔴 05h–11h", que parecia uma recomendação.
- Teste novo em semaforo.test.mjs (contagem de casos não reconferida).
  
## 2026-11-22 · Janela de horário nunca mais otimista que o veredito

**Motivo:** o "Melhor hora" podia mostrar 🟢 ou 🟡 num dia com veredito 🔴. Segurança primeiro: a janela é derivada do veredito e nunca pode ser mais otimista que ele.

**Mudanças (`index.html`):**
- Nova função `limitaJanela(nivel, janela)`, dentro do bloco `SEMAFORO-INI`/`SEMAFORO-FIM`. Dia 🔴 devolve janela 🔴. Dia ⚪ ou inválido devolve `null` (sem janela). Nunca melhora um nível pior.
- `resumo()`: `kw` e `sw` passam por `limitaJanela` com `D.k` e `D.s`.
- `tripBox`: `best` passa por `limitaJanela` (caiaque usa `.k`, surfe usa `.s`).
- `autoLvl` **não foi alterada** de propósito. Ela gera o veredito automático a partir do `bestRun`, então é a origem e não um derivado.

**Testes:** 3 casos novos em `semaforo.test.mjs` (janela com dia 🔴, nunca mais otimista, ⚪/inválido/sem janela). Total: 23 passando, 0 falhas.

**Conferido na tela (22/11, 19:54, celular):** dia 🔴 mostra "nenhum horário seguro hoje" em Caiaque e Surfe.

**Ainda não coberto:**
- ❓ Sem teste automático da ligação entre `limitaJanela` e `resumo()`/`tripBox`, que ficam na interface.
- ❓ Casos 🟡 e 🟢 não conferidos na tela.
- 🔎 Dia ⚪ mostra "sem dados ao vivo" no `resumo()`. É conservador, mas o texto é impreciso. Possível melhoria futura: "sem avaliação".

**Como desfazer:** voltar ao `index-backup.html`.


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
