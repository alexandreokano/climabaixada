# Legenda da bola do dia

**Estado:** ✅ li o `render()` e o `esportes()` que você colou. A legenda mostra o significado da bola do dia selecionado, usando a mesma `nivelDoDia`, então nunca contradiz a bola.

**Camada:** só interface. Não muda nenhuma regra de segurança, por isso não precisa de teste novo nem de CHANGELOG. ❓ A tela não tem teste automático.

**Backup antes de tudo.** No Terminal, na pasta `climabaixada`:

```bash
cp index.html index-backup.html
```

**Como desfazer:** `cp index-backup.html index.html`

## Passo 1: criar a função da legenda

1. No `index.html`, aperte **Command+F** e busque `function render(){`.
2. **Deve dar 1 resultado.** Se der outro número, pare e me avise.
3. Clique no começo dessa linha (tecla **Home**) e aperte **Enter** para abrir uma linha em branco acima. **Não apague nada.**
4. Suba para a linha em branco e cole:

```javascript
/* Legenda da bola do dia (só exibe; o nível vem de nivelDoDia). 0 🟢 1 🟡 2 🔴 3 ⚪ */
function legBola(){
  if(S.tab!='esportes')return '';
  const d=DAYS[S.day];if(!d)return '';
  const l=nivelDoDia(d,S.sub);
  const alvo=S.sub=='surfe'?'o surfe':S.sub=='caiaque'?'o caiaque':'o caiaque ou o surfe';
  const N=['Favorável.','Alerta.','Não vá.','Sem avaliação.'];
  const T=[
    'Para quem está começando, nenhum limite de segurança foi passado. Mesmo assim, olhe o mar antes de entrar.',
    'Para quem está começando, algum fator pede cautela (vento ou onda moderados, mar pequeno demais, ameaça de chuva). Só com muito cuidado e perto da praia.',
    `Para quem está começando, ${alvo} passa de um limite de segurança: onda alta, vento ou rajada forte, chuva forte ou risco de raios.`,
    'Não há avaliação válida para este dia. Cinza nunca quer dizer seguro.'
  ];
  return `<div class="note"><b>${EMO[l]} ${N[l]}</b> ${T[l]}</div>`;
}
```

5. **Command+S.**
6. **Command+F** em `function legBola` deve dar **1 resultado**.

Nada muda na tela ainda, porque ninguém chama a função.

## Passo 2: mostrar a legenda na tela

1. **Command+F** e busque:

```
$('view').innerHTML=old+avalBox()+VIEWS[S.tab]();
```

2. **Deve dar 1 resultado.**
3. Selecione **só essa linha** e troque por:

```javascript
$('view').innerHTML=old+legBola()+avalBox()+VIEWS[S.tab]();
```

4. **Command+S.**

## Conferir

Faça o commit e o push como de costume. No site, aperte **Command+Shift+R**.

| Onde olhar | Deu certo ✅ | Deu errado ❌ |
|---|---|---|
| Rolê no Mar, dia 🔴 (hoje) | Uma caixa amarelada logo abaixo dos dias: **🔴 Não vá.** com a frase aprovada | Caixa não aparece |
| Aba Surf | Texto diz "o surfe passa de um limite" | Texto diz "caiaque ou surfe" |
| Aba Caiaque | Texto diz "o caiaque passa de um limite" | — |
| Resumão, Pesca, Navio, Praia | Texto diz "o caiaque ou o surfe" | — |
| Trocar de dia | A legenda acompanha a bola do dia tocado | Legenda não muda |
| Meu Dia e Jogo do Santos | **Sem** legenda | Legenda aparece |
| Painel em branco | — | Abra o Console (**Command+Option+J**), copie a linha vermelha, desfaça com o backup e me mande |

## Pendente

- 🔎 A caixa fica **acima** do "Capitão deu o papo" e empurra o conteúdo uns 2 a 3 linhas para baixo. Se incomodar, o ajuste é só de posição, num passo separado.
- Os textos de 🟢 e 🟡 são propostas minhas. Só a frase do 🔴 foi aprovada por você. Diga se quer mudar algo.