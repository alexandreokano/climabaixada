Alexandre, com essas respostas fica claro o caminho: **continuar no PWA agora e preparar a base para escalar depois**. Suas respostas mudam três coisas.

## O que o plano de investidores muda

1. **Dados:** o plano gratuito do Open-Meteo é só para uso não comercial. Com investidor ou monetização, será preciso um plano pago ou outra fonte. Confira os termos atuais antes de captar.
2. **Cobertura:** a CETESB cobre só São Paulo. Para o Brasil, cada estado tem seu órgão de balneabilidade (por exemplo INEA no RJ e IMA em SC). As marés da Marinha existem por porto, então cada região precisa da sua tábua.
3. **Avaliação manual:** o `dados.json` feito à mão não escala, e a sua pergunta 5 ("quem mantém?") fica sem resposta. A solução é o **semáforo calculado por código**, com as regras do Capitão, que o painel já faz em parte (`kayakV`). A avaliação humana vira camada opcional.

Um detalhe de segurança: um app que diz "pode remar" traz **responsabilidade legal**. Investidor vai perguntar por termos de uso, política de privacidade (LGPD) e os avisos de "na dúvida, não vá". Vale falar com um advogado antes de ampliar.

## Correção sobre as marés

Eu disse que a tábua acabava em 16/11, mas no seu código ela vai até **30/11**. A tábua da Marinha que você mandou cobre o ano todo (até 31/12), então dá para gerar tudo de uma vez.

## Respostas que faltam

- **Usuários e orçamento:** sem número, meça. O GoatCounter já está instalado; em 2 a 3 meses você terá dados reais para mostrar a investidores.
- **Quem mantém:** para esta fase, **você**, com o mínimo de trabalho manual. A meta é reduzir isso a quase zero.

## Roteiro da versão 2

| Ordem | Tarefa | Esforço | Por quê |
|---|---|---|---|
| 1 | Mover `TIDES` do HTML para `mares.json` e completar com a tábua até dez/2026 | Baixo | Remove um ponto frágil e fecha o ano |
| 2 | Calcular o semáforo 100% por código, usando `dados.json` só para observações | Médio | Elimina a dependência do trabalho diário |
| 3 | Dividir o `index.html` em `index.html`, `style.css` e `app.js` | Médio | Facilita manter e entregar a outro desenvolvedor |
| 4 | Ler `boletim_cetesb` do JSON no rodapé em vez de texto fixo | Baixo | Evita dado desatualizado |
| 5 | Painel de métricas: abas mais usadas e instalações do PWA | Baixo | Material para investidores |
| 6 | Estrutura de "região" (cidade, ponto, fonte de maré e de balneabilidade) | Médio-alto | Pré-requisito para sair da Baixada |
| 7 | Termos de uso, privacidade e revisão dos termos das fontes | Baixo, mas essencial | Exigência para captar |

**Fica para depois**, como você disse: notificações (exigem servidor) e lojas (via Capacitor, quando houver recurso). Os dois entram quando houver tração ou verba.

## Decisão para a próxima conversa

Para começar, sugiro a **tarefa 1**, que é rápida e resolve a tábua. Você pode me mandar o `index.html` em duas partes ou só o trecho `const TIDES`. Quer seguir por aí?

## Roteiro da versão 2

| Ordem | Tarefa | Esforço | Por quê |
|---|---|---|---|
| 1 | Mover `TIDES` do HTML para `mares.json` e completar com a tábua até dez/2026 | Baixo | Remove um ponto frágil e fecha o ano |
| 2 | Calcular o semáforo 100% por código, usando `dados.json` só para observações | Médio | Elimina a dependência do trabalho diário |
| 3 | Dividir o `index.html` em `index.html`, `style.css` e `app.js` | Médio | Facilita manter e entregar a outro desenvolvedor |
| 4 | Ler `boletim_cetesb` do JSON no rodapé em vez de texto fixo | Baixo | Evita dado desatualizado |
| 5 | Painel de métricas: abas mais usadas e instalações do PWA | Baixo | Material para investidores |
| 6 | Estrutura de "região" (cidade, ponto, fonte de maré e de balneabilidade) | Médio-alto | Pré-requisito para sair da Baixada |
| 7 | Termos de uso, privacidade e revisão dos termos das fontes | Baixo, mas essencial | Exigência para captar |

