# Recapitulação do projeto: Clima Baixada

**Data:** 26/11/2026, 15h30 (atualizado) · **Responsável:** Alexandre
**Legenda:** ✅ confirmado no material da conversa · 🔎 inferência · ❓ não verificado ou sem informação

---

## 0. Fechado em 26/11 (não repetir)

| Item | Situação | Evidência |
|---|---|---|
| Testes | ✅ **79 aprovados, 0 falhas** (reconfirmado ~15h25, 93,5 ms) | Saída do `node --test` que você colou |
| CHANGELOG | ✅ Limpo e publicado. Tem 1 só entrada de 22/11, a de 25/11 dos cards e as de 25/11 (maré e canal). A de 26/11 traz 9 testes, 79 no total e a prova de regressão. | Arquivo anexado. Ele não aparece no `git status`, e a `main` está igual à `origin/main`. |
| Marés 2026 e 2027 | ✅ Conferidas por você (não revisar de novo) | Você informou. 🔎 O anexo `mares-2026-2027.json` chegou cortado em 26/07/2027, então eu não consigo reverificar. |
| `sw.js` | ✅ Arquivo do repositório é `clima-v19`: rede primeiro com `no-cache`, cache só como plano B. | Arquivo anexado |
| Saída e Volta | ✅ Ao tocar, abre o **seletor de hora nativo do Android** (15:22, botões Definir, Cancelar e Limpar). Não é bug. | As duas capturas de tela mostram o mesmo seletor. Não dá para saber qual campo estava aberto. |
| Semáforo na tela | ✅ Aba Caiaque com 🔴 de 05h a 18h e noite apagada, igual à entrada de 26/11 do CHANGELOG | Captura de tela |
| Bola do dia (Surf × Caiaque) | ✅ Publicada e conferida | Seção 3 |
| Crons | ✅ `dados.yml` com 6 horários por dia mais a reserva das 08h47. `noticias.yml` em `7,37` e `22,52`. Execuções #38 a #47 do `dados.yml` concluídas com sucesso. | CHANGELOG de 21/11 |

**Ainda aberto, só em comandos (nada foi alterado):**

| # | Pendência | Comando (Terminal, pasta `climabaixada`) | Esperado |
|---|---|---|---|
| 1 | Os dois arquivos de recapitulação (`...26-11-2026.md` modificado e `...-2.md` novo) são cópias do mesmo documento? | `diff recapitulacao-clima-baixada-26-11-2026.md recapitulacao-clima-baixada-26-11-2026-2.md \| head -20` | Se forem cópias, mantenha só um, com esta versão, e faça um commit `docs:`. Não apague nada antes de ver o `diff`. |
| 2 | `melhorJanela` e o uso dela em `resumo()` e `tripBox` estão no arquivo? (O CHANGELOG de 22/11 diz que sim.) | `grep -c "function melhorJanela" index.html` | `1` |
| 3 | O erro de digitação da nota do Resumão foi corrigido? | `grep -c "lám baixo" index.html` | `0` |
| 4 | A data exata da entrada dos cards de período (25/11) | `git log --format='%h %ad %s' --date=short -- periodo.test.mjs` | Se a data for outra, corrigir o título no CHANGELOG |
| 5 | O `mares.json` com 2027 está no ar? | Abra `climabaixada.com.br/mares.json` e procure `2027-12-31` | Aparece |

---

## 1. Visão e requisitos

**O que é:** um PWA estático (GitHub Pages, `climabaixada.com.br`) que ajuda a decidir se é seguro ir ao mar na Baixada Santista. Combina previsão, marés, balneabilidade e semáforo (🟢🟡🔴⚪) para caiaque, surfe, pesca, "Meu Dia" (tempo geral) e Jogo do Santos.

**Requisitos fixos**
- **Segurança primeiro.** ⚪ significa "sem avaliação", nunca "seguro". Na dúvida, vale o mais conservador.
- Todo dado deve mostrar fonte, horário e validade. Dado velho é marcado.
- Veredito e derivados (melhor hora, janelas, avisos) saem da mesma função e nenhum derivado é mais otimista que o veredito.
- Cor sempre com emoji e texto. Toque ≥ 44 px. Leitura ao sol. PWA offline.
- Toda mudança em regra de segurança tem teste que falha antes e passa depois, mais entrada no CHANGELOG.
- Mudanças pequenas, com backup (`index-backup.html`), contagem de resultados no Command+F e critério de "deu certo / deu errado".
- Alexandre é leigo e usa Mac. Instruções passo a passo, sem gambiarra.

**Regras do semáforo (código atual, `REGRAS`)**
- **Caiaque:** 🟡 vento > 10 nós ou onda > 0,8 m. 🔴 vento ≥ 15 nós, rajada > 20 nós ou onda > 1,0 m.
- **Efeito canal:** 🔴 com aviso grave quando há vazante (ou maré parada/indefinida, tratada como vazante), vento entre 112° e 248° e acima de 12 nós.
- **Surfe (iniciante):** 🔴 onda > 1,5 m, vento ≥ 18 nós ou ≥ 15 nós onshore. 🟡 onda > 1,0 m ou < 0,3 m.
- **Trovoada:** código ≥ 95 é 🔴. Chance de chuva ≥ 60% é 🟡.

---

## 2. Decisões já tomadas

| Decisão | Motivo |
|---|---|
| Continuar no PWA agora e preparar a base para escalar | Menor custo e manutenção mínima |
| Notificações e lojas (via Capacitor) ficam para depois | Exigem servidor e verba; entram com tração |
| Publicar `index.html` e `dados.json` juntos quando ambos mudarem | Evita dado novo com tela antiga |
| Avaliação manual vira ⚪ após 48 h; "papo velho" após 24 h (🔎 o código recente usa um selo de "desatualizado" após 6 h) | Cinza nunca é "seguro" |
| Maré indefinida ou parada é tratada como vazante | Segurança |
| Hora nunca é mais otimista que o veredito manual do dia (`limitaHora`) | Coerência |
| Janela de horário nunca é mais otimista que o veredito (`limitaJanela`) | Coerência |
| Bola do dia: Surf mostra o nível do surfe (`d.s`). As demais sub-abas continuam com o nível do caiaque (`d.k`), por ser o mais conservador | A bola do Surf contradizia o semáforo por hora |
| Cache do GitHub primeiro (máx. 3 h), depois Open-Meteo direto | Menos chamadas |
| `sw.js` busca na rede primeiro | Usuário vê a versão nova |
| Privacidade por padrão: preferências só no aparelho | LGPD |
| GoatCounter instalado para medir uso | Material para investidores |

---

## 3. Entregáveis: situação

### ✅ Concluído (com evidência)
- **Semáforo:** `kayakV`, `surfV`, trovoada, chance de chuva, dado incompleto nunca verde. Teste em `semaforo.test.mjs`.
- **`limitaJanela`** (22/11) e **`limitaHora`** (26/11), com testes.
- **`hora-ligacao.test.mjs`:** 9 testes aprovados. Suíte completa: **79 aprovados, 0 falhas**. A prova de regressão (sem as duas chamadas de `limitaHora`, 3 testes falham) foi feita e a cópia apagada.
- **`git status`** ✅ `main` igual à `origin/main` (15h25). O código está publicado. Sobraram só dois arquivos de recapitulação, um modificado e um não rastreado (ver seção 0).
- **Bola do dia por aba (Surf × Caiaque), publicada hoje.** O `index.html` usa `EMO[S.sub=='surfe'?d.s:d.k]:dayIcon(i)`. O `grep` deu 0 resultados para o trecho antigo e 1 para o novo. Na tela, o Dom 29 aparece 🟡 em Surf e 🔴 em Caiaque. É mudança de exibição: nenhuma regra de segurança foi alterada e não há entrada no CHANGELOG.
- **`periodoInfo`** (cards Manhã, Almoço, Tarde e Noite), com `PERIODO` congelado e testes.
- **`mare-tendencia.mjs`** (vazante, enchente, parada, indefinida) com testes. Ligação `kayakV` → `tv`/`cons` conferida por leitura de código.
- **Rolagem** ao trocar de dia e aba, botão "Volta pra riba", ajuste dos ícones das abas, nova seção Jogo do Santos.
- **Notícias:** 4 fontes, workflow e script.
- **Dados:** `gerar-dados.mjs` com 5 tentativas e recusa de dado incompleto; `atualizar-cetesb.mjs` (API ArcGIS); `atualizar-cptec.mjs`; `atualizar-cache.mjs` v2 (2 modelos, `weather_code`).
- **Marés 2027:** quatro blocos (jan–mar, abr–jun, jul–set, out–dez) transcritos da DHN. Montagem em `montar-mares-2027.mjs`, validação em `validar-mares.mjs`, e quatro lacunas de janeiro conferidas na MeteoConsult.
- **PWA:** manifest com ícones `?v=5`. `sw.js` ✅ `clima-v19` no repositório (rede primeiro, `no-cache`). 🔎 Cada URL com `?v=` vira uma entrada nova no cache, que só é limpa quando a versão do cache muda.

