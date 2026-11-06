// Cores ANSI. Cada função recebe um texto e devolve o texto pintado.
// O reset (\x1b[0m) é obrigatório no fim de toda cor, senão o terminal
// continua colorido depois do texto.

const RESET = "\x1b[0m";

export const CODIGOS = {
  vermelho: "\x1b[31m", // perigo, erro
  verde: "\x1b[32m", // sucesso
  amarelo: "\x1b[33m", // atenção
  azul: "\x1b[34m", // informação, menu
  magenta: "\x1b[35m", // especial
  ciano: "\x1b[36m", // bordas, títulos
  branco: "\x1b[37m", // texto comum
};

// Desliga as cores com a variável NO_COLOR (padrão no-color.org)
// ou com a flag --sem-cor.
const semCor = "NO_COLOR" in process.env || process.argv.includes("--sem-cor");

export function pintar(texto, cor) {
  const codigo = CODIGOS[cor];
  if (semCor || codigo === undefined) {
    return String(texto);
  }
  return codigo + texto + RESET;
}

export const vermelho = (texto) => pintar(texto, "vermelho");
export const verde = (texto) => pintar(texto, "verde");
export const amarelo = (texto) => pintar(texto, "amarelo");
export const azul = (texto) => pintar(texto, "azul");
export const magenta = (texto) => pintar(texto, "magenta");
export const ciano = (texto) => pintar(texto, "ciano");
export const branco = (texto) => pintar(texto, "branco");

// Cor de cada número de vizinhas (1 a 8).
const COR_NUMERO = {
  1: "azul",
  2: "verde",
  3: "vermelho",
  4: "magenta",
  5: "amarelo",
  6: "ciano",
  7: "branco",
  8: "branco",
};

export function corDoNumero(numero) {
  return COR_NUMERO[numero] ?? "branco";
}