**Fica para depois**, como você disse: notificações (exigem servidor) e lojas (via Capacitor, quando houver recurso). Os dois entram quando houver tração ou verba.

Próximo passo (tarefa 1)
Posso gerar:

mares.json com o ano todo de 2026, no formato {"2026-11-16":[["01:59","B",0.36], ...]}.
O trecho novo para o index.html, que carrega o JSON no lugar de const TIDES=[...] e mantém tideAt, dayTides e inWin funcionando.
A linha do sw.js para guardar mares.json em cache e funcionar offline.

------------


# Análise dos painéis (sem alterações no app)

Alexandre, analisei as 8 capturas das 11h44 às 11h47 de 22/11. Só avaliei o que aparece nelas e o que consta no código que você já me mostrou. Onde faltou evidência, eu digo.

## 1. Avaliação geral

**Pontos fortes**
- **Honestidade dos dados:** a fonte e a hora aparecem ("Open-Meteo, atualizado às 11:43"), junto de "Previsão de modelo, não certeza". Há também o selo de confiança (●●●) e o carimbo do Capitão ("22/11, 11:08").
- **Marés conferidas:** alta 01:36, baixa 07:31, alta 13:32 e baixa 19:25 batem com o `mares.json` de 22/11.
- **Cor com emoji e texto:** o veredito aparece como "🟡 ALERTA" e "🟢 08h–11h".
- **Toque e leitura ao sol:** os botões são grandes, a fonte é grande e o selecionado tem contorno laranja bem visível.
- **Hierarquia por assunto:** o Meu Dia traz quatro períodos, uma legenda de chuva e uma frase de ação ("Brisa firme"). O Rolê no Mar traz o semáforo hora a hora.
- **Identidade própria:** a linguagem caiçara é um diferencial, desde que não atrapalhe a segurança.

**Problemas gerais**
- **Navegação no topo:** três níveis empilhados (abas, dias e sub-abas) ocupam cerca de metade da primeira tela.
- **Veredito escondido:** nas telas Surf e Caiaque ele fica abaixo da dobra.
- **Números divergentes:** o mesmo dia mostra valores diferentes em cards diferentes.

## 2. Problemas e melhorias

**Consistência dos dados e da mensagem (o mais grave)**
- **Ondas:** o texto diz "ondas perto de 1,0 m" e os "Números do Capitão" dizem "até 0.8 m". No `gerar-dados.mjs`, `onda >= 0.8` dispara a frase "perto de 1,0 m". É o limite do amarelo, mas a frase exagera.
- **Chuva:** aparecem 3,5 mm (Capitão), 1,6 mm (Meu Dia, 10h–12h) e 1,0 mm (manhã). Podem ser janelas e pontos diferentes, mas ninguém explica isso ao usuário.
- **Rajadas:** o Capitão diz "12 nós" e o Meu Dia diz "29 km/h", cerca de 15,7 nós. A origem pode ser outra: ponto geográfico, modelos ou faixa de horas. Não consigo confirmar só pelas capturas.
- **Regras duplicadas:** o `gerar-dados.mjs` e o `REGRAS` do `index.html` calculam limites parecidos, mas não idênticos (por exemplo `>=0.8` contra `>0.8`). Isso fere a regra de ter uma única fonte de verdade.
- **Decimais:** "0.8 m" (ponto) aparece no mesmo cartão de "1,0 m" (vírgula).
- **Aviso genérico:** "Confirme a tábua de marés antes de sair" é repetido, mas o app já mostra a tábua.
- **Ícone do dia:** Dom, Seg e Ter mostram 🌧️ (chuva forte), mas o texto de domingo diz "só uns pingos, quase nada". O ícone passa mais alarme que o conteúdo.

**Consciência de tempo**
- **Janela já passada:** às 11h46 o app diz "Melhor hora pra cair na água hoje: 08h–11h". Essa janela já acabou.
- **Chuva em curso:** a chuva de 10h–12h está acontecendo e não há marcador de "agora".
- **Período da manhã:** a faixa 06h–12h mistura horas passadas e futuras.