### 🟡 Em andamento ou aplicação não confirmada
- ✅ **CHANGELOG limpo, com a entrada de 26/11 e já publicado** (seção 0). Ficam duas ressalvas dentro do próprio arquivo: a data da entrada dos cards (25/11) e a prova de regressão dos cards. Também ficam o item da nota do Resumão ("lám baixo") e a falta de teste para a ligação com `melhorJanela`.
- **Melhor janela** (`bestRun` com hora inicial, `melhorJanela`, `tripBox`, `resumo`). ❓ Passos 3–5 de 22/11 sem confirmação de aplicação. 🔎 `autoDays` ainda pode citar horas que já passaram hoje.
- **`pstR` e `resumoDia`** só com horas futuras (passos de 25/11). ❓ Sem confirmação. Ficam fora do bloco testável.
- **Conselho caiçara** (`momBox`, `chuvaCaicara`) e frases de chuva. ❓ Há várias versões no canvas e não se sabe qual está no arquivo real.
- **Marés 2026 e 2027:** ✅ conferidas por você. ❓ Falta confirmar que o arquivo está publicado como `mares.json` (pendência 5 da seção 0). ❓ Falta a autorização de uso da DHN.
- **Crons:** ✅ confirmados (seção 0). 🔎 As execuções agendadas atrasam ou são puladas (24/11: 11 h 28 min sem rodar; 25/11: 10 h 35 min). A reserva das 08h47 não apareceu nas 10 execuções vistas. ❓ A execução de 25/11 às 05:51 é anterior ao primeiro horário do cron (06h23), sem explicação. ❓ O selo DESATUALIZADO após 6 h não foi conferido na tela nesses dias.

### ⏳ Pendente
- Itens da revisão de interface (seção 5).
- Fonte única das regras entre `gerar-dados.mjs` e `REGRAS`.
- Dividir `index.html` em `index.html`, `style.css` e `app.js`.
- Ler `boletim_cetesb` do JSON em todos os textos fixos (há patch no canvas, aplicação não confirmada).
- Painel de métricas, estrutura de "região", termos de uso e privacidade.
- Acessibilidade fase 2 (`.strip` por teclado, `aria-live`, emojis soltos).
- ⚠️ **Bola do dia sem teste automático:** a lógica está dentro da `render()`, fora do bloco testável. Solução definitiva: função única `nivelDoDia(d, sub)` com teste (ver Etapa 3).
- Resumão, Pesca, Navio e Praia ainda usam a bola do Caiaque. É conservador, mas não é o ideal.

---

## 4. Lacunas, inconsistências e pontos a validar

1. **O "Próximo passo (tarefa 1)" colado na sua mensagem está desatualizado.** A tarefa "mover `TIDES` para `mares.json`" já foi feita: existe loader (`loadMares`), `mares.json` de 2026 e dados de 2027. O que falta é confirmar a publicação e a validação.
2. **Cobertura de teste dos três ajustes dos cards (sua tabela com ❓).**
   - ✅ O `semaforo.test.mjs` tem a seção "Cards de período" e o `periodo.test.mjs` existe. Eles cobrem: vermelho a partir de 1 mm (`FORTE_MM`), amarelo com chance ≥ 40% ou 0,3 mm, rajada ≥ 45 km/h, blusa ≤ 23 °C e protetor com calor ≥ 30 °C. O CHANGELOG de 25/11 cita "11 casos novos".
   - ❓ Os testes cobrem a **lógica** (`periodoInfo`), não a **renderização** (`period()`). Os três itens podem ser marcados como "cobertos na lógica", com a ressalva de que a tela não tem teste automático.
   - ❓ Confirmar com `node --test` no arquivo real, porque os dois arquivos de teste têm versões diferentes no canvas.
3. **Contagem de testes não bate.** Aparecem 31 (21/11), 23 e 24 (22/11) e 79 (26/11). Faltam entradas intermediárias. Vale a pena registrar a contagem real a cada commit.
4. **Versão do `sw.js`:** ✅ o arquivo do repositório é `clima-v19`. ❓ Falta confirmar que o site no ar serve a v19 (DevTools, aba Application, Service Workers).
5. **Open-Meteo gratuito é só para uso não comercial.** Ele não serve para monetização ou investimento sem plano pago ou outra fonte. Os termos atuais precisam ser conferidos.
6. **DHN:** as páginas de maré trazem restrição de reprodução. ❓ Falta confirmar a autorização para uso no app.
7. **Rótulos A/B (preamar/baixa-mar) de 2027** foram transcritos de PDF que não traz essa coluna, e a alternância não pode ser forçada (há dois "A" ou dois "B" seguidos). O `validar-mares.mjs` confere estrutura, não correção. ✅ Você informa que 2026 e 2027 foram conferidos. 🔎 Não consigo reverificar: o anexo chegou cortado.
8. **Duplicação de regras:** `gerar-dados.mjs` usa `>= 0.8` e o `REGRAS` usa `> 0.8`. Isso explica, em parte, frases como "perto de 1,0 m" com valor "até 0,8 m".
9. **Dependência manual:** o `dados.json` vence em 48 h. ✅ O `dados.yml` roda sozinho e as execuções #38 a #47 passaram. 🔎 O GitHub atrasa ou pula horários (até 11 h 28 min sem rodar). O selo de 6 h cobre esses buracos, mas isso não foi conferido na tela.
10. **Publicação do canvas:** a linha do `tailwind.js` e os fallbacks `canvas-asset:` não pertencem ao site real. ❓ Conferir se foram removidos do arquivo no ar.
11. **Itens sem informação:** número de usuários, orçamento, prazo de captação, quem substitui Alexandre na manutenção, e se existe revisão jurídica.
12. **Frase de trovoada no `gerar-dados.mjs` (linha 163).** ✅ O texto "risco de trovoadas ou chuva forte" aparece quando `trov || precip >= 10`. Quando o motivo é só chuva acumulada, a frase pode sugerir trovoada sem haver trovoada. O nível 🔴 está correto, só o texto confunde. Prioridade baixa, nenhuma mudança feita. Corrigir exige tornar a regra do dia uma função testável (Etapa 3).
13. **Pontos de hoje sem verificação:**
    - ❓ Os "issues" do Console do navegador subiram de 37 para 41. Não foi aberta a aba **Issues** e não se viu erro vermelho.
    - ❓ O `render.toString()` foi digitado no Terminal, onde não funciona, então não gerou resultado. A prova de que o código está no ar vem do `grep` e da tela.

---

## 5. Revisão de interface (22/11): resumo

| Prioridade | Problema | Natureza |
|---|---|---|
| Alta | Números e frases divergentes (onda, chuva, rajada). Caso da bola do Surf: ✅ resolvido em 26/11. Restante segue aberto | Regra e dado |
| Alta | Veredito abaixo da dobra em Surf e Caiaque | Layout |
| Alta | Janelas passadas tratadas como atuais; sem marcador de "agora" | Regra e UI |
| Média-alta | Verde à noite pode ser lido como "pode ir" | Cor e segurança |
| Média-alta | Amarelo usado como destaque de texto e bordas sem legenda | Cor |
| Média | Saída e Volta parecem vazios. ✅ Ao tocar, abre o seletor de hora nativo do Android. Campo vazio é o esperado até definir a hora. ❓ Não foi visto o resultado depois de "Definir". | Resolvido, falta só essa conferência |
| Média | "(manual)", "faz 0 h", decimais com ponto, "Mar de boa" antes de "Água imprópria" | Texto |
| Baixa | Navegação em 3 níveis, ícones mistos, cards dentro de cards, rodapé longo | Acabamento |

