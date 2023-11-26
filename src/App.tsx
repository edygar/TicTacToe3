import { createSignal, For, Show } from "solid-js";

type State = {
  state: "fill-in" | "remove" | "won";
  board: Array<string>;
  turn: "x" | "o";
  lastRemoved?: number;
  winner?: "x" | "o";
};

const initialState: State = {
  state: "fill-in",
  board: Array(9).fill(""),
  turn: "x",
};

export default function App() {
  const [state, setState] = createSignal<State>(initialState);

  function play(pos: number) {
    setState((prevState: State) => {
      if (prevState.state === "fill-in") {
        const currentPlayer = prevState.turn;
        const nextState = {
          ...prevState,
          board: [
            ...prevState.board.slice(0, pos),
            currentPlayer,
            ...prevState.board.slice(pos + 1),
          ],
          lastRemoved: undefined,
          turn:
            prevState.lastRemoved && prevState.lastRemoved === pos
              ? prevState.turn
              : currentPlayer === "x"
              ? "o"
              : "x",
        };

        const playersBoard = nextState.board.reduce(
          (acc, slot, index) => acc + (slot === currentPlayer ? 2 ** index : 0),
          0
        );
        if ([448, 56, 7, 292, 146, 73, 273, 84].includes(playersBoard)) {
          nextState.turn = currentPlayer;
          nextState.winner = currentPlayer;
          nextState.state = "won";
          return nextState;
        }

        if (
          nextState.board.reduce(
            (acc, curr) => acc + (curr === nextState.turn ? 1 : 0),
            0
          ) === 3
        ) {
          nextState.state = "remove";
        }

        return nextState;
      }
      if (prevState.state === "remove") {
        return {
          ...prevState,
          state: "fill-in",
          lastRemoved: pos,
          board: [
            ...prevState.board.slice(0, pos),
            "",
            ...prevState.board.slice(pos + 1),
          ],
        };
      }
      return prevState;
    });
  }

  return (
    <main class="App" data-test="oi">
      <header class="score-board">
        <h1>TicTacToe3</h1>
        <h2>Current turn: {state().turn.toUpperCase()}</h2>
        <p>
          {state().state === "fill-in"
            ? "Please, fill in a blank spot"
            : "Please remove one of yours previous plays"}
        </p>
      </header>
      <div class={"board " + state().state}>
        <For each={state().board}>
          {(value, index) => (
            <button
              data-turn={state().turn.toUpperCase()}
              class={
                "slot " +
                (state().lastRemoved === index() ? "last-removed" : "") +
                " " +
                (state().board[index()] || state().turn)
              }
              disabled={Boolean(
                (state().state === "fill-in" && state().board[index()]) ||
                  (state().state === "remove" &&
                    (state().board[index()] !== state().turn ||
                      state().lastRemoved === index()))
              )}
              onClick={() => play(index())}
            >
              {value.toUpperCase()}
            </button>
          )}
        </For>
        <Show when={state().winner}>
          {(winner) => (
            <div class="winner">
              <div class="content">
                <span class={winner()}>{winner().toUpperCase()}</span> WON!{" "}
                <button onClick={() => setState(initialState)}>
                  Play Again
                </button>
              </div>
            </div>
          )}
        </Show>
      </div>
    </main>
  );
}
