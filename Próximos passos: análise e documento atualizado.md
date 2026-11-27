# Próximos passos: análise e documento atualizado em 27/11, 10h29

## 1. O que mudou desde a recapitulação de 26/11, 16h30

| Item da recapitulação | Situação agora |
|---|---|
| Seção 3, "Etapa 0 no CHANGELOG: falta colar" | ✅ Feito e conferido por você |
| Seção 3, "`nivelDoDia(d, sub)` com teste" | ✅ Feito: `nivel-dia.test.mjs` com 5 casos |
| Seção 3, "Resumão, Pesca, Navio e Praia usam a bola do Caiaque" | ✅ Resolvido: agora mostram o **pior** entre caiaque e surfe |
| Seção 8, "Decisão pendente" | ✅ Decidido: **opção A** (pior nível) |
| Contagem de testes | ✅ **84 aprovados, 0 falhas** (era 79) |
| Card da hora (`infoHTML`) | ✅ Surf mostra só 🏄 e Caiaque só 🛶. É mudança visual, não mexe em regra |
| Etapa 2 (CHANGELOG) | ✅ Fechada |
| Etapa 3, primeiro passo | ✅ Feito |

Daqui em diante, a Etapa 3 só tem dois itens abertos: **unificar os limites** do `gerar-dados.mjs` com o `REGRAS` e **corrigir a frase de trovoada**.

## 2. Análise: o que é mais importante agora

**Primeiro risco: o veredito do dia pode ser mais otimista que as horas.**
O `limitaHora` só sobe a hora até o nível do dia. Ele não faz o contrário. Se o `gerar-dados.mjs` usa um limite mais frouxo que o `REGRAS`, o dia pode sair 🟢 enquanto as horas ficam 🟡 ou 🔴. Isso contradiz o princípio de "nenhum derivado mais otimista que o veredito".

Comparando as duas fontes, pelo código que está no chat:

| Regra | `gerar-dados.mjs` | `REGRAS` | Mais conservador |
|---|---|---|---|
| Caiaque, vento vermelho | `> 15` | `≥ 15` | `REGRAS` |
| Caiaque, onda amarela | `≥ 0,8` | `> 0,8` | `gerar-dados` |
| Surfe, onda amarela | `> 1,2` | `> 1,0` | `REGRAS` |
| Surfe, onda vermelha | `> 1,8` | `> 1,5` | `REGRAS` |
| Surfe, vento vermelho | `> 15` | `≥ 18`, ou `≥ 15` com vento do mar | Depende da direção |
| Vento entre 10,0 e 10,9 nós | 🟢 | 🟡 (`> 10`) | `REGRAS` |
| Direção "sul" | 100° a 260° | 112° a 248° | `gerar-dados` (só afeta o texto) |

Os limites erram nos dois sentidos, então não dá para trocar tudo por um lado só. A regra é pegar, em cada linha, o **mais conservador**.

**Segundo risco: as janelas passadas** (`autoDays` pode citar horas que já passaram hoje). Também é segurança, mas depende da Etapa 3 estar fechada.

## 3. Ordem sugerida

**Passo 1: pequeno e visível (mesma função que você acabou de criar).**
O título e a cor do cartão "Avaliação do Capitão da Baixada" no Resumão ainda usam só `D.k`. Eles devem usar `nivelDoDia(d,'resumo')`. É a mesma lógica, o risco é baixo e o teste já cobre a regra.
Sobre o **aviso de efeito canal na aba Surf**: ele é uma regra de caiaque. Para decidir se é bug, preciso ver onde `x.k.warn` é exibido hoje. Mostrar esse aviso no Surf não é perigoso (é mais conservador), mas pode confundir.

**Passo 2: extrair a regra do dia do `gerar-dados.mjs`, sem mudar nenhum número.**
Hoje a regra roda solta no meio do script e não dá para testar. A ideia é criar uma função pura `avaliarDia(...)` num arquivo próprio e travar o comportamento atual com testes. Princípio: código testável.

**Passo 3: alinhar os limites, um número por vez.**
Cada troca leva um teste que falha antes e passa depois, mais uma linha no CHANGELOG. Dias que hoje são 🟢 podem virar 🟡, então o painel vai mostrar uma mudança visível.

**Passo 4: corrigir a frase de trovoada** (`gerar-dados.mjs`, linha 163). O nível 🔴 já está certo, só o texto confunde.

**Depois:** Etapa 4 (janelas passadas e "agora"), Etapa 5 (noite em cinza) e Etapa 7 (veredito acima da dobra).

## 4. Em paralelo, sem mexer em código

Estes itens dependem só de você:
- **DHN:** enviar um e-mail pedindo autorização de uso da tábua de marés. Posso redigir.
- **Open-Meteo:** o plano gratuito é só para uso não comercial. Isso precisa estar resolvido antes de qualquer monetização ou captação.
- **Service worker:** no navegador, abrir DevTools, **Application**, **Service Workers**, e confirmar que o ativo é o `clima-v19`.

## 5. O que preciso de você para o Passo 1

Estes comandos só leem, não alteram nada:

1. **Command+F** no `index.html` por `function resumo()`. Deve dar **1 resultado**. Cole a função inteira.
2. **Command+F** por `x.k.warn`. Cole o número de resultados e as linhas com 3 linhas antes e depois.

Para o Passo 2, confirme que o `gerar-dados.mjs` do repositório é o que está no chat. Rode no Terminal: `git log -1 --format='%h %ad %s' --date=short -- gerar-dados.mjs`. Se o commit for o `96aff79` ou posterior, ✅ tenho o arquivo certo. Se for anterior, ❌ não vou propor trocas e preciso do arquivo atual.

## 6. Itens que ficam de fora, para não misturar assuntos

Painel de métricas, estrutura de "região", termos de uso, divisão do `index.html` em três arquivos e acessibilidade fase 2. Todos dependem da Etapa 3 e das marés estarem resolvidas.

**Minha recomendação:** começar pelo Passo 1 e, depois dele, seguir para os Passos 2 a 4. Quer que eu comece pelo Passo 1? Me mande os dois resultados do item 5.