**Não avaliado por falta de material:** desempenho real, contraste medido, leitor de tela, telas pequenas e paisagem, modo offline, abas Pesca, Navio, Praia, Jogo e 10 dias.

---

## 6. Alternativas, prós, contras e recomendação

**A. Veredito acima da dobra**

| Opção | Prós | Contras |
|---|---|---|
| A1: formulário "Meu horário" recolhível, abaixo do veredito | Mudança pequena, mantém tudo | Sub-abas continuam altas |
| A2: sub-abas como chips com rolagem horizontal | Ganha muito espaço | Menos descobrível |
| A3: formulário só no fim da página | Simples | Recurso fica escondido |

**Recomendação: A1 agora, A2 depois de testar com usuários.**

**B. Regras do semáforo em uma fonte só**

| Opção | Prós | Contras |
|---|---|---|
| B1: arquivo de regras lido pelo app e pelo script | Fonte única, esforço moderado | Ajusta o fluxo de publicação |
| B2: script entrega dado bruto e o app calcula tudo | Elimina duplicação | Perde o texto automático do Capitão; mudança grande |
| B3: manter duplicado com teste de igualdade | Rápido | Duplicação continua |

**Recomendação: B1, com o teste de B3 como rede de segurança.**

**C. Janelas passadas**
- C1 ocultar (limpo, mas confuso).
- C2 riscar com "já passou" (transparente, ocupa espaço).
- **C3 riscar e mostrar a "próxima janela" (mais útil, mais lógica). Recomendado.**

**D. Noite no semáforo**
- **D1 cinza com 🌙 (claro e seguro, perde a informação de cor). Recomendado.**
- D2 manter a opacidade (sem trabalho, mantém o risco).

**E. Plataforma**
- **PWA agora (recomendado):** custo baixo, atualização imediata, sem loja. Contra: notificações limitadas.
- **Capacitor/loja depois:** presença nas lojas e notificações, mas exige servidor, conta de desenvolvedor e verba.

---

## 7. Próximas etapas por prioridade

### Etapa 1: Confirmar o estado real (hoje) · 🟡 em grande parte feita (seção 0)
- **Responsável:** Alexandre.
- **Dependências:** nenhuma.
- **Ações:**
  - `git status` e `git log`.
  - `node --test` e anotar a contagem.
  - Command+F por `limitaHora` e `melhorJanela`.
  - Conferir a versão do `sw.js`.
  - Conferir a entrada de 26/11 no CHANGELOG.
- **Risco:** trabalhar sobre versão antiga.
- **Concluído quando:** você enviar a saída do `node --test` (0 falhas) e a lista do que está no arquivo. A conversa passa a ter um estado único e confirmado.

### Etapa 2: Fechar o CHANGELOG e registrar a cobertura dos cards
- **Responsável:** Alexandre, com apoio do assistente.
- **Dependência:** Etapa 1.
- **Ações:**
  - Aplicar a entrada de 26/11 em commit separado.
  - Marcar os três ajustes dos cards como "cobertos na lógica, sem teste de tela".
  - Registrar a contagem real de testes.
- **Risco:** documento contradizer o código.
- **Concluído quando:** o CHANGELOG não tem texto solto, as datas estão em ordem e há um commit `docs:`.

### Etapa 3: Coerência de números e frases (segurança)
- **Responsável:** Alexandre e assistente.
- **Dependência:** Etapa 1; a decisão B1 reduz o retrabalho.
- **Ações:**
  - Unificar limites (`>` ou `>=`) entre `gerar-dados.mjs` e `REGRAS`.
  - Citar o valor real nas frases.
  - Padronizar vírgula decimal.
  - Explicar a origem dos números.
  - Criar `nivelDoDia(d, sub)` como fonte única da bola do dia, com teste que falha antes e passa depois, e entrada no CHANGELOG.
  - Ajustar a frase de trovoada do `gerar-dados.mjs` (linha 163) para citar só chuva quando não houver trovoada.
- **Risco:** mexer em regra de segurança. Exige teste que falha antes e passa depois, mais CHANGELOG.
- **Concluído quando:** um mesmo dia mostra a mesma onda, chuva e rajada em todos os cartões, com legenda de ponto, modelos e janela de horas, e há um teste de igualdade entre as duas fontes de regras.

### Etapa 4: Consciência de tempo (janelas passadas e "agora")
- **Responsável:** Alexandre e assistente.
- **Dependência:** Etapas 1 e 3.
- **Ações:**
  - Aplicar `melhorJanela` em todas as telas.
  - Corrigir `autoDays` para hoje.
  - Marcar "já passou", mostrar a "próxima janela" e marcar o período em curso.
- **Risco:** divergência entre telas.
- **Concluído quando:** em qualquer horário de hoje não aparece janela já encerrada como recomendação, e os testes de janela passam.

### Etapa 5: Noite em cinza e cores só para semáforo
- **Responsável:** Alexandre e assistente.
- **Dependência:** nenhuma técnica; vale decidir a legenda.
- **Concluído quando:** verde, amarelo e vermelho só aparecem com emoji e texto de semáforo, e a noite aparece em cinza com 🌙 e legenda.

### Etapa 6: Marés 2026–2027 no ar · 🟡 conferência feita; falta publicar e a autorização da DHN
- **Responsável:** Alexandre.
- **Dependências:** autorização de uso da DHN (❓), conferência de rótulos A/B por amostra, `validar-mares.mjs` sem erros.
- **Risco:** rótulo trocado altera "vazante" e, com isso, o aviso de efeito canal.
- **Concluído quando:** `node validar-mares.mjs` dá 730 dias e 0 erros, a conferência por amostra bate, a tábua está publicada e funciona offline (`sw.js`), e os dias 31/12/2026 e 01/01/2027 abrem corretamente.

### Etapa 7: Layout do veredito (A1) e Saída/Volta
- **Responsável:** Alexandre e assistente.
- **Dependência:** ✅ atendida. Abre o seletor nativo. Falta só ver o resultado depois de "Definir".
- **Concluído quando:** o veredito aparece sem rolar em Surf e Caiaque, no celular, e o formulário funciona.

### Etapa 8: Automação e dados (reduzir trabalho manual)
- **Responsável:** Alexandre.
- **Ações:**
  - Crons confirmados; falta investigar os atrasos e a reserva das 08h47 que não aparece.
  - Ler `boletim_cetesb` do JSON.
  - Monitorar as Actions.
- **Concluído quando:** durante 7 dias seguidos o `dados.json` e a CETESB atualizam sozinhos, sem edição manual.

### Etapa 9: Base para escalar
- **Responsável sugerido:** desenvolvedor, com Alexandre decidindo.
- **Dependências:** Etapas 3, 6 e 8.
- **Ações:** dividir em `index.html`, `style.css` e `app.js`; estrutura de "região" (cidade, ponto, fonte de maré, fonte de balneabilidade); painel de métricas.
- **Risco:** quebrar `atualizar-cache.mjs`, que lê `PLACES` e `VB` do HTML por expressão regular.
- **Concluído quando:** todos os testes passam e o workflow de cache continua rodando.

### Etapa 10: Jurídico e comercial (antes de captar)
- **Responsável sugerido:** Alexandre e advogado.
- **Ações:** termos de uso, política de privacidade (LGPD), avisos de segurança, termos de Open-Meteo, CETESB, DHN e CPTEC, e plano pago ou fonte alternativa de dados.
- **Concluído quando:** os documentos estão publicados, há parecer sobre responsabilidade e os termos das fontes foram revistos.

