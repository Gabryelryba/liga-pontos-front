<script>
  import { onMount, onDestroy, untrack } from "svelte";
  import ArrowLeft from "phosphor-svelte/lib/ArrowLeft";
  import { socket } from "arcade-hub-ui/socket.js";
  import { keepScreenAwake, allowScreenSleep } from "arcade-hub-ui/wakeLock.js";
  import { inviteUrl } from "arcade-hub-ui/invite.js";
  import Preview from "./Preview.svelte";
  import GameLanding from "arcade-hub-ui/GameLanding.svelte";
  import Lobby from "./Lobby.svelte";
  import Board from "./Board.svelte";
  import Scoreboard from "./Scoreboard.svelte";
  import Result from "./Result.svelte";
  import { startHint } from "arcade-hub-ui/lobbyText.js";
  import { t, tList, serverMessage } from "arcade-hub-ui/i18n/index.svelte.js";

  const GAME_ID = "dotz";
  // Seats in the waiting room, as on the server (games/<id> in arcade-hub-back).
  const rules = { minPlayers: 2, maxPlayers: 4 };

  // Props come from GameApp (arcade-hub-ui), which mounts the game.
  let {
    inviteCode: invitedTo = null,
    onInviteUsed = () => {},
    playerName = null,
    ensureName = async () => null,
    editName = null,
  } = $props();

  let status = $state("connecting"); // connecting | menu | joining | lobby | playing | ended
  let lobby = $state(null); // the last `lobby` event
  let notice = $state("");

  // The match: this player's seat, the seats, and the last `state` from the server.
  let playerIndex = $state(null);
  let seats = $state([]);
  let game = $state(null);
  let moveError = $state("");
  let moveErrorTimer;
  let roomCode = $state("");

  let joinError = $state("");
  let showJoinForm = $state(false);
  let slowServer = $state(false);
  let reconnecting = $state(false);
  let confirmLeave = $state(false);

  let noticeTimer;
  let resumeFailures = 0;

  // Read once: the invite is joined on the first connection only, not on later reconnects.
  let inviteCode = untrack(() => invitedTo);

  function say(message, ms = 4000) {
    clearTimeout(noticeTimer);
    notice = message;
    if (message) noticeTimer = setTimeout(() => (notice = ""), ms);
  }

  function handleConnect() {
    slowServer = false;
    if (status === "lobby") {
      // Reconnected while waiting (the phone slept): ask for the seat back.
      resumeSeat();
    } else if (status === "playing" || status === "ended") {
      // A match cannot be resumed: the server has already taken this player out.
      backToMenu(t("dotz.droppedOut"));
    } else if (inviteCode) {
      const code = inviteCode;
      inviteCode = null;
      onInviteUsed();
      status = "menu";
      sendJoin(code);
    } else {
      status = "menu";
    }
  }

  function handleDisconnect() {
    if (status === "lobby") reconnecting = true;
  }

  const MAX_RESUME_FAILURES = 3;

  // No answer means the connection is stale (a woken-up phone can think it is
  // still connected), so open a fresh one; its "connect" tries this again.
  function resumeSeat() {
    socket.timeout(4000).emit("resumeRoom", (err, res) => {
      if (status !== "lobby") return;
      if (err) {
        resumeFailures += 1;
        if (resumeFailures >= MAX_RESUME_FAILURES) backToMenu(t("dotz.connectionLost"));
        else socket.disconnect().connect();
        return;
      }
      resumeFailures = 0;
      if (res?.ok && res.lobby) reconnecting = false;
      else backToMenu(t("dotz.seatExpired"));
    });
  }

  function handleVisibility() {
    if (document.visibilityState !== "visible" || status !== "lobby") return;
    if (socket.connected) resumeSeat();
    else socket.connect();
  }

  function handleRoomCreated({ code }) {
    roomCode = code;
    status = "lobby";
  }

  function handleJoinedLobby({ code }) {
    roomCode = code;
    status = "lobby";
  }

  function handleLobby(view) {
    const before = lobby;
    lobby = view;
    roomCode = view.code;
    if (view.phase === "lobby" && status === "joining") status = "lobby";
    // Someone pressed Play Again: everyone still here is back in the waiting room (RN-DZ-35).
    if (view.phase === "lobby" && status === "ended") {
      status = "lobby";
      game = null;
      say(t("dotz.backInLobby"), 5000);
      return;
    }
    // The host role passed to this player (RN-DZ-31).
    const wasHost = before?.players[before.you]?.host === true;
    if (status === "lobby" && before && !wasHost && view.players[view.you]?.host) {
      say(t("dotz.nowHost"), 6000);
    }
  }

  // Server refusals come with a code, translated here into what to do next.
  // A code from another game's room is refused by the server as room-not-found.
  function handleJoinError(refusal) {
    joinError = serverMessage("join", refusal);
    status = "menu";
    showJoinForm = true;
  }

  function handleStartRefused(check) {
    say(startHint(check));
  }

  function handleMatched({ playerIndex: index, players }) {
    playerIndex = index;
    seats = players;
    game = null;
    status = "playing";
    confirmLeave = false;
    say("");
  }

  function handleState(state) {
    game = state;
    if (Array.isArray(state.players)) seats = state.players;
    if (state.winners) {
      status = "ended";
      confirmLeave = false;
    }
  }

  // Their boxes stay on the board; the scoreboard marks them from the next `state`.
  function handlePlayerLeft({ name }) {
    if (status === "playing" || status === "ended") say(t("dotz.playerLeft", { name }), 3500);
  }

  function handleMoveRejected(refusal) {
    clearTimeout(moveErrorTimer);
    moveError = serverMessage("move", refusal);
    moveErrorTimer = setTimeout(() => (moveError = ""), 1800);
  }

  const listeners = {
    connect: handleConnect,
    disconnect: handleDisconnect,
    roomCreated: handleRoomCreated,
    joinedLobby: handleJoinedLobby,
    lobby: handleLobby,
    joinError: handleJoinError,
    startRefused: handleStartRefused,
    matched: handleMatched,
    state: handleState,
    moveRejected: handleMoveRejected,
    playerLeft: handlePlayerLeft,
  };

  onMount(() => {
    for (const [event, handler] of Object.entries(listeners)) socket.on(event, handler);
    document.addEventListener("visibilitychange", handleVisibility);
    socket.connect();
    // The free host sleeps when idle and takes a while to wake: say so.
    const slowTimer = setTimeout(() => {
      if (status === "connecting") slowServer = true;
    }, 4000);
    return () => clearTimeout(slowTimer);
  });

  onDestroy(() => {
    // Leaving the game screen gives the seat up at once; a plain disconnect
    // would keep it for a few minutes in case this was a locked phone.
    if (socket.connected && (status === "lobby" || status === "playing" || status === "ended")) socket.emit("leaveRoom");
    for (const [event, handler] of Object.entries(listeners)) socket.off(event, handler);
    document.removeEventListener("visibilitychange", handleVisibility);
    clearTimeout(noticeTimer);
    clearTimeout(moveErrorTimer);
    socket.disconnect();
  });

  async function sendJoin(code) {
    const name = await ensureName();
    if (!name) return;
    joinError = "";
    status = "joining";
    roomCode = code;
    socket.emit("joinRoom", { code, gameId: GAME_ID, name });
  }

  async function createRoom() {
    const name = await ensureName();
    if (!name) return;
    joinError = "";
    socket.emit("createRoom", { gameId: GAME_ID, name });
  }

  function backToMenu(message = "") {
    status = "menu";
    lobby = null;
    game = null;
    seats = [];
    playerIndex = null;
    roomCode = "";
    reconnecting = false;
    confirmLeave = false;
    joinError = message;
    say("");
  }

  function leaveRoom() {
    socket.emit("leaveRoom");
    backToMenu();
  }

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl(window.location.href, roomCode));
    } catch {
      // Clipboard API unavailable (e.g. insecure context): the code is on screen.
    }
  }

  // Leave goes back to the landing page. Leaving a live match takes the player
  // out of it, so it takes a second tap.
  function handleBack() {
    if (status === "playing" && !confirmLeave) {
      confirmLeave = true;
      setTimeout(() => (confirmLeave = false), 3500);
      return;
    }
    leaveRoom();
  }

  function sendMove(move) {
    if (canPlay) socket.emit("move", move);
  }

  const inRoom = $derived(status === "lobby" || status === "playing" || status === "ended" || status === "joining");
  const inMatch = $derived((status === "playing" || status === "ended") && game !== null);
  const canPlay = $derived(status === "playing" && game?.turn === playerIndex && !game?.winners);

  const statusText = $derived.by(() => {
    if (!game) return "";
    if (game.winners) return t("dotz.matchOver");
    const last = game.lastMove;
    if (game.turn === playerIndex) {
      return last?.closed > 0 && last.player === playerIndex
        ? t("dotz.closedAgain", { count: last.closed })
        : t("dotz.yourTurn");
    }
    const name = seats[game.turn]?.name ?? t("common.someone");
    return last?.closed > 0 && last.player === game.turn
      ? t("dotz.theyClosed", { name })
      : t("dotz.theirTurn", { name });
  });

  // A locked phone suspends the page and drops the connection, so keep the screen on while waiting.
  $effect(() => {
    if (status !== "lobby") return;
    keepScreenAwake();
    return allowScreenSleep;
  });
