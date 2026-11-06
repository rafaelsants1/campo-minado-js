// Constantes do jogo. Alterar aqui muda o jogo inteiro.

export const LINHAS = 8;
export const COLUNAS = 8;
export const MINAS = 10;

// Símbolos do tabuleiro. A cor nunca é a única informação: cada estado
// tem um símbolo próprio.
export const SIMBOLOS = {
  fechada: "■",
  vazia: "·",
  mina: "*",
  bandeira: "⚑",
};

// Alternativa em ASCII puro, para terminais sem suporte a Unicode.
export const SIMBOLOS_ASCII = {
  fechada: "#",
  vazia: ".",
  mina: "*",
  bandeira: "F",
};