### Etapa 11: Qualidade e acessibilidade
- Lighthouse, TalkBack, telas pequenas, paisagem, offline e abas ainda não avaliadas; acessibilidade fase 2.
- **Concluído quando:** os resultados medidos estão registrados e as falhas críticas, corrigidas.

---

## 8. O que preciso de você agora

1. ✅ Já recebido e fechado: `node --test`, `git status`, CHANGELOG, `sw.js`, marés e telas de Saída/Volta (seção 0).
2. O resultado das pendências 1 a 5 da tabela da seção 0, de preferência de uma vez só.
3. Depois de tocar em **Definir** na Saída e na Volta, um print do cartão "Meu horário" (opcional).
4. A autorização de uso dos dados da DHN, se você já tiver.
5. Autorizar a Etapa 3 (números e frases) como próximo assunto, ou escolher outra.

> Previsão de modelo não é certeza e não substitui a Marinha, a Defesa Civil, os Bombeiros nem o julgamento de quem vai à água. ⚪ é "sem avaliação", nunca "seguro".





-------------------------------------------------------------------







**Data:** 26/11/2026, 15h15 (atualizado) · **Responsável:** Alexandre
**Legenda:** ✅ confirmado no material da conversa · 🔎 inferência · ❓ não verificado ou sem informação

---

## 1. Visão e requisitos

**O que é:** um PWA estático (GitHub Pages, `climabaixada.com.br`) que ajuda a decidir se é seguro ir ao mar na Baixada Santista. Combina previsão, marés, balneabilidade e semáforo (🟢🟡🔴⚪) para caiaque, surfe, pesca, "Meu Dia" (tempo geral) e Jogo do Santos.

**Requisitos fixos**
- **Segurança primeiro.** ⚪ significa "sem avaliação", nunca "seguro". Na dúvida, vale o mais conservador.
- Todo dado deve mostrar fonte, horário e validade. Dado velho é marcado.
- Veredito e derivados (melhor hora, janelas, avisos) saem da mesma função e nenhum derivado é mais otimista que o veredito.
- Cor sempre com emoji e texto. Toque ≥ 44 px. Leitura ao sol. PWA offline.
- Toda mudança em regra de segurança tem teste que falha antes e passa depois, mais entrada no CHANGELOG.
- Mudanças pequenas, com backup (`index-backup.html`), contagem de resultados no Command+F e critério de "deu certo / deu errado".
- Alexandre é leigo e usa Mac. Instruções passo a passo, sem gambiarra.

**Regras do semáforo (código atual, `REGRAS`)**
- **Caiaque:** 🟡 vento > 10 nós ou onda > 0,8 m. 🔴 vento ≥ 15 nós, rajada > 20 nós ou onda > 1,0 m.
- **Efeito canal:** 🔴 com aviso grave quando há vazante (ou maré parada/indefinida, tratada como vazante), vento entre 112° e 248° e acima de 12 nós.
- **Surfe (iniciante):** 🔴 onda > 1,5 m, vento ≥ 18 nós ou ≥ 15 nós onshore. 🟡 onda > 1,0 m ou < 0,3 m.
- **Trovoada:** código ≥ 95 é 🔴. Chance de chuva ≥ 60% é 🟡.

---

## 2. Decisões já tomadas

| Decisão | Motivo |
|---|---|
| Continuar no PWA agora e preparar a base para escalar | Menor custo e manutenção mínima |
| Notificações e lojas (via Capacitor) ficam para depois | Exigem servidor e verba; entram com tração |
| Publicar `index.html` e `dados.json` juntos quando ambos mudarem | Evita dado novo com tela antiga |
| Avaliação manual vira ⚪ após 48 h; "papo velho" após 24 h (🔎 o código recente usa um selo de "desatualizado" após 6 h) | Cinza nunca é "seguro" |
| Maré indefinida ou parada é tratada como vazante | Segurança |
| Hora nunca é mais otimista que o veredito manual do dia (`limitaHora`) | Coerência |
| Janela de horário nunca é mais otimista que o veredito (`limitaJanela`) | Coerência |
| Bola do dia: Surf mostra o nível do surfe (`d.s`). As demais sub-abas continuam com o nível do caiaque (`d.k`), por ser o mais conservador | A bola do Surf contradizia o semáforo por hora |
| Cache do GitHub primeiro (máx. 3 h), depois Open-Meteo direto | Menos chamadas |
| `sw.js` busca na rede primeiro | Usuário vê a versão nova |
| Privacidade por padrão: preferências só no aparelho | LGPD |
| GoatCounter instalado para medir uso | Material para investidores |

---

## 3. Entregáveis: situação

### ✅ Concluído (com evidência)
- **Semáforo:** `kayakV`, `surfV`, trovoada, chance de chuva, dado incompleto nunca verde. Teste em `semaforo.test.mjs`.
- **`limitaJanela`** (22/11) e **`limitaHora`** (26/11), com testes.
- **`hora-ligacao.test.mjs`:** 9 testes aprovados. Suíte completa: **79 aprovados, 0 falhas**. A prova de regressão (sem as duas chamadas de `limitaHora`, 3 testes falham) foi feita e a cópia apagada.
- **`git status`** limpo na `main`. ✅ Reconfirmado hoje, ~15h (`## main...origin/main`).
- **Bola do dia por aba (Surf × Caiaque), publicada hoje.** O `index.html` usa `EMO[S.sub=='surfe'?d.s:d.k]:dayIcon(i)`. O `grep` deu 0 resultados para o trecho antigo e 1 para o novo. Na tela, o Dom 29 aparece 🟡 em Surf e 🔴 em Caiaque. É mudança de exibição: nenhuma regra de segurança foi alterada e não há entrada no CHANGELOG.
- **`periodoInfo`** (cards Manhã, Almoço, Tarde e Noite), com `PERIODO` congelado e testes.
- **`mare-tendencia.mjs`** (vazante, enchente, parada, indefinida) com testes. Ligação `kayakV` → `tv`/`cons` conferida por leitura de código.
- **Rolagem** ao trocar de dia e aba, botão "Volta pra riba", ajuste dos ícones das abas, nova seção Jogo do Santos.
- **Notícias:** 4 fontes, workflow e script.
- **Dados:** `gerar-dados.mjs` com 5 tentativas e recusa de dado incompleto; `atualizar-cetesb.mjs` (API ArcGIS); `atualizar-cptec.mjs`; `atualizar-cache.mjs` v2 (2 modelos, `weather_code`).
- **Marés 2027:** quatro blocos (jan–mar, abr–jun, jul–set, out–dez) transcritos da DHN. Montagem em `montar-mares-2027.mjs`, validação em `validar-mares.mjs`, e quatro lacunas de janeiro conferidas na MeteoConsult.
- **PWA:** manifest com ícones `?v=5`, `sw.js` (versão mais recente no canvas: `clima-v16`).

### 🟡 Em andamento ou aplicação não confirmada
- **Limpeza do CHANGELOG** (você respondeu "Feito"). ❓ Confira com `ls | grep` (0 resultados) e `2026-11-22` (2 resultados).
- **Entrada de 26/11 no CHANGELOG** com os números reais (9 testes, 79 no total, prova de regressão). ❓ Não confirmei que foi aplicada nem commitada.
- **Melhor janela** (`bestRun` com hora inicial, `melhorJanela`, `tripBox`, `resumo`). ❓ Passos 3–5 de 22/11 sem confirmação de aplicação. 🔎 `autoDays` ainda pode citar horas que já passaram hoje.
- **`pstR` e `resumoDia`** só com horas futuras (passos de 25/11). ❓ Sem confirmação. Ficam fora do bloco testável.
- **Conselho caiçara** (`momBox`, `chuvaCaicara`) e frases de chuva. ❓ Há várias versões no canvas e não se sabe qual está no arquivo real.
- **Marés 2027 no ar.** ❓ Não confirmado que o `mares-2026-2027.json` foi gerado, validado e publicado como `mares.json`.
- **Crons** (`dados.yml` a cada 3 h, `noticias.yml` em minuto 41). ❓ Recomendados, sem confirmação.