</script>

<main class="screen" class:in-game={inMatch}>
  {#if inRoom}
    <header class="topbar">
      <button
        class="btn btn-ghost back"
        class:btn-danger={confirmLeave}
        onclick={handleBack}
        aria-label={confirmLeave ? t("dotz.leaveMatchAria") : t("dotz.leaveAria")}
      >
        <ArrowLeft size={18} weight="light" aria-hidden="true" />
        <span>{confirmLeave ? t("dotz.leaveMatch") : t("dotz.leave")}</span>
      </button>
      {#if inRoom}
        <span class="game-name" translate="no">{t("dotz.name")}</span>
      {/if}
    </header>
  {/if}

  {#if status === "menu" || status === "connecting"}
    <GameLanding
      gameId={GAME_ID}
      eyebrow={t("dotz.eyebrow")}
      title={t("dotz.name")}
      lede={t("dotz.lede")}
      steps={tList("dotz.steps")}
      connecting={status === "connecting"}
      {slowServer}
      bind:joinError
      bind:showJoinForm
      onCreate={createRoom}
      onJoin={sendJoin}
      {playerName}
      onEditName={editName}
    >
      {#snippet art()}<Preview />{/snippet}
    </GameLanding>
  {:else if status === "joining" || (status === "lobby" && !lobby)}
    <section class="center-state" aria-busy="true">
      <p class="status-line" role="status" aria-live="polite">
        <span class="pulse" aria-hidden="true"></span>{roomCode
          ? t("common.joiningRoom", { code: roomCode })
          : t("dotz.openingRoom")}
      </p>
      <span class="skeleton"></span>
    </section>
  {:else if status === "lobby"}
    <Lobby
      {lobby}
      {rules}
      {notice}
      {reconnecting}
      onReady={(ready) => socket.emit("setReady", { ready })}
      onOption={(key, value) => socket.emit("setOption", { key, value })}
      onStart={() => socket.emit("startGame")}
      onCopyLink={copyInviteLink}
      onLeave={leaveRoom}
    />
  {:else if inMatch}
    <section class="match">
      <Scoreboard players={seats} order={game.order} scores={game.scores} turn={game.turn} me={playerIndex} />
      <p class="status-line match-status" class:highlight={canPlay} role="status" aria-live="polite">
        {moveError || notice || statusText}
      </p>
      <div class="board-slot">
        <Board {game} players={seats} me={playerIndex} {canPlay} onMove={sendMove} />
      </div>
    </section>
  {:else}
    <section class="center-state">
      <p class="status-line" role="status" aria-live="polite">
        <span class="pulse" aria-hidden="true"></span>{t("dotz.starting")}
      </p>
    </section>
  {/if}
</main>

{#if status === "ended" && game}
  <Result
    {game}
    players={seats}
    me={playerIndex}
    onPlayAgain={() => socket.emit("playAgain")}
    onBackToLobby={() => socket.emit("backToLobby")}
    onMenu={leaveRoom}
  />
{/if}

<style>
  .screen {
    position: relative;
    z-index: 1;
    flex: 1;
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding: max(1.25rem, env(safe-area-inset-top)) var(--edge-gutter) max(2rem, env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 2.75rem;
    margin-left: -0.6rem;
  }

  .back {
    min-height: 2.75rem;
    padding: 0 0.85rem;
  }

  .game-name {
    font-weight: 600;
    color: var(--ink-muted);
    letter-spacing: -0.01em;
  }

  .pulse {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    animation: breathe 1.8s ease-in-out infinite;
  }

  @keyframes breathe {
    50% {
      opacity: 0.25;
      transform: scale(0.75);
    }
  }

  /* ---- Joining ---- */
  .center-state {
    flex: 1;
    display: grid;
    align-content: center;
    justify-items: start;
    gap: 1rem;
    max-width: 34rem;
    padding-bottom: 4rem;
  }

  .status-line {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--ink-muted);
    font-weight: 500;
  }

  .skeleton {
    width: 100%;
    height: 14rem;
    border-radius: var(--radius-xl);
    background: linear-gradient(90deg, var(--surface) 0%, var(--surface-raised) 50%, var(--surface) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.4s linear infinite;
  }

  @keyframes shimmer {
    to {
      background-position: -200% 0;
    }
  }

  /* ---- Match ---- */
  .match {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
    padding-top: 0.75rem;
  }

  /* Two lines reserved, so a longer message never moves the board. */
  .match-status {
    justify-content: center;
    text-align: center;
    min-height: 2.9em;
    margin: 0.6rem 0 0.4rem;
    font-weight: 600;
    transition: color 0.3s var(--ease-spring);
  }

  .match-status.highlight {
    color: var(--accent-text);
  }

  .board-slot {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  /* Phones, portrait or landscape: during a match the page is exactly one
     viewport tall and the board takes whatever height is left. */
  @media (max-width: 640px), (max-height: 560px) {
    .screen.in-game {
      height: 100vh;
      height: 100dvh;
      min-height: 0;
      padding-top: max(0.75rem, env(safe-area-inset-top));
      padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
    }

    .in-game .match {
      min-height: 0;
      padding-top: 0.4rem;
    }

    .in-game .match-status {
      margin: 0.35rem 0 0.25rem;
    }

    .in-game .board-slot {
      flex: 1 1 0;
      min-height: 0;
    }

    .in-game .board-slot :global(.board-wrap) {
      height: 100%;
    }
  }

  /* A phone held sideways: scoreboard on the left, board on the right. */
  @media (max-height: 560px) and (min-width: 560px) {
    .in-game .match {
      display: grid;
      grid-template-columns: minmax(0, 15rem) minmax(0, 1fr);
      grid-template-rows: auto 1fr;
      column-gap: 1.25rem;
      align-items: start;
      max-width: none;
    }

    .in-game .match :global(.scoreboard) {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }

    .in-game .match-status {
      grid-column: 1;
      grid-row: 2;
      align-self: start;
      text-align: left;
      justify-content: start;
    }

    .in-game .board-slot {
      grid-column: 2;
      grid-row: 1 / span 2;
      height: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pulse {
      animation: none;
    }
  }
</style>
