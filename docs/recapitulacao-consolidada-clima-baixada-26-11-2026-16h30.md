# Recapitulação consolidada: Clima Baixada

**Data:** 26/11/2026, 16h30 · **Responsável:** Alexandre
**Substitui** os três blocos antigos de 26/11 (10h, 15h15 e 15h30). Pode apagar o arquivo antigo depois de guardar este.
**Legenda:** ✅ confirmado · 🔎 inferência · ❓ não verificado

---

## 0. Etapa 0: pendências fechadas (não repetir)

| # | Pendência | Resultado | Evidência |
|---|---|---|---|
| 1 | Testes | ✅ **79 aprovados, 0 falhas** (93,5 ms) | Saída do `node --test` |
| 2 | `melhorJanela` no arquivo | ✅ 3 ocorrências de `melhorJanela(`: definição (linha 929), `resumo()` (1118) e `tripBox` (1155) | `grep -c` |
| 3 | Erro "lám baixo" da nota do Resumão | ✅ 0 ocorrências; "lá embaixo" aparece 1 vez | `grep -c` |
| 4 | Data dos cards de período | ✅ **25/11/2026** (commit `ba18b6e`, `periodo.test.mjs`) | `git log` |
| 5 | `mares.json` com 2027 no ar | ✅ Publicado, último dia `2027-12-31` (commit local `d7d29ac`, 25/11) | Captura do site |
| 6 | `git status` | ✅ Vazio na verificação mais recente | Terminal |
| 7 | Dois arquivos de recapitulação | 🔎 Provavelmente resolvido (`git status` vazio). Confirmar com `ls recapitulacao*` | — |
| 8 | `sw.js` do repositório | ✅ `clima-v19`: rede primeiro com `no-cache`, cache só como plano B | Arquivo |
| 9 | Marés 2026 e 2027 | ✅ Conferidas por você (não revisar de novo) | Você informou |
| 10 | Saída e Volta | ✅ Abrem o seletor de hora nativo do Android. Não é bug | Capturas |
| 11 | Semáforo na tela | ✅ Surf e Caiaque 🔴 de 05h a 18h, noite apagada | Captura |
| 12 | Bola do dia (Surf × Caiaque) | ✅ Linha 1651: `EMO[S.sub=='surfe'?d.s:d.k]`. Mudança só de exibição | `grep` + tela |
| 13 | Crons | ✅ Ver seção 3 | CHANGELOG de 21/11 |

**Ainda aberto na Etapa 0 (só conferências):**
- ❓ Ver o cartão "Meu horário" depois de tocar em **Definir** (opcional).
- ❓ Confirmar no navegador que o service worker ativo é o `clima-v19` (DevTools, aba Application).
- ❓ Aba **Issues** do Console (subiu de 37 para 41; sem erro vermelho visto).
- ❓ Autorização de uso dos dados da DHN.

---

## 1. Visão e requisitos

**O que é:** PWA estático (GitHub Pages, `climabaixada.com.br`) para decidir se é seguro ir ao mar na Baixada Santista. Combina previsão, marés, balneabilidade e semáforo (🟢🟡🔴⚪) para caiaque, surfe, pesca, "Meu Dia" e Jogo do Santos.

**Requisitos fixos**
- Segurança primeiro. ⚪ é "sem avaliação", nunca "seguro". Na dúvida, vale o mais conservador.
- Todo dado mostra fonte, horário e validade. Dado velho é marcado.
- Veredito e derivados (melhor hora, janelas, avisos) saem da mesma função e nenhum derivado é mais otimista que o veredito.
- Cor sempre com emoji e texto. Toque ≥ 44 px. Leitura ao sol. PWA offline.
- Mudança em regra de segurança: teste que falha antes e passa depois, mais entrada no CHANGELOG.
- Mudanças pequenas, com backup (`index-backup.html`), contagem de resultados no Command+F e critério de "deu certo / deu errado".
- Alexandre é leigo e usa Mac: passo a passo, sem gambiarra.

**Regras do semáforo (`REGRAS`)**
- **Caiaque:** 🟡 vento > 10 nós ou onda > 0,8 m. 🔴 vento ≥ 15 nós, rajada > 20 nós ou onda > 1,0 m.
- **Efeito canal:** 🔴 com aviso grave com vazante (ou maré parada, indefinida ou ausente, tratadas como vazante), vento de 112° a 248° e acima de 12 nós.
- **Surfe (iniciante):** 🔴 onda > 1,5 m, vento ≥ 18 nós ou ≥ 15 nós onshore. 🟡 onda > 1,0 m ou < 0,3 m.
- **Trovoada:** código ≥ 95 é 🔴. Chance de chuva ≥ 60% é 🟡.
- **Cards de período:** chuva 🔴 a partir de 1 mm (ou chance ≥ 60% com ≥ 0,3 mm); 🟡 com chance ≥ 40% ou ≥ 0,3 mm; chance ausente = ⚪; rajada ≥ 45 km/h sobe para 🟡.

---

## 2. Decisões já tomadas

