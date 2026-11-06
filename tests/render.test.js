import { test } from "node:test";
import assert from "node:assert/strict";
import { LINHAS } from "../src/config.js";
import { pintar } from "../src/cores.js";
import { descreverCelula, renderizarTabuleiro } from "../src/render.js";
import { criarTabuleiro } from "../src/tabuleiro.js";

const semAnsi = (texto) => texto.replace(/\x1b\[[0-9;]*m/g, "");

function celula(mudancas = {}) {
  return {
    temMina: false,
    revelada: false,
    bandeira: false,
    vizinhas: 0,
    ...mudancas,
  };
}

test("casa fechada aparece como ■", () => {
  assert.equal(descreverCelula(celula()).simbolo, "■");
});

test("bandeira aparece como ⚑ em amarelo", () => {
  assert.deepEqual(descreverCelula(celula({ bandeira: true })), {
    simbolo: "⚑",
    cor: "amarelo",
  });
});

test("casa aberta sem vizinhas é ·, com vizinhas mostra o número", () => {
  assert.equal(descreverCelula(celula({ revelada: true })).simbolo, "·");
  assert.equal(
    descreverCelula(celula({ revelada: true, vizinhas: 3 })).simbolo,
    "3",
  );
});

test("mina aberta é * em vermelho", () => {
  assert.deepEqual(descreverCelula(celula({ revelada: true, temMina: true })), {
    simbolo: "*",
    cor: "vermelho",
  });
});

test("mina fechada só aparece com mostrarMinas, e bandeira continua à frente", () => {
  const mina = celula({ temMina: true });

  assert.equal(descreverCelula(mina).simbolo, "■");
  assert.equal(descreverCelula(mina, { mostrarMinas: true }).simbolo, "*");
  assert.equal(
    descreverCelula({ ...mina, bandeira: true }, { mostrarMinas: true })
      .simbolo,
    "⚑",
  );
});

test("o tabuleiro desenhado tem cabeçalho, bordas e uma linha por número", () => {
  const texto = semAnsi(renderizarTabuleiro(criarTabuleiro()));
  const linhas = texto.split("\n");

  assert.equal(linhas.length, LINHAS + 3);
  assert.match(linhas[0], /A B C D E F G H/);
  assert.match(linhas[2], /^1 \| ■ ■ ■ ■ ■ ■ ■ ■ \|$/);
  assert.match(linhas[LINHAS + 1], /^8 \|/);
});

test("pintar sempre fecha a cor com o reset", { skip: "NO_COLOR" in process.env || process.argv.includes("--sem-cor") }, () => {
  assert.equal(pintar("x", "vermelho"), "\x1b[31mx\x1b[0m");
  assert.equal(pintar("x", "verde"), "\x1b[32mx\x1b[0m");
});

test("pintar devolve o texto puro para uma cor desconhecida", () => {
  assert.equal(pintar("x", "roxo-inexistente"), "x");
});