### ⏳ Pendente
- Itens da revisão de interface (seção 5).
- Fonte única das regras entre `gerar-dados.mjs` e `REGRAS`.
- Dividir `index.html` em `index.html`, `style.css` e `app.js`.
- Ler `boletim_cetesb` do JSON em todos os textos fixos (há patch no canvas, aplicação não confirmada).
- Painel de métricas, estrutura de "região", termos de uso e privacidade.
- Acessibilidade fase 2 (`.strip` por teclado, `aria-live`, emojis soltos).
- ⚠️ **Bola do dia sem teste automático:** a lógica está dentro da `render()`, fora do bloco testável. Solução definitiva: função única `nivelDoDia(d, sub)` com teste (ver Etapa 3).
- Resumão, Pesca, Navio e Praia ainda usam a bola do Caiaque. É conservador, mas não é o ideal.

---

## 4. Lacunas, inconsistências e pontos a validar

1. **O "Próximo passo (tarefa 1)" colado na sua mensagem está desatualizado.** A tarefa "mover `TIDES` para `mares.json`" já foi feita: existe loader (`loadMares`), `mares.json` de 2026 e dados de 2027. O que falta é confirmar a publicação e a validação.
2. **Cobertura de teste dos três ajustes dos cards (sua tabela com ❓).**
   - ✅ O `semaforo.test.mjs` tem a seção "Cards de período" e o `periodo.test.mjs` existe. Eles cobrem: vermelho a partir de 1 mm (`FORTE_MM`), amarelo com chance ≥ 40% ou 0,3 mm, rajada ≥ 45 km/h, blusa ≤ 23 °C e protetor com calor ≥ 30 °C. O CHANGELOG de 25/11 cita "11 casos novos".
   - ❓ Os testes cobrem a **lógica** (`periodoInfo`), não a **renderização** (`period()`). Os três itens podem ser marcados como "cobertos na lógica", com a ressalva de que a tela não tem teste automático.
   - ❓ Confirmar com `node --test` no arquivo real, porque os dois arquivos de teste têm versões diferentes no canvas.
3. **Contagem de testes não bate.** Aparecem 31 (21/11), 23 e 24 (22/11) e 79 (26/11). Faltam entradas intermediárias. Vale a pena registrar a contagem real a cada commit.
4. **Versão do `sw.js`:** o canvas tem v13, v15 e v16. ❓ Qual está publicada?
5. **Open-Meteo gratuito é só para uso não comercial.** Ele não serve para monetização ou investimento sem plano pago ou outra fonte. Os termos atuais precisam ser conferidos.
6. **DHN:** as páginas de maré trazem restrição de reprodução. ❓ Falta confirmar a autorização para uso no app.
7. **Rótulos A/B (preamar/baixa-mar) de 2027** foram transcritos de PDF que não traz essa coluna, e a alternância não pode ser forçada (há dois "A" ou dois "B" seguidos). O `validar-mares.mjs` confere estrutura, não correção. ❓ Falta conferência por amostra com fonte independente.
8. **Duplicação de regras:** `gerar-dados.mjs` usa `>= 0.8` e o `REGRAS` usa `> 0.8`. Isso explica, em parte, frases como "perto de 1,0 m" com valor "até 0,8 m".
9. **Dependência manual:** o `dados.json` (avaliação) vence em 48 h e ainda precisa de atualização. 🔎 Os crons reduzem isso, mas não foi confirmado que rodam.
10. **Publicação do canvas:** a linha do `tailwind.js` e os fallbacks `canvas-asset:` não pertencem ao site real. ❓ Conferir se foram removidos do arquivo no ar.
11. **Itens sem informação:** número de usuários, orçamento, prazo de captação, quem substitui Alexandre na manutenção, e se existe revisão jurídica.
12. **Frase de trovoada no `gerar-dados.mjs` (linha 163).** ✅ O texto "risco de trovoadas ou chuva forte" aparece quando `trov || precip >= 10`. Quando o motivo é só chuva acumulada, a frase pode sugerir trovoada sem haver trovoada. O nível 🔴 está correto, só o texto confunde. Prioridade baixa, nenhuma mudança feita. Corrigir exige tornar a regra do dia uma função testável (Etapa 3).
13. **Pontos de hoje sem verificação:**
    - ❓ Os "issues" do Console do navegador subiram de 37 para 41. Não foi aberta a aba **Issues** e não se viu erro vermelho.
    - ❓ O `render.toString()` foi digitado no Terminal, onde não funciona, então não gerou resultado. A prova de que o código está no ar vem do `grep` e da tela.

---

## 5. Revisão de interface (22/11): resumo

| Prioridade | Problema | Natureza |
|---|---|---|
| Alta | Números e frases divergentes (onda, chuva, rajada). Caso da bola do Surf: ✅ resolvido em 26/11. Restante segue aberto | Regra e dado |
| Alta | Veredito abaixo da dobra em Surf e Caiaque | Layout |
| Alta | Janelas passadas tratadas como atuais; sem marcador de "agora" | Regra e UI |
| Média-alta | Verde à noite pode ser lido como "pode ir" | Cor e segurança |
| Média-alta | Amarelo usado como destaque de texto e bordas sem legenda | Cor |
| Média | Saída e Volta parecem vazios (❓ falta o que aparece ao tocar) | Possível bug |
| Média | "(manual)", "faz 0 h", decimais com ponto, "Mar de boa" antes de "Água imprópria" | Texto |
| Baixa | Navegação em 3 níveis, ícones mistos, cards dentro de cards, rodapé longo | Acabamento |

**Não avaliado por falta de material:** desempenho real, contraste medido, leitor de tela, telas pequenas e paisagem, modo offline, abas Pesca, Navio, Praia, Jogo e 10 dias.

---

## 6. Alternativas, prós, contras e recomendação

**A. Veredito acima da dobra**

| Opção | Prós | Contras |
|---|---|---|
| A1: formulário "Meu horário" recolhível, abaixo do veredito | Mudança pequena, mantém tudo | Sub-abas continuam altas |
| A2: sub-abas como chips com rolagem horizontal | Ganha muito espaço | Menos descobrível |
| A3: formulário só no fim da página | Simples | Recurso fica escondido |

**Recomendação: A1 agora, A2 depois de testar com usuários.**

**B. Regras do semáforo em uma fonte só**

| Opção | Prós | Contras |
|---|---|---|
| B1: arquivo de regras lido pelo app e pelo script | Fonte única, esforço moderado | Ajusta o fluxo de publicação |
| B2: script entrega dado bruto e o app calcula tudo | Elimina duplicação | Perde o texto automático do Capitão; mudança grande |
| B3: manter duplicado com teste de igualdade | Rápido | Duplicação continua |

**Recomendação: B1, com o teste de B3 como rede de segurança.**

**C. Janelas passadas**
- C1 ocultar (limpo, mas confuso).
- C2 riscar com "já passou" (transparente, ocupa espaço).
- **C3 riscar e mostrar a "próxima janela" (mais útil, mais lógica). Recomendado.**

**D. Noite no semáforo**
- **D1 cinza com 🌙 (claro e seguro, perde a informação de cor). Recomendado.**
- D2 manter a opacidade (sem trabalho, mantém o risco).

**E. Plataforma**
- **PWA agora (recomendado):** custo baixo, atualização imediata, sem loja. Contra: notificações limitadas.
- **Capacitor/loja depois:** presença nas lojas e notificações, mas exige servidor, conta de desenvolvedor e verba.

---

## 7. Próximas etapas por prioridade

### Etapa 1: Confirmar o estado real (hoje)
- **Responsável:** Alexandre.
- **Dependências:** nenhuma.
- **Ações:**
  - `git status` e `git log`.
  - `node --test` e anotar a contagem.
  - Command+F por `limitaHora` e `melhorJanela`.
  - Conferir a versão do `sw.js`.
  - Conferir a entrada de 26/11 no CHANGELOG.
- **Risco:** trabalhar sobre versão antiga.
- **Concluído quando:** você enviar a saída do `node --test` (0 falhas) e a lista do que está no arquivo. A conversa passa a ter um estado único e confirmado.

