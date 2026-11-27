# Changelog · Clima Baixada

Formato: o que mudou, quando e se foi confirmado.

## 2026-11-27 · Bola do dia: pior nível entre caiaque e surfe

**Motivo:** nas abas Resumão, Pesca, Navio e Praia a bola do dia mostrava só o caiaque. Segurança primeiro: com duas atividades avaliadas, a bola não pode ser mais otimista que nenhuma delas.

**Mudanças (`index.html`):**
- Nova `nivelDoDia(d, sub)` no bloco `SEMAFORO-INI/FIM`. Surf mostra o surfe, Caiaque mostra o caiaque, as demais abas mostram o pior dos dois. 🔴 vence ⚪; ⚪ nunca vira "seguro".
- `render()`: a bola do dia chama `nivelDoDia(d,S.sub)`.
- `infoHTML`: o card da hora mostra só o ícone e a bola da aba (🏄 em Surf, 🛶 em Caiaque). As outras abas mostram os dois. Mudança só de exibição, não altera nenhuma regra de segurança.

**Testes:** `nivel-dia.test.mjs`, 5 casos novos. O teste de ligação falhou antes da troca na tela e passa depois. Total da suíte: 84 aprovados, 0 falhas.

**Ainda não coberto:** o desenho da bola e o card da hora na tela (o teste cobre a regra e a ligação, não a renderização). Conferência visual só com um dia em que caiaque e surfe tenham níveis diferentes.

**Como desfazer:** voltar ao `index-backup.html`.


changelog-26-11-etapa0

## 2026-11-26 · Fechamento da Etapa 0 (verificações)

**Motivo:** encerrar as pendências de verificação antes de mexer em novas regras de segurança (`nivelDoDia`). Nenhuma regra mudou nesta entrada.

**Conferido:**
- ✅ `node --test`: 79 testes aprovados, 0 falhas (local).
- ✅ `git status --short`: vazio (árvore limpa naquele momento).
- ✅ `melhorJanela(`: 3 ocorrências no `index.html` (definição na linha 929; usos em `resumo()` na linha 1118, para `kw` e `sw`, e em `tripBox` na linha 1155).
- ✅ Texto "lám baixo" (erro de digitação) corrigido: 0 ocorrências. "lá embaixo": 1.
- ✅ `periodo.test.mjs`: commit `ba18b6e` de 2026-11-25. A data dos cards de período neste CHANGELOG está correta.
- ✅ `mares.json` (commit `d7d29ac`, 2026-11-25): publicado no site, com `2027-12-31` como último dia. Marés 2026 e 2027 conferidas por Alexandre.
- ✅ `sw.js` local: versão `clima-v19`, rede primeiro (`cache: 'no-cache'`) e cache só como fallback offline.
- ✅ sw.js publicado: clima-v19 (conferido em climabaixada.com.br/sw.js em 26/11/2026).

**Observação:** o seletor de hora do Android (Saída/Volta) é nativo do sistema, não é bug do app.

**Ainda não coberto:**
- ❓ Ligação de `limitaHora` e `melhorJanela` com a tela: coberta por `hora-ligacao.test.mjs`, mas não conferida na tela em todos os casos (🟡 e 🟢).

**Como desfazer:** voltar ao `index-backup.html`. Esta entrada é só documentação.


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


## 2026-11-25 · Cards de período (Manhã, Almoço, Tarde, Noite): limites e dicas

**Motivo:** os cards avisavam chuva tarde demais ou de menos. Segurança primeiro: na dúvida, o aviso sobe.

**Mudanças (`index.html`, `periodoInfo`):**
- Chuva forte (card vermelho): a partir de **1 mm** na soma das horas (antes, 2 mm).
- Chuva fraca (card amarelo): chance **≥ 40%** ou chuva **≥ 0,3 mm** (antes, chance ≥ 30%).
- Chance ≥ 60% com pelo menos 0,3 mm também é nível forte.
- Sem chance de chuva informada = ⚪ (nunca verde).
- Dicas novas: rajada ≥ 45 km/h (amarelo), blusa com mínima ≤ 23 °C, protetor solar só de dia com calor ≥ 30 °C (a sensação térmica vale mais que a temperatura).

**Testes:** `periodo.test.mjs` com 13 casos, passando (parte dos 79 do `node --test`).

**Ainda não conferido:**
- ❓ Se os testes falhavam antes da mudança (prova de regressão não feita).
- ✅ Data confirmada pelo `git log`: commit `ba18b6e`, 25/11/2026.

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


## 2026-11-22 · Janela de horário nunca mais otimista que o veredito

**Motivo:** o "Melhor hora" podia mostrar 🟢 ou 🟡 num dia com veredito 🔴. Às 20h34, com dia 🔴, o painel mostrava "🔴 05h–11h", que parecia uma recomendação. Segurança primeiro: a janela é derivada do veredito e nunca pode ser mais otimista que ele.

