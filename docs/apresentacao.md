# Roteiro da apresentação

Cerca de 8 minutos. Cada pessoa da squad fala de uma parte. Os nomes entre parênteses são sugestão, ajustem.

## 1. O que é (30 s)

Campo Minado 8×8 com 10 minas, jogado no terminal, em JavaScript puro, sem nenhuma biblioteca. Mostrar `npm start` abrindo o jogo.

## 2. Demonstração ao vivo (2 min)

Seguir essa sequência, que mostra tudo que o trabalho pede:

1. `ajuda`: lista de comandos e símbolos.
2. `r B3`: a primeira jogada, com a área vazia abrindo sozinha (cascata).
3. `b D4`: bandeira, e a contagem de minas restantes mudando.
4. `r Z9` e `xyz`: as mensagens de erro, sem o jogo quebrar.
5. `dica`: abre uma casa segura (e avisar que essa partida não vale recorde).
6. Perder de propósito: o tabuleiro mostra todas as minas.
7. Reiniciar com `npm start -- --sem-cor` e `-- --ascii`, para mostrar que não depende de cor nem de Unicode.

Se der tempo, uma partida vencida sem dica para mostrar o recorde sendo gravado.

## 3. Como o código está organizado (1 min 30 s)

Mostrar a tabela de camadas do README. A ideia que importa: **a lógica não imprime nem lê o teclado**. Só o `index.js` conversa com o terminal. Por isso dá para testar as regras sem abrir o jogo.

## 4. As partes de lógica (2 min)

Escolher três para explicar, com o código aberto:

- **Vizinhas** (`contarVizinhas`): vetor de 8 deslocamentos e `dentroDoTabuleiro` para cantos e bordas. Perguntar à plateia: quantos vizinhos tem o canto A1? (3)
- **Cascata** (`revelarCascata`): pilha em vez de recursão, e por que ela para nos números.
- **Primeira jogada segura**: as minas só são sorteadas depois do primeiro clique, fora daquela casa.

## 5. Validação e testes (1 min)

- Mostrar `interpretarComando` e as mensagens de erro específicas.
- Rodar `npm test`: 55 testes passando.
- Contar a prova de que os testes servem: quebramos o código de propósito (a cascata atravessando números, a primeira jogada podendo cair em mina) e os testes falharam.

## 6. Git e trabalho em equipe (1 min)

Mostrar no GitHub: `main` protegida, `develop`, uma branch por entrega, os Pull Requests revisados, os commits no padrão Conventional Commits e a tag `v1.0.0`.

## 7. Extras e o que ficou de fora (30 s)

Extras: cronômetro, recorde, dica, modo `--ascii` e `--sem-cor`. Ficou de fora o chording (abrir as vizinhas de um número já satisfeito com bandeiras).

## Perguntas que podem aparecer

- **Por que pilha e não recursão na cascata?** Dá para acompanhar o fluxo sem depender da pilha de chamadas, e não estoura em tabuleiros maiores.
- **Por que as minas só entram na primeira jogada?** Para o jogador nunca perder no primeiro clique.
- **E se o sorteio repetir uma posição?** O `while` só conta a mina quando a casa é válida, então sempre fecha em 10.
- **Por que não usar uma biblioteca de cores?** O trabalho pedia os códigos ANSI; a função `pintar` centraliza o reset e o modo sem cor.
- **Como a vitória é detectada?** Casas abertas igual a 64 menos 10.
