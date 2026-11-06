import { test } from "node:test";
import assert from "node:assert/strict";
import { interpretarComando } from "../src/entrada.js";

test("'r B3' abre a coluna B, linha 3", () => {
  assert.deepEqual(interpretarComando("r B3"), {
    valido: true,
    acao: "revelar",
    linha: 2,
    coluna: 1,
  });
});

test("'b B3' marca bandeira na mesma posição", () => {
  assert.deepEqual(interpretarComando("b B3"), {
    valido: true,
    acao: "bandeira",
    linha: 2,
    coluna: 1,
  });
});

test("ignora espaços sobrando e diferença entre maiúsculas e minúsculas", () => {
  const esperado = {
    valido: true,
    acao: "revelar",
    linha: 2,
    coluna: 1,
  };
  assert.deepEqual(interpretarComando("  R   b3  "), esperado);
  assert.deepEqual(interpretarComando("rB3"), esperado);
  assert.deepEqual(interpretarComando("R B3"), esperado);
});

test("aceita os cantos do tabuleiro", () => {
  const a1 = interpretarComando("r A1");
  const h8 = interpretarComando("r H8");

  assert.equal(a1.linha, 0);
  assert.equal(a1.coluna, 0);
  assert.equal(h8.linha, 7);
  assert.equal(h8.coluna, 7);
});

test("reconhece ajuda e sair, com atalhos", () => {
  for (const texto of ["ajuda", "AJUDA", "?", "h"]) {
    assert.deepEqual(interpretarComando(texto), {
      valido: true,
      acao: "ajuda",
    });
  }
  for (const texto of ["sair", "SAIR", "q"]) {
    assert.deepEqual(interpretarComando(texto), {
      valido: true,
      acao: "sair",
    });
  }
});

test("rejeita entradas que não são comandos, sempre com mensagem", () => {
  const invalidas = ["", "   ", "xyz", "r", "b", "B3", "r B", "r 3B", "r B33x"];

  for (const texto of invalidas) {
    const resultado = interpretarComando(texto);
    assert.equal(resultado.valido, false, `"${texto}" deveria ser inválido`);
    assert.equal(typeof resultado.mensagem, "string");
    assert.ok(resultado.mensagem.length > 0);
  }
});

test("rejeita coluna fora do tabuleiro e cita o intervalo válido", () => {
  const resultado = interpretarComando("r Z1");

  assert.equal(resultado.valido, false);
  assert.match(resultado.mensagem, /coluna Z/);
  assert.match(resultado.mensagem, /A a H/);
});

test("rejeita linha fora do tabuleiro (0 e 9)", () => {
  for (const texto of ["r A0", "r A9", "r A10"]) {
    const resultado = interpretarComando(texto);
    assert.equal(resultado.valido, false, `"${texto}" deveria ser inválido`);
    assert.match(resultado.mensagem, /linha/);
  }
});

test("não quebra com entrada nula ou indefinida", () => {
  assert.equal(interpretarComando(null).valido, false);
  assert.equal(interpretarComando(undefined).valido, false);
});
