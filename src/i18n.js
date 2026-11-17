// Liga Pontos's own texts, added over the shared ones from arcade-hub-ui
// (registerMessages in main.js). Keys must match in both languages: see
// i18n.test.js.

const en = {
  meta: {
    description: "Dotz: dots and boxes for 2 to 4 players in the browser. Join dots, close boxes, most boxes wins. No account: share a room code and play.",
  },

  dotz: {
    name: "Dotz",
    leave: "Leave",
    leaveAria: "Leave the room and go back to the start",
    // "How to play" on the landing page, read with tList().
    steps: [
      { title: "Create a room and send the link", text: "From 2 to 4 players. Friends open the link, or type the room code, and get ready in the waiting room." },
      { title: "Join two neighbouring dots", text: "On your turn, drag from a dot to the one next to it, across or down, to draw a line." },
      { title: "Close a box, play again", text: "Draw the fourth side of a box and it is yours: it takes your colour and you go again." },
      { title: "Most boxes wins", text: "The match ends when every box is closed. Whoever has the most boxes wins." },
    ],
    eyebrow: "Dots and boxes · 2 to 4 players",
    lede: "Take turns joining two neighbouring dots. Draw the fourth side of a box to keep it and go again. When the board is full, the most boxes wins.",
    leaveMatch: "Leave Match?",
    leaveMatchAria: "Leave the match: tap again to confirm",
    openingRoom: "Opening a room…",
    starting: "The match is starting…",
    droppedOut: "Your connection dropped, so you left the match.",
    connectionLost: "Connection lost. Join the room again with its code.",
    seatExpired: "Your seat in the room expired. Join again with the code.",
    backInLobby: "Back in the waiting room. Get ready for the next match.",
    nowHost: "The host left. You’re the host now.",
    playerLeft: "{name} left the match.",
    matchOver: "Match over.",
    closedAgain: { one: "You closed a box: play again.", other: "You closed {count} boxes: play again." },
    yourTurn: "Your turn. Drag from a dot to the next one.",
    theyClosed: "{name} closed a box and plays again…",
    theirTurn: "{name}’s turn…",
    board: "Board of {n} by {n} dots. {left} lines left. Boxes: {scores}. To play, press a dot and drag to a neighbouring dot.",

    lobby: {
      board: "Board",
      boardSize: "Board size",
    },

    grid: {
      small: "Small",
      medium: "Medium",
      large: "Large",
    },

    scoreboard: {
      label: "Boxes per player, in the order of play",
      boxes: { one: "{count} box", other: "{count} boxes" },
    },

    result: {
      boxesOf: "{score} of {total} boxes.",
    },
  },
};

const ptBR = {
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

export default { en, "pt-BR": ptBR };