### Etapa 2: Fechar o CHANGELOG e registrar a cobertura dos cards
- **Responsável:** Alexandre, com apoio do assistente.
- **Dependência:** Etapa 1.
- **Ações:**
  - Aplicar a entrada de 26/11 em commit separado.
  - Marcar os três ajustes dos cards como "cobertos na lógica, sem teste de tela".
  - Registrar a contagem real de testes.
- **Risco:** documento contradizer o código.
- **Concluído quando:** o CHANGELOG não tem texto solto, as datas estão em ordem e há um commit `docs:`.

### Etapa 3: Coerência de números e frases (segurança)
- **Responsável:** Alexandre e assistente.
- **Dependência:** Etapa 1; a decisão B1 reduz o retrabalho.
- **Ações:**
  - Unificar limites (`>` ou `>=`) entre `gerar-dados.mjs` e `REGRAS`.
  - Citar o valor real nas frases.
  - Padronizar vírgula decimal.
  - Explicar a origem dos números.
  - Criar `nivelDoDia(d, sub)` como fonte única da bola do dia, com teste que falha antes e passa depois, e entrada no CHANGELOG.
  - Ajustar a frase de trovoada do `gerar-dados.mjs` (linha 163) para citar só chuva quando não houver trovoada.
- **Risco:** mexer em regra de segurança. Exige teste que falha antes e passa depois, mais CHANGELOG.
- **Concluído quando:** um mesmo dia mostra a mesma onda, chuva e rajada em todos os cartões, com legenda de ponto, modelos e janela de horas, e há um teste de igualdade entre as duas fontes de regras.

### Etapa 4: Consciência de tempo (janelas passadas e "agora")
- **Responsável:** Alexandre e assistente.
- **Dependência:** Etapas 1 e 3.
- **Ações:**
  - Aplicar `melhorJanela` em todas as telas.
  - Corrigir `autoDays` para hoje.
  - Marcar "já passou", mostrar a "próxima janela" e marcar o período em curso.
- **Risco:** divergência entre telas.
- **Concluído quando:** em qualquer horário de hoje não aparece janela já encerrada como recomendação, e os testes de janela passam.

### Etapa 5: Noite em cinza e cores só para semáforo
- **Responsável:** Alexandre e assistente.
- **Dependência:** nenhuma técnica; vale decidir a legenda.
- **Concluído quando:** verde, amarelo e vermelho só aparecem com emoji e texto de semáforo, e a noite aparece em cinza com 🌙 e legenda.

### Etapa 6: Marés 2026–2027 no ar
- **Responsável:** Alexandre.
- **Dependências:** autorização de uso da DHN (❓), conferência de rótulos A/B por amostra, `validar-mares.mjs` sem erros.
- **Risco:** rótulo trocado altera "vazante" e, com isso, o aviso de efeito canal.
- **Concluído quando:** `node validar-mares.mjs` dá 730 dias e 0 erros, a conferência por amostra bate, a tábua está publicada e funciona offline (`sw.js`), e os dias 31/12/2026 e 01/01/2027 abrem corretamente.

### Etapa 7: Layout do veredito (A1) e Saída/Volta
- **Responsável:** Alexandre e assistente.
- **Dependência:** você descrever o que aparece ao tocar em Saída e Volta.
- **Concluído quando:** o veredito aparece sem rolar em Surf e Caiaque, no celular, e o formulário funciona.

### Etapa 8: Automação e dados (reduzir trabalho manual)
- **Responsável:** Alexandre.
- **Ações:**
  - Confirmar os crons.
  - Ler `boletim_cetesb` do JSON.
  - Monitorar as Actions.
- **Concluído quando:** durante 7 dias seguidos o `dados.json` e a CETESB atualizam sozinhos, sem edição manual.

### Etapa 9: Base para escalar
- **Responsável sugerido:** desenvolvedor, com Alexandre decidindo.
- **Dependências:** Etapas 3, 6 e 8.
- **Ações:** dividir em `index.html`, `style.css` e `app.js`; estrutura de "região" (cidade, ponto, fonte de maré, fonte de balneabilidade); painel de métricas.
- **Risco:** quebrar `atualizar-cache.mjs`, que lê `PLACES` e `VB` do HTML por expressão regular.
- **Concluído quando:** todos os testes passam e o workflow de cache continua rodando.

### Etapa 10: Jurídico e comercial (antes de captar)
- **Responsável sugerido:** Alexandre e advogado.
- **Ações:** termos de uso, política de privacidade (LGPD), avisos de segurança, termos de Open-Meteo, CETESB, DHN e CPTEC, e plano pago ou fonte alternativa de dados.
- **Concluído quando:** os documentos estão publicados, há parecer sobre responsabilidade e os termos das fontes foram revistos.

### Etapa 11: Qualidade e acessibilidade
- Lighthouse, TalkBack, telas pequenas, paisagem, offline e abas ainda não avaliadas; acessibilidade fase 2.
- **Concluído quando:** os resultados medidos estão registrados e as falhas críticas, corrigidas.

---

## 8. O que preciso de você agora

1. A saída de `node --test` (o `git status` já foi reconfirmado hoje). Ela dá a contagem real e fecha a lacuna 3.
2. Se a limpeza do CHANGELOG e a entrada de 26/11 foram aplicadas.
3. O que aparece ao tocar em **Saída** e **Volta**.
4. Qual `sw.js` está publicado e se o `mares.json` com 2027 já está no ar.
5. Autorizar a Etapa 3 (números e frases) como próximo assunto, ou escolher outra.

> Previsão de modelo não é certeza e não substitui a Marinha, a Defesa Civil, os Bombeiros nem o julgamento de quem vai à água. ⚪ é "sem avaliação", nunca "seguro".












----------------------------------------------------------------------


**Data:** 26/11/2026, 10h · **Responsável:** Alexandre
**Legenda:** ✅ confirmado no material da conversa · 🔎 inferência · ❓ não verificado ou sem informação

---

## 1. Visão e requisitos

**O que é:** um PWA estático (GitHub Pages, `climabaixada.com.br`) que ajuda a decidir se é seguro ir ao mar na Baixada Santista. Combina previsão, marés, balneabilidade e semáforo (🟢🟡🔴⚪) para caiaque, surfe, pesca, "Meu Dia" (tempo geral) e Jogo do Santos.

**Requisitos fixos**
- **Segurança primeiro.** ⚪ significa "sem avaliação", nunca "seguro". Na dúvida, vale o mais conservador.
- Todo dado deve mostrar fonte, horário e validade. Dado velho é marcado.
- Veredito e derivados (melhor hora, janelas, avisos) saem da mesma função e nenhum derivado é mais otimista que o veredito.
- Cor sempre com emoji e texto. Toque ≥ 44 px. Leitura ao sol. PWA offline.
- Toda mudança em regra de segurança tem teste que falha antes e passa depois, mais entrada no CHANGELOG.
- Mudanças pequenas, com backup (`index-backup.html`), contagem de resultados no Command+F e critério de "deu certo / deu errado".
- Alexandre é leigo e usa Mac. Instruções passo a passo, sem gambiarra.

**Regras do semáforo (código atual, `REGRAS`)**
- **Caiaque:** 🟡 vento > 10 nós ou onda > 0,8 m. 🔴 vento ≥ 15 nós, rajada > 20 nós ou onda > 1,0 m.
- **Efeito canal:** 🔴 com aviso grave quando há vazante (ou maré parada/indefinida, tratada como vazante), vento entre 112° e 248° e acima de 12 nós.
- **Surfe (iniciante):** 🔴 onda > 1,5 m, vento ≥ 18 nós ou ≥ 15 nós onshore. 🟡 onda > 1,0 m ou < 0,3 m.
- **Trovoada:** código ≥ 95 é 🔴. Chance de chuva ≥ 60% é 🟡.

---

## 2. Decisões já tomadas

