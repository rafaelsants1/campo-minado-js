import { test } from "node:test";
import assert from "node:assert/strict";
import { LINHAS, COLUNAS, MINAS } from "../src/config.js";
import {
  criarTabuleiro,
  posicionarMinas,
  contarVizinhas,
  calcularVizinhas,
} from "../src/tabuleiro.js";

function contarMinas(tabuleiro) {
  let total = 0;
  for (const linha of tabuleiro) {
    for (const celula of linha) {
      if (celula.temMina) {
        total = total + 1;
      }
    }
  }
  return total;
}

test("criarTabuleiro monta uma matriz 8x8 de células fechadas e sem mina", () => {
  const tabuleiro = criarTabuleiro();

  assert.equal(tabuleiro.length, LINHAS);
  for (const linha of tabuleiro) {
    assert.equal(linha.length, COLUNAS);
    for (const celula of linha) {
      assert.deepEqual(celula, {
        temMina: false,
        revelada: false,
        bandeira: false,
        vizinhas: 0,
      });
    }
  }
});

test("as células do tabuleiro são objetos independentes", () => {
  const tabuleiro = criarTabuleiro();
  tabuleiro[0][0].bandeira = true;

  assert.equal(tabuleiro[0][1].bandeira, false);
  assert.equal(tabuleiro[1][0].bandeira, false);
});

test("posicionarMinas coloca exatamente MINAS minas", () => {
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const tabuleiro = criarTabuleiro();
    posicionarMinas(tabuleiro, 3, 3);
    assert.equal(contarMinas(tabuleiro), MINAS);
  }
});

test("posicionarMinas nunca coloca mina na célula da primeira jogada", () => {
  const cantos = [
    [0, 0],
    [0, COLUNAS - 1],
    [LINHAS - 1, 0],
    [LINHAS - 1, COLUNAS - 1],
    [3, 4],
  ];
  for (const [linha, coluna] of cantos) {
    for (let tentativa = 0; tentativa < 100; tentativa++) {
      const tabuleiro = criarTabuleiro();
      posicionarMinas(tabuleiro, linha, coluna);
      assert.equal(tabuleiro[linha][coluna].temMina, false);
    }
  }
});

test("posicionarMinas usa as posições fixas quando elas são passadas", () => {
  const tabuleiro = criarTabuleiro();
  posicionarMinas(tabuleiro, 0, 0, [
    [2, 2],
    [5, 6],
  ]);

  assert.equal(contarMinas(tabuleiro), 2);
  assert.equal(tabuleiro[2][2].temMina, true);
  assert.equal(tabuleiro[5][6].temMina, true);
});

test("contarVizinhas no canto olha só os 3 vizinhos que existem", () => {
  const tabuleiro = criarTabuleiro();
  posicionarMinas(tabuleiro, 7, 7, [
    [0, 1],
    [1, 0],
    [1, 1],
    [2, 2], // longe demais, não conta
  ]);

  assert.equal(contarVizinhas(tabuleiro, 0, 0), 3);
});

test("contarVizinhas no canto oposto, sem minas por perto, dá 0 e não quebra", () => {
  const tabuleiro = criarTabuleiro();
  posicionarMinas(tabuleiro, 0, 0, [[0, 1]]);

  assert.equal(contarVizinhas(tabuleiro, 7, 7), 0);
});

test("contarVizinhas na borda tem 5 vizinhos possíveis", () => {
  const tabuleiro = criarTabuleiro();
  posicionarMinas(tabuleiro, 7, 7, [
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 2],
    [1, 4],
    [1, 3], // os 5 vizinhos de [0][3] são [0,2] [0,4] [1,2] [1,3] [1,4]
  ]);

  assert.equal(contarVizinhas(tabuleiro, 0, 3), 5);
});

test("contarVizinhas no meio conta até 8 e ignora a própria célula", () => {
  const tabuleiro = criarTabuleiro();
  const ao_redor = [
    [2, 2],
    [2, 3],
    [2, 4],
    [3, 2],
    [3, 4],
    [4, 2],
    [4, 3],
    [4, 4],
  ];
  posicionarMinas(tabuleiro, 0, 0, ao_redor);
  assert.equal(contarVizinhas(tabuleiro, 3, 3), 8);

  tabuleiro[3][3].temMina = true;
  assert.equal(contarVizinhas(tabuleiro, 3, 3), 8);
});

test("calcularVizinhas grava o número em todas as células", () => {
  const tabuleiro = criarTabuleiro();
  posicionarMinas(tabuleiro, 7, 7, [[0, 1]]);
  calcularVizinhas(tabuleiro);

  assert.equal(tabuleiro[0][0].vizinhas, 1);
  assert.equal(tabuleiro[1][1].vizinhas, 1);
  assert.equal(tabuleiro[0][2].vizinhas, 1);
  assert.equal(tabuleiro[2][2].vizinhas, 0);
  assert.equal(tabuleiro[7][7].vizinhas, 0);
});