**Mudanças (`index.html`):**
- Nova função `limitaJanela(nivel, janela)`, dentro do bloco `SEMAFORO-INI`/`SEMAFORO-FIM`. Dia 🔴 devolve janela 🔴. Dia ⚪ ou inválido devolve `null` (sem janela). Nunca melhora um nível pior.
- `melhorJanela` (que usa `bestRun`) só considera horas que ainda não passaram.
- `resumo()`: `kw` e `sw` passam por `limitaJanela` com `D.k` e `D.s`.
- `tripBox`: `best` passa por `limitaJanela` (caiaque usa `.k`, surfe usa `.s`).
- `autoLvl` **não foi alterada** de propósito. Ela gera o veredito automático a partir do `bestRun`, então é a origem e não um derivado.

**Testes:** 3 casos novos de `limitaJanela` em `semaforo.test.mjs` (janela com dia 🔴, nunca mais otimista, ⚪/inválido/sem janela). Total lido no Terminal em 22/11: 23 passando, 0 falhas.

**Conferido na tela (22/11, 19:54, celular):** dia 🔴 mostra "nenhum horário seguro hoje" em Caiaque e Surfe.

**Ainda não coberto:**
- ❓ Sem teste automático da ligação entre `limitaJanela` e `resumo()`/`tripBox`, que ficam na interface.
- ❓ Sem teste que prove que `melhorJanela` ignora horas passadas.
- ❓ Casos 🟡 e 🟢 não conferidos na tela.
- 🔎 Dia ⚪ mostra "sem dados ao vivo" no `resumo()`. É conservador, mas o texto é impreciso. Possível melhoria futura: "sem avaliação".

**Como desfazer:** voltar ao `index-backup.html`.



## [21/11/2026]

### Confirmado
- ✅ Testes das regras do semáforo (`semaforo.test.mjs`): **31 aprovados, 0 falhas** (maré, caiaque, surfe, trovoada e chance de chuva).
- ✅ Workflow **Atualizar dados.json #20** rodou à mão, no `main`, com sucesso (18 s).
- ✅ **pages build and deployment** #451 e #452 concluídos com sucesso depois dessa execução.

### Publicado (confirmado em 26/11)
- ✅ `gerar-dados.mjs`: `get()` com **5 tentativas**, limite de 30 s e pausas de 3, 6, 12 e 24 s. Erros 4xx (exceto 429) não são repetidos. Entrou no commit `96aff79` (21/11, 10:52). Motivo: em 20/11 houve `CONNECT_TIMEOUT` nos modelos de vento/chuva (`ecmwf_ifs025`, `gfs_seamless`). O script recusou gravar dados incompletos e manteve o `dados.json` anterior, que é o comportamento correto.
- ✅ `dados.yml`: o cron mudou duas vezes em 21/11. Às 09:36 (`446cc7f`) saiu da hora redonda para 06h23 e 18h23, com reserva às 08h47. Às 16:23 (`aad9c03`) passou a 6 horários por dia: 21h23, 06h23, 09h23, 12h23, 15h23 e 18h23 (Brasília), mais a reserva das 08h47. A hora redonda foi evitada porque o GitHub fica mais cheio nela.
- ✅ Execuções #38 a #47 do workflow (23/11 a 26/11): todas concluídas com sucesso.

### Observado, sem causa confirmada
- 🔎 Execuções agendadas atrasam ou são puladas. Na lista de 26/11: 24/11 das 07:05 às 18:33 (11 h 28 min sem rodar) e 25/11 das 05:51 às 16:26 (10 h 35 min). A reserva das 08h47 não aparece nas 10 execuções vistas.
- ❓ A execução de 25/11 às 05:51 é anterior ao primeiro horário do cron (06h23). Sem explicação.
- 🔎 Mitigação existente: o selo DESATUALIZADO após 6 h no painel. ❓ Não conferido na tela nesses dias.

### Publicado e depois alterado (noticias.yml, confirmado em 26/11)
- ✅ 21/11 09:44 (`bdba43b`): cron trocado de `0 */3 * * *` para `41 */3 * * *`, como recomendado.
- ✅ 21/11 16:25 (`007cc84`): substituído por `7,37 * * * *` (a cada 30 min, fora da hora cheia). O commit anterior, `6131738` (16:20), já tinha removido o `41 */3`.
- ✅ 22/11 09:13 (`98dcf42`): acrescentada a reserva `22,52 * * * *`. Hoje são 4 execuções por hora (minutos 7, 22, 37 e 52 UTC).
- ✅ Execuções do `noticias.yml` vistas em 26/11: #71 (agendada, 09:54) e #72 (manual), ambas concluídas com sucesso. Só essas duas foram conferidas; as demais não.
- 🔎 Nessa mesma tela não apareceu nenhuma execução agendada entre 09:54 e a manual, embora o cron preveja 4 por hora. O `schedule` do GitHub é "melhor esforço" e pula horários.

### Correção de código
- No `index.html`, trecho da nota do Resumão: `onst` → `const`, "têm" → "tem", "lám baixo" → "lá embaixo". ✅ Confirmado em 26/11: `grep -c "lám baixo"` deu 0 e `grep -c "lá embaixo"` deu 1.

### Conhecido
- Os horários do `schedule` do GitHub Actions são "melhor esforço" e podem atrasar.
