# Passo 2a: tirar a regra do dia do `gerar-dados.mjs`

**Nenhum número muda.** Só movemos a regra para uma função pura (`avaliarDia`), que dá para testar.
**Princípio:** código testável e fonte única de regra.
**Ordem:** 3 commits pequenos. Os dois primeiros só **criam** arquivos que ninguém usa ainda, então não afetam o site. Só o terceiro mexe no `gerar-dados.mjs`.
**Como desfazer qualquer commit:** GitHub, aba **Commits**, abrir o commit, botão **...**, **Revert**.

## Passo 1: criar `avaliar-dia.mjs`

1. No GitHub, na raiz do repositório: **Add file**, **Create new file**.
2. Nome do arquivo: `avaliar-dia.mjs`
3. Cole **tudo** abaixo e clique em **Commit changes**.

```javascript
/* Regra do dia (caiaque e surfe iniciante). Função pura: sem rede e sem arquivos.
   Mudou uma regra? Atualize avaliar-dia.test.mjs e registre a mudança no CHANGELOG.md.
   Níveis: 0 verde, 1 amarelo, 2 vermelho. Vento e rajada em nós, onda em m, período em s, chuva em mm. */
export function avaliarDia({ vento, raj, precip, prob, trov, onda, per, ondaMin, ventoMin, dir }) {
  const sul = dir != null && dir > 100 && dir < 260;
  const motivos = [];

  // ----- Caiaque
  let k = 0;
  if (vento != null) {
    if (vento > 15 || (raj != null && raj > 20)) { k = 2; motivos.push('vento/rajadas acima do limite do caiaque'); }
    else if (vento >= 11 || (raj != null && raj > 15)) { k = Math.max(k, 1); motivos.push('vento moderado ou rajadas'); }
  }
  if (onda != null) {
    if (onda > 1.0) { k = 2; motivos.push('ondas acima de 1,0 m'); }
    else if (onda >= 0.8) { k = Math.max(k, 1); motivos.push('ondas de até ' + onda.toFixed(1).replace('.', ',') + ' m, perto do limite de 1,0 m'); }
  }
  if (per != null && per < 6 && vento >= 8) { k = Math.max(k, 1); motivos.push('mar curto e batido'); }
  if (trov || (precip != null && precip >= 10)) { k = 2; motivos.push('risco de trovoadas ou chuva forte'); }
  else if ((precip != null && precip >= 2) || (prob != null && prob >= 60)) { k = Math.max(k, 1); motivos.push('pancadas de chuva'); }

  // ----- Surfe iniciante
  let s = 0;
  if (onda != null && onda < 0.4) { s = 1; }
  if (onda != null && onda > 1.2) s = Math.max(s, 1);
  if (onda != null && onda > 1.8) s = 2;
  if (vento != null && vento > 15) s = 2;
  else if (vento != null && vento >= 11) s = Math.max(s, 1);
  if (trov || (precip != null && precip >= 10)) s = 2;
  else if ((precip != null && precip >= 2) || (prob != null && prob >= 60)) s = Math.max(s, 1);

  const diverge = (onda != null && ondaMin != null && onda - ondaMin > 0.3) || (vento != null && ventoMin != null && vento - ventoMin > 4);
  return { k, s, motivos, sul, diverge };
}
```

✅ **Deu certo:** o arquivo aparece na raiz do repositório.
❌ **Deu errado:** o GitHub mostra erro ao salvar. Pare e me avise.

## Passo 2: criar `avaliar-dia.test.mjs`

1. **Add file**, **Create new file**.
2. Nome: `avaliar-dia.test.mjs`
3. Cole **tudo** abaixo e clique em **Commit changes**.

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { avaliarDia } from './avaliar-dia.mjs';

/* Testes de TRAVAMENTO: provam que a regra do dia continua igual à que já rodava.
   Os casos marcados "hoje" documentam limites que divergem do REGRAS do index.html.
   Eles serão tratados no passo 2c, com teste novo e CHANGELOG. */
const base = { vento: 5, raj: 8, precip: 0, prob: 10, trov: false, onda: 0.5, per: 9, ondaMin: 0.5, ventoMin: 5, dir: 90 };
const dia = (o = {}) => avaliarDia({ ...base, ...o });
const ks = r => [r.k, r.s];

test('dia calmo é verde para caiaque e surfe', () => {
  const r = dia();
  assert.deepEqual(ks(r), [0, 0]);
  assert.deepEqual(r.motivos, []);
});

test('vento 10,5 nós: verde (hoje; a hora já é amarela)', () => {
  assert.deepEqual(ks(dia({ vento: 10.5, ventoMin: 10.5 })), [0, 0]);
});

test('vento 11 nós: amarelo nos dois', () => {
  assert.deepEqual(ks(dia({ vento: 11, ventoMin: 11 })), [1, 1]);
});

test('vento exatamente 15 nós: amarelo (hoje; a hora já é vermelha)', () => {
  assert.deepEqual(ks(dia({ vento: 15, ventoMin: 15 })), [1, 1]);
});

