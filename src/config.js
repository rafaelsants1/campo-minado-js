export const LINHAS = 8;
export const COLUNAS = 8;
export const MINAS = 10;

// Cada estado tem um símbolo próprio, então a cor nunca é a única pista.
export const SIMBOLOS = {
  fechada: "■",
  vazia: "·",
  mina: "*",
  bandeira: "⚑",
};

// Para terminais que não mostram Unicode (use a flag --ascii).
export const SIMBOLOS_ASCII = {
  fechada: "#",
  vazia: ".",
  mina: "*",
  bandeira: "F",
};
