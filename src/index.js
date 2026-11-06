import {
  criarTabuleiro,
  posicionarMinas,
  calcularVizinhas,
} from "./tabuleiro.js";
import { renderizarTabuleiro } from "./render.js";
import { SIMBOLOS, SIMBOLOS_ASCII } from "./config.js";

const simbolos = process.argv.includes("--ascii") ? SIMBOLOS_ASCII : SIMBOLOS;

const tabuleiro = criarTabuleiro();
posicionarMinas(tabuleiro, 0, 0);
calcularVizinhas(tabuleiro);

console.log(renderizarTabuleiro(tabuleiro, { simbolos }));
console.log();
console.log(renderizarTabuleiro(tabuleiro, { simbolos, mostrarMinas: true }));