| Decisão | Motivo |
|---|---|
| PWA agora; lojas e notificações (Capacitor) depois | Menor custo e manutenção |
| Publicar `index.html` e `dados.json` juntos quando ambos mudarem | Evita dado novo com tela antiga |
| Avaliação manual: "papo velho" após 24 h, ⚪ após 48 h (🔎 o código recente usa selo "desatualizado" após 6 h) | Cinza nunca é "seguro" |
| Maré parada, indefinida ou ausente = vazante | Segurança |
| `limitaHora`: hora nunca mais otimista que o veredito manual do dia | Coerência |
| `limitaJanela`: janela nunca mais otimista que o veredito | Coerência |
| Bola do dia: Surf mostra `d.s`; as demais sub-abas mostram `d.k` (caiaque, mais conservador) | A bola do Surf contradizia o semáforo por hora |
| Cache do GitHub primeiro (máx. 3 h), depois Open-Meteo direto | Menos chamadas |
| `sw.js` busca na rede primeiro | Usuário vê a versão nova |
| Preferências só no aparelho; GoatCounter para medir uso | LGPD e métricas |

---

## 3. Entregáveis

### ✅ Concluído
- **Semáforo:** `kayakV`, `surfV`, trovoada, chance de chuva, dado incompleto nunca verde (`semaforo.test.mjs`).
- **Maré:** `mare-tendencia.mjs` com testes. Em 25/11, `parada` passou a contar como vazante e maré ausente também (regra de segurança, no CHANGELOG).
- **`limitaJanela`** (22/11) e **`limitaHora`** (26/11), com testes. `hora-ligacao.test.mjs` tem 9 testes, com prova de regressão (sem as duas chamadas, 3 falham).
- **`periodoInfo`** (cards Manhã, Almoço, Tarde, Noite) com `PERIODO` congelado. `periodo.test.mjs` tem 13 casos.
- **Dados automáticos:**
  - `gerar-dados.mjs` com 5 tentativas (commit `96aff79`, 21/11) e recusa de dado incompleto.
  - `atualizar-cetesb.mjs`, `atualizar-cptec.mjs` e `atualizar-cache.mjs` v2.
- **Crons:**
  - `dados.yml`: 21h23, 06h23, 09h23, 12h23, 15h23 e 18h23 (Brasília) mais reserva às 08h47 (commit `aad9c03`).
  - `noticias.yml`: minutos 7, 22, 37 e 52 UTC (commits `007cc84` e `98dcf42`).
  - Execuções #38 a #47 do `dados.yml` concluídas com sucesso.
- **Marés 2026 e 2027:** publicadas e conferidas por você. Ferramentas: `montar-mares-2027.mjs` e `validar-mares.mjs`.
- **Interface:** rolagem, "Volta pra riba", ícones das abas, seção Jogo do Santos, notícias com 4 fontes.
- **PWA:** manifest com ícones `?v=5`; `sw.js` `clima-v19` no repositório.

### 🟡 Em andamento ou sem confirmação
- **Etapa 0 no CHANGELOG:** entrada pronta (artefato `changelog-26-11-etapa0`), falta colar e commitar.
- **`pstR` e `resumoDia`** só com horas futuras (passos de 25/11): ❓ sem confirmação de aplicação.
- **Conselho caiçara** (`momBox`, `chuvaCaicara`): ❓ há várias versões no canvas; não se sabe qual está no arquivo real.
- **`autoDays`:** 🔎 ainda pode citar horas que já passaram hoje.
- **Crons:** 🔎 o GitHub atrasa ou pula execuções (24/11: 11 h 28 min sem rodar; 25/11: 10 h 35 min). A reserva das 08h47 não apareceu nas 10 execuções vistas. ❓ A execução de 25/11 às 05:51 é anterior ao primeiro horário do cron. ❓ O selo "desatualizado" após 6 h não foi conferido na tela nesses dias.

### ⏳ Pendente
- Fonte única das regras entre `gerar-dados.mjs` e `REGRAS`.
- `nivelDoDia(d, sub)` com teste (a bola do dia hoje não tem teste automático).
- Resumão, Pesca, Navio e Praia ainda usam a bola do Caiaque (conservador, mas não ideal).
- Ler `boletim_cetesb` do JSON em todos os textos fixos.
- Dividir `index.html` em `index.html`, `style.css` e `app.js`.
- Painel de métricas, estrutura de "região", termos de uso e privacidade.
- Acessibilidade fase 2 (`.strip` por teclado, `aria-live`, emojis soltos).

---

## 4. Lacunas e inconsistências