test('vento 16 nós: vermelho nos dois', () => {
  assert.deepEqual(ks(dia({ vento: 16, ventoMin: 16 })), [2, 2]);
});

test('rajada: 21 nós é vermelho no caiaque; 16 nós é amarelo', () => {
  assert.deepEqual(ks(dia({ vento: 8, ventoMin: 8, raj: 21 })), [2, 0]);
  assert.deepEqual(ks(dia({ vento: 8, ventoMin: 8, raj: 16 })), [1, 0]);
});

test('onda 0,8 e 1,0 m: amarelo no caiaque, surfe verde', () => {
  assert.deepEqual(ks(dia({ onda: 0.8, ondaMin: 0.8 })), [1, 0]);
  assert.deepEqual(ks(dia({ onda: 1.0, ondaMin: 1.0 })), [1, 0]);
});

test('onda 1,1 m: caiaque vermelho, surfe verde (hoje; a hora do surfe já é amarela)', () => {
  assert.deepEqual(ks(dia({ onda: 1.1, ondaMin: 1.1 })), [2, 0]);
});

test('onda 1,6 e 1,8 m: surfe amarelo; 1,9 m: surfe vermelho (hoje; a hora fica vermelha acima de 1,5)', () => {
  assert.deepEqual(ks(dia({ onda: 1.6, ondaMin: 1.6 })), [2, 1]);
  assert.deepEqual(ks(dia({ onda: 1.8, ondaMin: 1.8 })), [2, 1]);
  assert.deepEqual(ks(dia({ onda: 1.9, ondaMin: 1.9 })), [2, 2]);
});

test('onda 0,3 m: surfe amarelo (mar pequeno), caiaque verde', () => {
  assert.deepEqual(ks(dia({ onda: 0.3, ondaMin: 0.3 })), [0, 1]);
});

test('mar curto (período < 6 s) com vento >= 8 nós: caiaque amarelo; com vento 7: verde', () => {
  const a = dia({ per: 5, vento: 8, ventoMin: 8 });
  assert.deepEqual(ks(a), [1, 0]);
  assert.ok(a.motivos.includes('mar curto e batido'));
  assert.deepEqual(ks(dia({ per: 5, vento: 7, ventoMin: 7 })), [0, 0]);
});

test('chuva e trovoada', () => {
  const a = dia({ precip: 10 });
  assert.deepEqual(ks(a), [2, 2]);
  assert.deepEqual(a.motivos, ['risco de trovoadas ou chuva forte']);
  const b = dia({ precip: 2 });
  assert.deepEqual(ks(b), [1, 1]);
  assert.deepEqual(b.motivos, ['pancadas de chuva']);
  assert.deepEqual(ks(dia({ prob: 60 })), [1, 1]);
  assert.deepEqual(ks(dia({ precip: 1.9, prob: 59 })), [0, 0]);
  assert.deepEqual(ks(dia({ trov: true })), [2, 2]);
});

test('direção sul: de 101 a 259 graus (100 e 260 ficam de fora)', () => {
  assert.equal(dia({ dir: 180 }).sul, true);
  assert.equal(dia({ dir: 101 }).sul, true);
  assert.equal(dia({ dir: 100 }).sul, false);
  assert.equal(dia({ dir: 260 }).sul, false);
  assert.equal(dia({ dir: null }).sul, false);
});

test('modelos divergem: onda > 0,3 m ou vento > 4 nós de diferença', () => {
  assert.equal(dia({ onda: 1.0, ondaMin: 0.5 }).diverge, true);
  assert.equal(dia({ onda: 1.0, ondaMin: 0.8 }).diverge, false);
  assert.equal(dia({ vento: 10, ventoMin: 5 }).diverge, true);
  assert.equal(dia({ vento: 10, ventoMin: 6 }).diverge, false);
});

