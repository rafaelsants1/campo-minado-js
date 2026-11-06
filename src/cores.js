const RESET = "\x1b[0m";

export const CODIGOS = {
  vermelho: "\x1b[31m",
  verde: "\x1b[32m",
  amarelo: "\x1b[33m",
  azul: "\x1b[34m",
  magenta: "\x1b[35m",
  ciano: "\x1b[36m",
  branco: "\x1b[37m",
};

// NO_COLOR (no-color.org) ou --sem-cor desligam tudo.
const semCor = "NO_COLOR" in process.env || process.argv.includes("--sem-cor");

// Toda cor fecha com RESET, senão o terminal continua pintado depois do texto.
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