**Usabilidade**
- **Campos vazios:** os campos Saída e Volta ("Meu horário") parecem caixas vazias, sem placeholder visível. Não sei se é bug ou se o texto só some no tema escuro. Preciso saber o que aparece ao tocar.
- **Formulário opcional no topo:** ele empurra o semáforo para baixo, nas duas sub-abas (Surf e Caiaque).
- **Sub-abas gigantes:** são 6 blocos de cerca de 310 px, que ocupam cerca de um terço da tela.
- **Estilo dos ícones:** são mistos. Surf, Caiaque e Pesca são ilustrações, enquanto Resumão, Navio e Praia são emojis. A altura do ícone da Pesca também destoa das outras.
- **Rótulo "(manual)":** "Caiaque (manual)" e "Surfe (manual)" convivem com "(automático)" nos semáforos. Pelo código, a avaliação do dia vem do script, que é automático. Se o rótulo é herança antiga, confunde.
- **Texto estranho:** "faz 0 h" soa mal.
- **Instruções longas:** o parágrafo de orientação no Rolê no Mar ocupa uma tela inteira antes do conteúdo.

**Acessibilidade e visual**
- **Botões apertados:** "Dom 22" quase encosta nas bordas do botão selecionado. Com a fonte maior (botões A+) ele pode cortar, porque o botão usa `nowrap` e `overflow:hidden`.
- **Botão "10 dias":** o texto fica mais baixo que nos vizinhos.
- **Cores dos períodos:** a borda da Manhã é vermelha (60%, 1,0 mm, 23 km/h) e as outras são amarelas, sem legenda da regra. Vermelho para 1 mm parece desproporcional, e o amarelo é quase universal.
- **Noite no semáforo:** as barras noturnas ficam verdes escuras ou amarelas apagadas. O app conta com a opacidade, mas verde à noite pode ser lido como "pode ir". Para iniciante, é um risco.
- **Gíria:** "Previsão firmeza" é gíria. Combina com a marca, mas é menos clara para turistas e leitores de tela.
- **Cartão claro:** o cartão cinza claro do aviso contrasta com o tema escuro. É legível, mas rompe a consistência.

**Não consigo avaliar com este material:** desempenho real, contraste medido, leitor de tela, telas pequenas ou paisagem, modo offline, e as abas Pesca, Navio, Praia, Jogo e 10 dias.

## 3. Prioridades urgentes

| # | Item | Impacto | Urgência |
|---|------|---------|----------|
| 1 | Números e frases divergentes (ondas, chuva, rajadas) | Perde a confiança do usuário e pode levar a decisão errada perto do limite | Alta |
| 2 | Veredito abaixo da dobra no Surf e no Caiaque | Quebra "veredito em 3 segundos" | Alta |
| 3 | Janelas passadas tratadas como atuais | Pode sugerir sair numa janela que já fechou, com chuva em curso | Alta |
| 4 | Verde à noite no semáforo | Risco de leitura errada para iniciante | Média-alta |
| 5 | Campos Saída e Volta aparentemente vazios | Recurso inutilizável, se for bug | Média |
| 6 | Rótulos ("manual", "faz 0 h"), decimais e aviso genérico | Credibilidade e polimento | Média |
| 7 | Navegação de três níveis e ícones mistos | Fadiga e inconsistência | Baixa-média |

## 4. Plano passo a passo

**Imediato (só texto, risco baixo)**
1. Padronizar as vírgulas decimais nos "Números do Capitão".
2. Trocar "ondas perto de 1,0 m" por uma frase que cite o valor real (ex.: "ondas de até 0,8 m, perto do limite").
3. Revisar "(manual)" e "faz 0 h".
4. Me dizer o que aparece ao tocar em Saída e Volta.

**Curto prazo (lógica pequena e testável)**
5. Marcar janelas passadas como "já passou" e mostrar "próxima janela".
6. Mostrar "agora" no período em curso.
7. Mostrar as barras noturnas em cinza com legenda "noite".
8. Explicar nos cartões a origem dos números (ponto, modelos, horas), com uma linha de legenda.

