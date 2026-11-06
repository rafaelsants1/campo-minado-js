import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// recorde.json fica na raiz do projeto e não vai para o git (.gitignore).
export const ARQUIVO_RECORDE = fileURLToPath(
  new URL("../recorde.json", import.meta.url),
);

export function ehNovoRecorde(segundos, melhorAtual) {
  return melhorAtual === null || segundos < melhorAtual;
}

// Sem arquivo, ou com o arquivo estragado, o jogo começa sem recorde.
export function lerRecorde(arquivo = ARQUIVO_RECORDE) {
  try {
    const dados = JSON.parse(readFileSync(arquivo, "utf8"));
    const tempo = dados.melhorTempo;
    return Number.isFinite(tempo) && tempo >= 0 ? tempo : null;
  } catch {
    return null;
  }
}

export function registrarVitoria(segundos, arquivo = ARQUIVO_RECORDE) {
  const melhorAnterior = lerRecorde(arquivo);

  if (!ehNovoRecorde(segundos, melhorAnterior)) {
    return { novoRecorde: false, melhor: melhorAnterior, salvo: false };
  }

  try {
    const conteudo = JSON.stringify({ melhorTempo: segundos }, null, 2);
    writeFileSync(arquivo, conteudo + "\n");
    return { novoRecorde: true, melhor: segundos, salvo: true };
  } catch {
    // Pasta sem permissão de escrita, disco cheio etc. O jogo segue.
    return { novoRecorde: true, melhor: segundos, salvo: false };
  }
}