1. **Contagem de testes não bate entre entradas:** 31 (21/11), 23 (22/11), 25 (25/11) e 79 (26/11). 🔎 Podem ser arquivos ou rodadas diferentes. Daqui em diante, registrar a contagem real a cada commit.
2. **Cards de período:** os testes cobrem a **lógica** (`periodoInfo`), não a **renderização** (`period()`). Marcar como "cobertos na lógica". ❓ A prova de regressão dos cards nunca foi feita.
3. **Duplicação de regras:** `gerar-dados.mjs` e `REGRAS` divergem. Exemplos: onda amarela `>= 0,8` contra `> 0,8`; surfe amarelo `> 1,2 m` contra `> 1,0 m`; surfe vermelho `> 1,8 m` contra `> 1,5 m`; direção "sul" 100°–260° contra 112°–248°. 🔎 Pode haver dia 🟢 ou 🟡 no `dados.json` com horas piores, porque `limitaHora` só sobe a hora.
4. **Frase de trovoada** (`gerar-dados.mjs`, linha 163): "risco de trovoadas ou chuva forte" aparece também quando só `precip >= 10`. O nível 🔴 está certo; o texto confunde.
5. **Open-Meteo gratuito** é só para uso não comercial. Conferir os termos antes de monetizar ou captar.
6. **DHN:** as páginas de maré trazem restrição de reprodução. ❓ Falta autorização.
7. **Rótulos A/B de 2027** vêm de PDF sem essa coluna; o validador confere estrutura, não correção. Você conferiu, mas ✅ não posso reverificar.
8. **Canvas × site real:** a linha do `tailwind.js` e os fallbacks `canvas-asset:` não pertencem ao site. ❓ Conferir se saíram do arquivo no ar.
9. **Sem informação:** número de usuários, orçamento, prazo de captação, quem mantém o app na sua ausência, revisão jurídica.

---

## 5. Revisão de interface (22/11)

| Prioridade | Problema | Natureza |
|---|---|---|
| Alta | Números e frases divergentes (onda, chuva, rajada). Bola do Surf ✅ resolvida; o resto segue aberto | Regra e dado |
| Alta | Veredito abaixo da dobra em Surf e Caiaque | Layout |
| Alta | Janelas passadas tratadas como atuais; sem marcador de "agora" | Regra e UI |
| Média-alta | Verde à noite pode ser lido como "pode ir" | Cor e segurança |
| Média-alta | Amarelo usado como destaque de texto e bordas sem legenda | Cor |
| Média | "(manual)", "faz 0 h", decimais com ponto, "Mar de boa" antes de "Água imprópria" | Texto |
| Baixa | Navegação em 3 níveis, ícones mistos, cards dentro de cards, rodapé longo | Acabamento |

**Não avaliado:** desempenho real, contraste medido, leitor de tela, telas pequenas e paisagem, modo offline, abas Pesca, Navio, Praia, Jogo e 10 dias.

---

## 6. Alternativas e recomendação

| Tema | Recomendação | Motivo |
|---|---|---|
| Veredito acima da dobra | A1: "Meu horário" recolhível, abaixo do veredito. A2 (chips) depois | Mudança pequena |
| Regras em uma fonte | B1: arquivo de regras lido pelo app e pelo script, com teste de igualdade | Fonte única |
| Janelas passadas | C3: riscar e mostrar a "próxima janela" | Mais útil |
| Noite no semáforo | D1: cinza com 🌙 | Claro e seguro |
| Plataforma | PWA agora; Capacitor depois | Custo baixo |

---

## 7. Etapas

| Etapa | Assunto | Situação |
|---|---|---|
| 0 | Verificações | ✅ Fechada (seção 0) |
| 1 | Confirmar estado real | ✅ Feita |
| 2 | Fechar CHANGELOG | 🟡 Falta colar a entrada da Etapa 0 e ajustar 2 linhas (ver abaixo) |
| 3 | Coerência de números e frases: unificar limites, `nivelDoDia(d, sub)`, frase de trovoada | ⏳ **Próxima** |
| 4 | Janelas passadas e "agora" (`autoDays`, próxima janela) | ⏳ Depende da 3 |
| 5 | Noite em cinza e cores só para semáforo | ⏳ |
| 6 | Marés no ar | 🟡 Publicadas; falta autorização da DHN |
| 7 | Layout do veredito (A1) | ⏳ |
| 8 | Automação: investigar atrasos dos crons, ler `boletim_cetesb` | ⏳ |
| 9 | Dividir o código, estrutura de "região" | ⏳ Depende de 3, 6 e 8 |
| 10 | Jurídico e comercial | ⏳ |
| 11 | Qualidade e acessibilidade | ⏳ |

**Etapa 3, primeiro passo (sem mudar nenhum número):** criar `nivelDoDia(d, sub)` como função pura dentro do bloco `SEMAFORO-INI/FIM`, com teste, e fazer a `render()` chamá-la.

---

## 8. Decisão pendente com você

Para a bola do dia no **Resumão**, qual regra vale?

- **A)** Mostrar o **pior nível** entre caiaque e surfe (recomendo, por segurança).
- **B)** Continuar mostrando só o caiaque.

Antes de eu escrever o passo a passo, preciso de:
1. `cp index.html index-backup.html` feito.
2. A saída de `sed -n '1,14p' semaforo.test.mjs`.
3. A trecho da `render()` com `EMO[S.sub=='surfe'?d.s:d.k]` (linha 1651 e 3 linhas em volta).

> Previsão de modelo não é certeza e não substitui a Marinha, a Defesa Civil, os Bombeiros nem o julgamento de quem vai à água. ⚪ é "sem avaliação", nunca "seguro".