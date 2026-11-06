import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ehNovoRecorde,
  lerRecorde,
  registrarVitoria,
} from "../src/recorde.js";

let pasta;
let arquivo;

beforeEach(() => {
  pasta = mkdtempSync(join(tmpdir(), "campo-minado-"));
  arquivo = join(pasta, "recorde.json");
});

afterEach(() => {
  rmSync(pasta, { recursive: true, force: true });
});

test("ehNovoRecorde: sem recorde anterior ou tempo menor vale; igual ou maior não", () => {
  assert.equal(ehNovoRecorde(50, null), true);
  assert.equal(ehNovoRecorde(30, 40), true);
  assert.equal(ehNovoRecorde(40, 40), false);
  assert.equal(ehNovoRecorde(50, 40), false);
});

test("lerRecorde devolve null quando o arquivo não existe", () => {
  assert.equal(lerRecorde(arquivo), null);
});

test("lerRecorde devolve null para arquivo estragado ou com valor inválido", () => {
  const invalidos = [
    "isso não é json",
    "{}",
    '{"melhorTempo": "rápido"}',
    '{"melhorTempo": -5}',
    "null",
  ];
  for (const conteudo of invalidos) {
    writeFileSync(arquivo, conteudo);
    assert.equal(lerRecorde(arquivo), null, `conteúdo: ${conteudo}`);
  }
});

test("a primeira vitória grava o recorde", () => {
  const registro = registrarVitoria(42, arquivo);

  assert.deepEqual(registro, { novoRecorde: true, melhor: 42, salvo: true });
  assert.equal(lerRecorde(arquivo), 42);
});

test("tempo pior não sobrescreve o recorde", () => {
  registrarVitoria(42, arquivo);

  const registro = registrarVitoria(60, arquivo);

  assert.deepEqual(registro, { novoRecorde: false, melhor: 42, salvo: false });
  assert.equal(lerRecorde(arquivo), 42);
});

test("tempo melhor substitui o recorde", () => {
  registrarVitoria(42, arquivo);

  const registro = registrarVitoria(30, arquivo);

  assert.equal(registro.novoRecorde, true);
  assert.equal(lerRecorde(arquivo), 30);
  assert.match(readFileSync(arquivo, "utf8"), /"melhorTempo": 30/);
});

test("se não der para gravar, avisa com salvo: false em vez de lançar erro", () => {
  const registro = registrarVitoria(42, join(pasta, "nao-existe", "recorde.json"));

  assert.deepEqual(registro, { novoRecorde: true, melhor: 42, salvo: false });
});