**Médio prazo (arquitetura)**
9. Unificar os limites do semáforo numa só fonte, lida pelo app e pelo `gerar-dados.mjs`, com teste que compare os dois.
10. Mover o formulário "Meu horário" para depois do veredito, recolhido.
11. Compactar as sub-abas.

**Longo prazo**
12. Padronizar o estilo dos ícones.
13. Medir desempenho (Lighthouse) e acessibilidade (TalkBack) no seu aparelho.
14. Revisar o tamanho do `index.html` (cerca de 168 KB, ainda sem confirmação) e dividir os arquivos se crescer.

## 5. Alternativas e recomendação

**A. Veredito acima da dobra**
- **A1:** manter as sub-abas e mover o formulário para um bloco recolhível abaixo do veredito.
  - Prós: pequena mudança, mantém tudo.
  - Contras: as sub-abas continuam altas.
- **A2:** sub-abas como chips de rolagem horizontal.
  - Prós: ganha muito espaço.
  - Contras: perde o visual de blocos e é menos descobrível.
- **A3:** formulário só no fim da página.
  - Prós: simples.
  - Contras: o recurso fica escondido.
- **Recomendo A1, e A2 depois de testar com usuários.**

**B. Limites do semáforo**
- **B1:** um arquivo de regras lido pelo app e pelo script.
  - Prós: uma fonte só, mudança moderada.
  - Contras: exige ajustar o fluxo de publicação.
- **B2:** o script só entrega dados brutos e o app calcula tudo.
  - Prós: elimina a duplicação.
  - Contras: perde o texto automático do Capitão e é uma mudança grande.
- **B3:** manter duplicado e acrescentar teste de igualdade.
  - Prós: rápido.
  - Contras: a duplicação continua.
- **Recomendo B1, com o teste de B3 como rede de segurança.**

**C. Janelas passadas**
- **C1:** ocultar.
  - Prós: tela limpa.
  - Contras: o usuário não entende por que sumiu.
- **C2:** riscar com "já passou".
  - Prós: transparente.
  - Contras: ocupa espaço.
- **C3:** mostrar "próxima janela" e riscar a passada.
  - Prós: mais útil.
  - Contras: exige mais lógica.
- **Recomendo C3.**

**D. Noite no semáforo**
- **D1:** cinza com 🌙.
  - Prós: claro e seguro.
  - Contras: perde a informação de cor da noite.
- **D2:** manter a opacidade atual.
  - Prós: sem trabalho.
  - Contras: mantém o risco.
- **Recomendo D1.**

## Autorização

Nada foi alterado. Se você concordar, o primeiro pacote que proponho é o **imediato (itens 1 a 3)**, só com troca de texto e vírgulas. Antes disso, preciso de duas coisas:

1. O que aparece ao tocar em **Saída** e **Volta**.
2. O texto exato (Ctrl+F) de "perto de 1,0" no arquivo, para eu indicar exatamente onde trocar.

**Posso preparar o passo a passo do pacote imediato?** Aguardo seu "autorizado".




--------





Alexandre, com os prints do celular dá para ser mais específico. 🔎 Tudo abaixo vem só das imagens, sem o CSS, então não proponho código ainda.

## Prioridade 1: segurança e leitura

| # | O que vejo nos prints | Ajuste | Princípio |
|---|---|---|---|
| 1 | O veredito do dia não aparece na primeira tela. Banner, título, slogan, cidades e campos ocupam cerca de 80% dela, e o primeiro card de conteúdo é "Confiança alta". | Compactar o topo (banner mais baixo, título e slogan menores). Colocar uma linha de veredito logo abaixo das abas, por exemplo "🟡 Chuva entre 13h e 15h, leve guarda-chuva". | Veredito em 3 segundos |
| 2 | **Amarelo usado como destaque.** "Confiança alta", "Dia quente" e "Brisa firme" estão em amarelo, e a faixa lateral de "Confiança" é verde. Amarelo é o "alerta" do semáforo. | Reservar verde, amarelo e vermelho só para o semáforo. O destaque de texto passa para branco em negrito ou azul. | Segurança primeiro |
| 3 | **Bordas coloridas dos cards sem legenda.** Manhã e Tarde têm borda amarela, Almoço tem borda vermelha, e nada diz o que cada cor significa. Cores como azul e verde em outros cards também parecem decorativas. | Cor de borda só para semáforo, e sempre com emoji e texto ("🔴 Chuva forte"). Cards neutros usam uma borda única. | Cor sempre com emoji e texto |
| 4 | "E a praia?" mostra "Mar de boa" primeiro e "🔴 Água imprópria" depois. | Colocar a informação mais restritiva no topo. | Na dúvida, o mais conservador |
| 5 | Formatação mista: "ondas até **0.7 m**", mas "**1,5 mm**" no resto. | Padronizar com vírgula (pt-BR). | Consistência |