| Decisão | Motivo |
|---|---|
| Continuar no PWA agora e preparar a base para escalar | Menor custo e manutenção mínima |
| Notificações e lojas (via Capacitor) ficam para depois | Exigem servidor e verba; entram com tração |
| Publicar `index.html` e `dados.json` juntos quando ambos mudarem | Evita dado novo com tela antiga |
| Avaliação manual vira ⚪ após 48 h; "papo velho" após 24 h (🔎 o código recente usa um selo de "desatualizado" após 6 h) | Cinza nunca é "seguro" |
| Maré indefinida ou parada é tratada como vazante | Segurança |
| Hora nunca é mais otimista que o veredito manual do dia (`limitaHora`) | Coerência |
| Janela de horário nunca é mais otimista que o veredito (`limitaJanela`) | Coerência |
| Cache do GitHub primeiro (máx. 3 h), depois Open-Meteo direto | Menos chamadas |
| `sw.js` busca na rede primeiro | Usuário vê a versão nova |
| Privacidade por padrão: preferências só no aparelho | LGPD |
| GoatCounter instalado para medir uso | Material para investidores |

---

## 3. Entregáveis: situação

### ✅ Concluído (com evidência)
- **Semáforo:** `kayakV`, `surfV`, trovoada, chance de chuva, dado incompleto nunca verde. Teste em `semaforo.test.mjs`.
- **`limitaJanela`** (22/11) e **`limitaHora`** (26/11), com testes.
- **`hora-ligacao.test.mjs`:** 9 testes aprovados. Suíte completa: **79 aprovados, 0 falhas**. A prova de regressão (sem as duas chamadas de `limitaHora`, 3 testes falham) foi feita e a cópia apagada.
- **`git status`** limpo na `main` (naquele momento).
- **`periodoInfo`** (cards Manhã, Almoço, Tarde e Noite), com `PERIODO` congelado e testes.
- **`mare-tendencia.mjs`** (vazante, enchente, parada, indefinida) com testes. Ligação `kayakV` → `tv`/`cons` conferida por leitura de código.
- **Rolagem** ao trocar de dia e aba, botão "Volta pra riba", ajuste dos ícones das abas, nova seção Jogo do Santos.
- **Notícias:** 4 fontes, workflow e script.
- **Dados:** `gerar-dados.mjs` com 5 tentativas e recusa de dado incompleto; `atualizar-cetesb.mjs` (API ArcGIS); `atualizar-cptec.mjs`; `atualizar-cache.mjs` v2 (2 modelos, `weather_code`).
- **Marés 2027:** quatro blocos (jan–mar, abr–jun, jul–set, out–dez) transcritos da DHN. Montagem em `montar-mares-2027.mjs`, validação em `validar-mares.mjs`, e quatro lacunas de janeiro conferidas na MeteoConsult.
- **PWA:** manifest com ícones `?v=5`, `sw.js` (versão mais recente no canvas: `clima-v16`).

### 🟡 Em andamento ou aplicação não confirmada
- **Limpeza do CHANGELOG** (você respondeu "Feito"). ❓ Confira com `ls | grep` (0 resultados) e `2026-11-22` (2 resultados).
- **Entrada de 26/11 no CHANGELOG** com os números reais (9 testes, 79 no total, prova de regressão). ❓ Não confirmei que foi aplicada nem commitada.
- **Melhor janela** (`bestRun` com hora inicial, `melhorJanela`, `tripBox`, `resumo`). ❓ Passos 3–5 de 22/11 sem confirmação de aplicação. 🔎 `autoDays` ainda pode citar horas que já passaram hoje.
- **`pstR` e `resumoDia`** só com horas futuras (passos de 25/11). ❓ Sem confirmação. Ficam fora do bloco testável.
- **Conselho caiçara** (`momBox`, `chuvaCaicara`) e frases de chuva. ❓ Há várias versões no canvas e não se sabe qual está no arquivo real.
- **Marés 2027 no ar.** ❓ Não confirmado que o `mares-2026-2027.json` foi gerado, validado e publicado como `mares.json`.
- **Crons** (`dados.yml` a cada 3 h, `noticias.yml` em minuto 41). ❓ Recomendados, sem confirmação.

### ⏳ Pendente
- Itens da revisão de interface (seção 5).
- Fonte única das regras entre `gerar-dados.mjs` e `REGRAS`.
- Dividir `index.html` em `index.html`, `style.css` e `app.js`.
- Ler `boletim_cetesb` do JSON em todos os textos fixos (há patch no canvas, aplicação não confirmada).
- Painel de métricas, estrutura de "região", termos de uso e privacidade.
- Acessibilidade fase 2 (`.strip` por teclado, `aria-live`, emojis soltos).

---

## 4. Lacunas, inconsistências e pontos a validar

1. **O "Próximo passo (tarefa 1)" colado na sua mensagem está desatualizado.** A tarefa "mover `TIDES` para `mares.json`" já foi feita: existe loader (`loadMares`), `mares.json` de 2026 e dados de 2027. O que falta é confirmar a publicação e a validação.
2. **Cobertura de teste dos três ajustes dos cards (sua tabela com ❓).**
   - ✅ O `semaforo.test.mjs` tem a seção "Cards de período" e o `periodo.test.mjs` existe. Eles cobrem: vermelho a partir de 1 mm (`FORTE_MM`), amarelo com chance ≥ 40% ou 0,3 mm, rajada ≥ 45 km/h, blusa ≤ 23 °C e protetor com calor ≥ 30 °C. O CHANGELOG de 25/11 cita "11 casos novos".
   - ❓ Os testes cobrem a **lógica** (`periodoInfo`), não a **renderização** (`period()`). Os três itens podem ser marcados como "cobertos na lógica", com a ressalva de que a tela não tem teste automático.
   - ❓ Confirmar com `node --test` no arquivo real, porque os dois arquivos de teste têm versões diferentes no canvas.
3. **Contagem de testes não bate.** Aparecem 31 (21/11), 23 e 24 (22/11) e 79 (26/11). Faltam entradas intermediárias. Vale a pena registrar a contagem real a cada commit.
4. **Versão do `sw.js`:** o canvas tem v13, v15 e v16. ❓ Qual está publicada?
5. **Open-Meteo gratuito é só para uso não comercial.** Ele não serve para monetização ou investimento sem plano pago ou outra fonte. Os termos atuais precisam ser conferidos.
6. **DHN:** as páginas de maré trazem restrição de reprodução. ❓ Falta confirmar a autorização para uso no app.
7. **Rótulos A/B (preamar/baixa-mar) de 2027** foram transcritos de PDF que não traz essa coluna, e a alternância não pode ser forçada (há dois "A" ou dois "B" seguidos). O `validar-mares.mjs` confere estrutura, não correção. ❓ Falta conferência por amostra com fonte independente.
8. **Duplicação de regras:** `gerar-dados.mjs` usa `>= 0.8` e o `REGRAS` usa `> 0.8`. Isso explica, em parte, frases como "perto de 1,0 m" com valor "até 0,8 m".
9. **Dependência manual:** o `dados.json` (avaliação) vence em 48 h e ainda precisa de atualização. 🔎 Os crons reduzem isso, mas não foi confirmado que rodam.
10. **Publicação do canvas:** a linha do `tailwind.js` e os fallbacks `canvas-asset:` não pertencem ao site real. ❓ Conferir se foram removidos do arquivo no ar.
11. **Itens sem informação:** número de usuários, orçamento, prazo de captação, quem substitui Alexandre na manutenção, e se existe revisão jurídica.

---

## 5. Revisão de interface (22/11): resumo

| Prioridade | Problema | Natureza |
|---|---|---|
| Alta | Números e frases divergentes (onda, chuva, rajada) | Regra e dado |
| Alta | Veredito abaixo da dobra em Surf e Caiaque | Layout |
| Alta | Janelas passadas tratadas como atuais; sem marcador de "agora" | Regra e UI |
| Média-alta | Verde à noite pode ser lido como "pode ir" | Cor e segurança |
| Média-alta | Amarelo usado como destaque de texto e bordas sem legenda | Cor |
| Média | Saída e Volta parecem vazios (❓ falta o que aparece ao tocar) | Possível bug |
| Média | "(manual)", "faz 0 h", decimais com ponto, "Mar de boa" antes de "Água imprópria" | Texto |
| Baixa | Navegação em 3 níveis, ícones mistos, cards dentro de cards, rodapé longo | Acabamento |

