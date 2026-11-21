// Liga Pontos's own texts, in Brazilian Portuguese, added over the shared
// ones from arcade-hub-ui (registerMessages in main.js).

export default {
  meta: {
    description: "Liga Pontos: jogo de pontinhos para 2 a 4 jogadores no navegador. Ligue pontos, feche quadrados e quem fechar mais vence. Sem cadastro: mande o código da sala e jogue.",
  },

  dotz: {
    name: "Liga Pontos",
    leave: "Sair",
    leaveAria: "Sair da sala e voltar para o início",
    // "How to play" on the landing page, read with tList().
    steps: [
      { title: "Crie a sala e mande o link", text: "De 2 a 4 jogadores. Quem abre o link, ou digita o código da sala, entra e marca que está pronto." },
      { title: "Ligue dois pontos vizinhos", text: "Na sua vez, arraste de um ponto até o vizinho, na horizontal ou na vertical, para desenhar uma linha." },
      { title: "Fechou um quadrado, joga de novo", text: "Quem desenha o quarto lado de um quadrado fica com ele: o quadrado ganha a sua cor e você joga outra vez." },
      { title: "Vence quem tiver mais quadrados", text: "A partida acaba quando todos os quadrados estão fechados. Ganha quem fechou mais." },
    ],
    eyebrow: "Jogo do pontinho · 2 a 4 jogadores",
    lede: "Liguem dois pontos vizinhos em turnos. Quem desenhar o quarto lado de um quadrado fica com ele e joga de novo. Com o tabuleiro cheio, vence quem tiver mais quadrados.",
    leaveMatch: "Sair da Partida?",
    leaveMatchAria: "Sair da partida: toque de novo para confirmar",
    openingRoom: "Abrindo uma sala…",
    starting: "A partida está começando…",
    droppedOut: "Sua conexão caiu, então você saiu da partida.",
    connectionLost: "A conexão caiu. Entre na sala de novo com o código.",
    seatExpired: "Seu lugar na sala expirou. Entre de novo com o código.",
    backInLobby: "De volta à sala de espera. Prepare-se para a próxima partida.",
    nowHost: "Quem criou a sala saiu. Agora você é o anfitrião.",
    playerLeft: "{name} saiu da partida.",
    matchOver: "Fim da partida.",
    closedAgain: { one: "Você fechou um quadrado: jogue de novo.", other: "Você fechou {count} quadrados: jogue de novo." },
    yourTurn: "Sua vez. Arraste de um ponto até o vizinho.",
    theyClosed: "{name} fechou um quadrado e joga de novo…",
    theirTurn: "Vez de {name}…",
    board: "Tabuleiro de {n} por {n} pontos. Faltam {left} linhas. Quadrados: {scores}. Para jogar, pressione um ponto e arraste até um ponto vizinho.",

    lobby: {
      board: "Tabuleiro",
      boardSize: "Tamanho do tabuleiro",
    },

    grid: {
      small: "Pequeno",
      medium: "Médio",
      large: "Grande",
    },

    scoreboard: {
      label: "Quadrados por jogador, na ordem da vez",
      boxes: { one: "{count} quadrado", other: "{count} quadrados" },
    },

    result: {
      boxesOf: "{score} de {total} quadrados.",
    },
  },
};