## Prioridade 2: harmonia e consistência

| # | O que vejo | Ajuste |
|---|---|---|
| 6 | Os selects do planejador "Vai pra onde?" têm borda azul grossa, mas "Que horas você sai?" tem borda fina. | Todos os campos iguais. |
| 7 | "Usar minha localização" ocupa uns 90% da largura, "Usar o local do topo" ocupa 100%, e "Desligar e apagar histórico" tem largura própria. | Todos os botões do card com a mesma largura (100%) e a mesma altura. |
| 8 | A aba ativa tem borda laranja grossa que "vaza" da grade: o Meu Dia começa 8 px à esquerda da borda dos campos acima, e "10 dias" termina antes da borda direita. | Borda igual à das outras abas e anel por fora (proposta anterior). |
| 9 | O campo Bairro corta o nome ("Ponta d…"). | Reduzir o espaço do campo "Dados de" e dar mais largura ao Bairro, ou permitir duas linhas. |
| 10 | "🟢12:20" não tem espaço entre o emoji e a hora, e não diz o que é. | "🟢 Ao vivo 12:20". |
| 11 | As caixas cinza-claras de nota ("Escolhe a cidade e o bairro…", "Previsão é de computador…") têm fundo claro, e isso puxa o olho mais que o conteúdo. A de "Escolhe a cidade…" também vem depois do formulário, quando deveria vir antes. | Fundo escuro discreto e texto menor. |
| 12 | Cards dentro de cards (ícone dentro de "Quer o ícone…", "Vai pra onde?" dentro do card azul). | Usar um nível só. |

## Prioridade 3: acabamento

- O texto está bem grande em "Confiança" e "Dia quente" (4 linhas cada). Um corpo de texto menor, com os números em destaque, ajudaria a ver mais por tela.
- O rodapé de fontes está longo e em cinza de baixo contraste. Dá para recolher em "Ver fontes" (toque ≥ 44 px).
- O ícone de calendário do planejador mostra "July 17", que não corresponde à data real. Trocar por 📅 simples.

## O que manter

- Paleta escura, com boa leitura ao sol.
- Barra de botões com alvos de toque grandes.
- A frase "Previsão de modelo, não certeza" e a informação de fonte e hora.
- O planejador "Vai pra onde?", que é um diferencial.

## Como seguir

Os itens 1, 2, 3, 4 e 5 mexem em texto e derivados. Pelas regras anti-gambiarra, o veredito e as frases devem sair da **mesma função**, e qualquer regra nova precisa de teste e CHANGELOG. Os itens 6 a 12 são só visual.

Sugestão: um item por vez, começando pelo **2** (cores de destaque) e pelo **8** (bordas das abas, que já está no passo a passo). Para cada um, preciso do trecho real do arquivo (via Command+F), porque não vou propor troca de memória.

Quais números você aprova?


----------



| # | Mudança | Teste |
| --- | --- | --- |
| 1 | Cards de período: vermelho passa de 2 mm para 1 mm | ❓ sem cobertura confirmada |
| 2 | Cards de período: amarelo passa de chance ≥30% para chance ≥40% ou chuva ≥0,3 mm | ❓ sem cobertura confirmada |
| 3 | Novas dicas nos cards: rajada (45 km/h), blusa (23°C) e calor (30°C) | ❓ sem cobertura confirmada |