test('motivos saem na ordem: vento, onda, chuva', () => {
  const r = dia({ vento: 16, ventoMin: 16, onda: 1.2, ondaMin: 1.2, precip: 12 });
  assert.deepEqual(r.motivos, [
    'vento/rajadas acima do limite do caiaque',
    'ondas acima de 1,0 m',
    'risco de trovoadas ou chuva forte'
  ]);
});
```

✅ **Deu certo:** os dois arquivos aparecem na raiz.

## Passo 3: rodar os testes e guardar a saída "antes"

No Terminal, na pasta `climabaixada`, uma linha por vez:

```bash
git pull
```

```bash
node --test
```

- ✅ **Deu certo:** **99 aprovados, 0 falhas** (84 de antes + 15 novos).
- ❌ **Deu errado:** qualquer falha, ou um total diferente de 99. Pare, cole a saída e **não** vá ao Passo 4.

Agora guarde a saída do gerador **com o código antigo** (ele ainda não foi alterado):

```bash
OUT=antes.json node gerar-dados.mjs
```

- ✅ **Deu certo:** termina com `Gravado antes.json: 5 dias.`
- ❌ **Deu errado:** aparece `::error::`. Pode ser rede do Open-Meteo. Espere 2 minutos e repita. Se persistir, me avise.

## Passo 4: trocar o código no `gerar-dados.mjs` (3 edições, 1 commit)

No GitHub, abra `gerar-dados.mjs` e clique no lápis (**Edit**). Faça as 3 edições na ordem.

### Edição A: acrescentar o import

1. **Command+F** `import { readFile, writeFile } from 'node:fs/promises';` → **1 resultado**.
2. **Não apague nada.** Logo abaixo dessa linha, acrescente esta linha:

```javascript
import { avaliarDia } from './avaliar-dia.mjs';
```

### Edição B: apagar a regra antiga e chamar a função

1. **Command+F** `const sul = dir != null` → **1 resultado**. A linha de cima é `const dir = dirMedia(F);` e **fica**.
2. **Command+F** `const [dd, mm] = [date.slice(8, 10), date.slice(5, 7)];` → **1 resultado**.
3. Selecione do **início da linha** `const sul = ...` até o **início da linha** `const [dd, mm] = ...`. Isso pega `const sul`, `const motivos`, todo o bloco **Caiaque** (`let k = 0;` até `'pancadas de chuva'`) e todo o bloco **Surfe iniciante** (`let s = 0;` até `s = Math.max(s, 1);`), mais a linha em branco antes de `const [dd, mm]`.
4. Apague a seleção e cole no lugar (mantenha a linha em branco no fim):

```javascript
  const { k, s, motivos, sul, diverge } = avaliarDia({ vento, raj, precip, prob, trov, onda, per, ondaMin, ventoMin, dir });

```

### Edição C: apagar a linha `diverge` antiga

1. **Command+F** `const diverge = (onda != null` → **1 resultado**.
2. Apague **a linha inteira** e **não cole nada**. Se ficar, o código declara `diverge` duas vezes e quebra.

### Conferir antes de salvar

| Busca (Command+F) | Resultados esperados |
|---|---|
| `avaliarDia` | **2** (import e chamada) |
| `let k = 0` | **0** |
| `let s = 0` | **0** |
| `const diverge` | **0** |
| `const sul` | **0** |

Se algum número for diferente, **não salve** e me avise. Se der tudo certo, clique em **Commit changes**.

## Passo 5: provar que nada mudou

No Terminal:

```bash
git pull
```

```bash
node --check gerar-dados.mjs
```

- ✅ **Deu certo:** não escreve nada.
- ❌ **Deu errado:** mostra um erro de sintaxe. Cole a mensagem. Para voltar: **Revert** do commit do Passo 4.

```bash
OUT=depois.json node gerar-dados.mjs
```

```bash
diff antes.json depois.json
```

- ✅ **Deu certo:** o `diff` mostra **só a linha `avaliado_em`** (data e hora). Qualquer outra linha igual = nada mudou.
- 🔎 Se aparecerem outras linhas, pode ser que a previsão do Open-Meteo tenha atualizado entre as duas rodadas. Cole o `diff` para eu avaliar. **Não faça mais nada.**

Depois apague os dois arquivos de teste (eles não vão para o GitHub):

```bash
rm antes.json depois.json
```

```bash
node --test
```

- ✅ **Deu certo:** **99 aprovados, 0 falhas**.

## Passo 6: CHANGELOG

No GitHub, abra `CHANGELOG.md`, clique no lápis e cole **no topo** (sem apagar nada):

```markdown
## 2026-11-27 · Regra do dia extraída do gerador (sem mudar números)

**Motivo:** a regra do dia rodava solta no meio do `gerar-dados.mjs` e não tinha teste. Princípio: código testável.

**Mudanças:**
- Novo `avaliar-dia.mjs` com a função pura `avaliarDia`. O `gerar-dados.mjs` apenas a chama.
- **Nenhum limite mudou.** Conferido com `diff` entre a saída antes e depois: só `avaliado_em` difere.

**Testes:** novo `avaliar-dia.test.mjs` com 15 casos de travamento. Total: 99 aprovados, 0 falhas. Não houve caso que falhasse antes, porque não houve mudança de regra.

**Ainda não coberto:**
- ❓ Limites do dia divergem do `REGRAS` do `index.html` (vento 10,0 a 10,9 nós, vento exato de 15 nós, onda do surfe de 1,0 a 1,2 m e de 1,5 a 1,8 m). Ficam para o 2c, com teste novo.
- ❓ `avaliarDia` devolve 🟢 se todos os dados forem nulos. O gerador descarta esse dia antes de usá-lo; o teste de consistência dia × hora (2b) deve cobrir isso.
- ❓ A frase "trovoadas ou chuva forte" aparece também só com chuva ≥ 10 mm. O nível 🔴 está certo, o texto será ajustado depois.

**Como desfazer:** Revert dos commits do 2a.
```

## O que me mandar

1. A saída do `node --test` do Passo 3 (a linha de total).
2. O resultado do `diff` do Passo 5.
3. Se faltou ou sobrou algo nas contagens do Command+F do Passo 4.

**Próximo:** 2b, o teste de consistência dia × hora. Ele deve **falhar** nos casos divergentes, provando o problema antes de alinharmos limites no 2c.