**Não avaliado por falta de material:** desempenho real, contraste medido, leitor de tela, telas pequenas e paisagem, modo offline, abas Pesca, Navio, Praia, Jogo e 10 dias.

---

## 6. Alternativas, prós, contras e recomendação

**A. Veredito acima da dobra**

| Opção | Prós | Contras |
|---|---|---|
| A1: formulário "Meu horário" recolhível, abaixo do veredito | Mudança pequena, mantém tudo | Sub-abas continuam altas |
| A2: sub-abas como chips com rolagem horizontal | Ganha muito espaço | Menos descobrível |
| A3: formulário só no fim da página | Simples | Recurso fica escondido |

**Recomendação: A1 agora, A2 depois de testar com usuários.**

**B. Regras do semáforo em uma fonte só**

| Opção | Prós | Contras |
|---|---|---|
| B1: arquivo de regras lido pelo app e pelo script | Fonte única, esforço moderado | Ajusta o fluxo de publicação |
| B2: script entrega dado bruto e o app calcula tudo | Elimina duplicação | Perde o texto automático do Capitão; mudança grande |
| B3: manter duplicado com teste de igualdade | Rápido | Duplicação continua |

**Recomendação: B1, com o teste de B3 como rede de segurança.**

**C. Janelas passadas**
- C1 ocultar (limpo, mas confuso).
- C2 riscar com "já passou" (transparente, ocupa espaço).
- **C3 riscar e mostrar a "próxima janela" (mais útil, mais lógica). Recomendado.**

**D. Noite no semáforo**
- **D1 cinza com 🌙 (claro e seguro, perde a informação de cor). Recomendado.**
- D2 manter a opacidade (sem trabalho, mantém o risco).

**E. Plataforma**
- **PWA agora (recomendado):** custo baixo, atualização imediata, sem loja. Contra: notificações limitadas.
- **Capacitor/loja depois:** presença nas lojas e notificações, mas exige servidor, conta de desenvolvedor e verba.

---

## 7. Próximas etapas por prioridade

### Etapa 1: Confirmar o estado real (hoje)
- **Responsável:** Alexandre.
- **Dependências:** nenhuma.
- **Ações:**
  - `git status` e `git log`.
  - `node --test` e anotar a contagem.
  - Command+F por `limitaHora` e `melhorJanela`.
  - Conferir a versão do `sw.js`.
  - Conferir a entrada de 26/11 no CHANGELOG.
- **Risco:** trabalhar sobre versão antiga.
- **Concluído quando:** você enviar a saída do `node --test` (0 falhas) e a lista do que está no arquivo. A conversa passa a ter um estado único e confirmado.

### Etapa 2: Fechar o CHANGELOG e registrar a cobertura dos cards
- **Responsável:** Alexandre, com apoio do assistente.
- **Dependência:** Etapa 1.
- **Ações:**
  - Aplicar a entrada de 26/11 em commit separado.
  - Marcar os três ajustes dos cards como "cobertos na lógica, sem teste de tela".
  - Registrar a contagem real de testes.
- **Risco:** documento contradizer o código.
- **Concluído quando:** o CHANGELOG não tem texto solto, as datas estão em ordem e há um commit `docs:`.

### Etapa 3: Coerência de números e frases (segurança)
- **Responsável:** Alexandre e assistente.
- **Dependência:** Etapa 1; a decisão B1 reduz o retrabalho.
- **Ações:**
  - Unificar limites (`>` ou `>=`) entre `gerar-dados.mjs` e `REGRAS`.
  - Citar o valor real nas frases.
  - Padronizar vírgula decimal.
  - Explicar a origem dos números.
- **Risco:** mexer em regra de segurança. Exige teste que falha antes e passa depois, mais CHANGELOG.
- **Concluído quando:** um mesmo dia mostra a mesma onda, chuva e rajada em todos os cartões, com legenda de ponto, modelos e janela de horas, e há um teste de igualdade entre as duas fontes de regras.

### Etapa 4: Consciência de tempo (janelas passadas e "agora")
- **Responsável:** Alexandre e assistente.
- **Dependência:** Etapas 1 e 3.
- **Ações:**
  - Aplicar `melhorJanela` em todas as telas.
  - Corrigir `autoDays` para hoje.
  - Marcar "já passou", mostrar a "próxima janela" e marcar o período em curso.
- **Risco:** divergência entre telas.
- **Concluído quando:** em qualquer horário de hoje não aparece janela já encerrada como recomendação, e os testes de janela passam.

### Etapa 5: Noite em cinza e cores só para semáforo
- **Responsável:** Alexandre e assistente.
- **Dependência:** nenhuma técnica; vale decidir a legenda.
- **Concluído quando:** verde, amarelo e vermelho só aparecem com emoji e texto de semáforo, e a noite aparece em cinza com 🌙 e legenda.

### Etapa 6: Marés 2026–2027 no ar
- **Responsável:** Alexandre.
- **Dependências:** autorização de uso da DHN (❓), conferência de rótulos A/B por amostra, `validar-mares.mjs` sem erros.
- **Risco:** rótulo trocado altera "vazante" e, com isso, o aviso de efeito canal.
- **Concluído quando:** `node validar-mares.mjs` dá 730 dias e 0 erros, a conferência por amostra bate, a tábua está publicada e funciona offline (`sw.js`), e os dias 31/12/2026 e 01/01/2027 abrem corretamente.

### Etapa 7: Layout do veredito (A1) e Saída/Volta
- **Responsável:** Alexandre e assistente.
- **Dependência:** você descrever o que aparece ao tocar em Saída e Volta.
- **Concluído quando:** o veredito aparece sem rolar em Surf e Caiaque, no celular, e o formulário funciona.

### Etapa 8: Automação e dados (reduzir trabalho manual)
- **Responsável:** Alexandre.
- **Ações:**
  - Confirmar os crons.
  - Ler `boletim_cetesb` do JSON.
  - Monitorar as Actions.
- **Concluído quando:** durante 7 dias seguidos o `dados.json` e a CETESB atualizam sozinhos, sem edição manual.

### Etapa 9: Base para escalar
- **Responsável sugerido:** desenvolvedor, com Alexandre decidindo.
- **Dependências:** Etapas 3, 6 e 8.
- **Ações:** dividir em `index.html`, `style.css` e `app.js`; estrutura de "região" (cidade, ponto, fonte de maré, fonte de balneabilidade); painel de métricas.
- **Risco:** quebrar `atualizar-cache.mjs`, que lê `PLACES` e `VB` do HTML por expressão regular.
- **Concluído quando:** todos os testes passam e o workflow de cache continua rodando.

### Etapa 10: Jurídico e comercial (antes de captar)
- **Responsável sugerido:** Alexandre e advogado.
- **Ações:** termos de uso, política de privacidade (LGPD), avisos de segurança, termos de Open-Meteo, CETESB, DHN e CPTEC, e plano pago ou fonte alternativa de dados.
- **Concluído quando:** os documentos estão publicados, há parecer sobre responsabilidade e os termos das fontes foram revistos.

### Etapa 11: Qualidade e acessibilidade
- Lighthouse, TalkBack, telas pequenas, paisagem, offline e abas ainda não avaliadas; acessibilidade fase 2.
- **Concluído quando:** os resultados medidos estão registrados e as falhas críticas, corrigidas.

---

## 8. O que preciso de você agora

1. A saída de `node --test` e do `git status`.
2. Se a limpeza do CHANGELOG e a entrada de 26/11 foram aplicadas.
3. O que aparece ao tocar em **Saída** e **Volta**.
4. Qual `sw.js` está publicado e se o `mares.json` com 2027 já está no ar.
5. Autorizar a Etapa 3 (números e frases) como próximo assunto, ou escolher outra.

> Previsão de modelo não é certeza e não substitui a Marinha, a Defesa Civil, os Bombeiros nem o julgamento de quem vai à água. ⚪ é "sem avaliação", nunca "seguro".