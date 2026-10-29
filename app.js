
const $ = id => document.getElementById(id);
const cards = [...document.querySelectorAll(".game-card")];
const search = $("gameSearch");
const filters = [...document.querySelectorAll(".filter-btn")];
const count = $("gameCount");
const empty = $("noResults");
const area = $("playArea");
const title = $("gameTitle");
const stage = $("gameStage");

$("year").textContent = new Date().getFullYear();

let category = "all";
let cleanup = () => {};

function filterGames() {
  const q = search.value.toLowerCase().trim();
  let visible = 0;

  cards.forEach(card => {
    const show =
      card.textContent.toLowerCase().includes(q) &&
      (category === "all" || card.dataset.category === category);
    card.hidden = !show;
    if (show) visible++;
  });

  count.textContent = `${visible} Games`;
  empty.hidden = visible !== 0;
}

search.addEventListener("input", filterGames);

filters.forEach(btn => {
  btn.addEventListener("click", () => {
    filters.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    category = btn.dataset.category;
    filterGames();
  });
});

function el(tag, text = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function btn(text, action) {
  const b = el("button", text);
  b.type = "button";
  b.addEventListener("click", action);
  return b;
}

function startGame(id) {
  cleanup();
  cleanup = () => {};
  const card = cards.find(c => c.dataset.game === id);
  if (!card) return;

  title.textContent = card.querySelector(".game-name").textContent;
  stage.replaceChildren();
  area.hidden = false;

  const status = el("p", "Ready to play!");
  status.className = "game-message";
  stage.append(status);

  const say = text => status.textContent = text;
  const add = node => stage.append(node);
  const box = el("div");
  box.style.cssText =
    "display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:15px auto";
  add(box);

  if (id === "rps") {
    ["Rock", "Paper", "Scissors"].forEach(choice => {
      box.append(btn(choice, () => {
        const opts = ["Rock", "Paper", "Scissors"];
        const cpu = opts[Math.floor(Math.random() * 3)];
        const win =
          (choice === "Rock" && cpu === "Scissors") ||
          (choice === "Paper" && cpu === "Rock") ||
          (choice === "Scissors" && cpu === "Paper");
        say(`You: ${choice} · Computer: ${cpu} · ${
          choice === cpu ? "Draw!" : win ? "You win!" : "Computer wins!"
        }`);
      }));
    });
  } else if (id === "ttt") {
    let cells, turn, done;
    const board = el("div");
    board.style.cssText =
      "display:grid;grid-template-columns:repeat(3,70px);gap:6px;justify-content:center";
    function reset() {
      cells = Array(9).fill("");
      turn = "X";
      done = false;
      render();
    }
    function render() {
      board.replaceChildren();
      cells.forEach((v, i) => {
        const b = btn(v || "·", () => play(i));
        b.style.cssText = "height:65px;font-size:24px";
        b.disabled = !!v || done;
        board.append(b);
      });
      if (!done) say(`Turn: ${turn}`);
    }
    function play(i) {
      cells[i] = turn;
      const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],
        [1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      const win = lines.some(line => line.every(n => cells[n] === turn));
      if (win) {
        done = true;
        say(`${turn} wins!`);
      } else if (cells.every(Boolean)) {
        done = true;
        say("It's a draw!");
      } else turn = turn === "X" ? "O" : "X";
      render();
    }
    add(board);
    add(btn("Restart", reset));
    reset();
  } else if (id === "guess") {
    const input = el("input");
    input.type = "number";
    input.placeholder = "Guess 1–100";
    let target = 1 + Math.floor(Math.random() * 100);
    add(input);
    add(btn("Guess", () => {
      const n = Number(input.value);
      if (n < 1 || n > 100) return say("Enter a number from 1 to 100.");
      say(n === target ? "Correct! You won!" :
        n < target ? "Too low! Try higher." : "Too high! Try lower.");
    }));
    add(btn("New Number", () => {
      target = 1 + Math.floor(Math.random() * 100);
      input.value = "";
      say("Guess the new number!");
    }));
  } else if (id === "dice") {
    add(btn("Roll Dice 🎲", () => {
      const a = 1 + Math.floor(Math.random() * 6);
      const b = 1 + Math.floor(Math.random() * 6);
      say(`You rolled ${a}. Computer rolled ${b}. ${
        a === b ? "Draw!" : a > b ? "You win!" : "Computer wins!"
      }`);
    }));
  } else if (id === "math") {
    let answer;
    const question = el("h2");
    const input = el("input");
    input.type = "number";
    input.placeholder = "Answer";
    function next() {
      const a = 1 + Math.floor(Math.random() * 20);
      const b = 1 + Math.floor(Math.random() * 20);
      answer = a + b;
      question.textContent = `${a} + ${b} = ?`;
      input.value = "";
    }
    add(question);
    add(input);
    add(btn("Check", () => {
      if (Number(input.value) === answer) {
        say("Correct! 🎉");
        next();
      } else say("Try again!");
    }));
    add(btn("New Question", next));
    next();
  } else if (id === "memory") {
    const icons = ["🍎","🚀","🐱","⚽","🌟","🍕","🎧","🐼"];
    let deck, opened, matched, moves, lock, timer;
    const board = el("div");
    board.style.cssText =
      "display:grid;grid-template-columns:repeat(4,minmax(0,60px));gap:7px;justify-content:center";
    function reset() {
      clearTimeout(timer);
      deck = [...icons, ...icons].sort(() => Math.random() - .5);
      opened = [];
      matched = new Set();
      moves = 0;
      lock = false;
      render();
    }
    function render() {
      board.replaceChildren();
      deck.forEach((icon, i) => {
        const b = btn(matched.has(i) || opened.includes(i) ? icon : "?", () => flip(i));
        b.style.cssText = "height:55px;font-size:22px;padding:5px";
        b.disabled = lock || matched.has(i) || opened.includes(i);
        board.append(b);
      });
      say(`Moves: ${moves} · Pairs: ${matched.size / 2}/8`);
    }
    function flip(i) {
      opened.push(i);
      if (opened.length === 2) {
        moves++;
        if (deck[opened[0]] === deck[opened[1]]) {
          opened.forEach(n => matched.add(n));
          opened = [];
          render();
          if (matched.size === 16) say(`You won in ${moves} moves!`);
          return;
        }
        lock = true;
        render();
        timer = setTimeout(() => {
          opened = [];
          lock = false;
          render();
        }, 700);
      } else render();
    }
    add(board);
    add(btn("New Game", reset));
    reset();
    cleanup = () => clearTimeout(timer);
  } else if (id === "reaction") {
    let state = "ready", timer, start;
    const b = btn("Tap to start", () => {
      if (state === "ready") {
        state = "waiting";
        b.textContent = "Wait for green...";
        timer = setTimeout(() => {
          state = "go";
          start = performance.now();
          b.textContent = "TAP NOW!";
        }, 1000 + Math.random() * 2500);
      } else if (state === "waiting") {
        clearTimeout(timer);
        state = "ready";
        b.textContent = "Too early! Try again";
      } else {
        say(`Reaction time: ${Math.round(performance.now() - start)} ms`);
        state = "ready";
        b.textContent = "Tap to try again";
      }
    });
    add(b);
    cleanup = () => clearTimeout(timer);
  } else {
    say("This game is coming soon. More games will be added in the next update!");
  }

  area.scrollIntoView({ behavior: "smooth", block: "start" });
}

$("gameGrid").addEventListener("click", event => {
  const card = event.target.closest(".game-card");
  if (card) startGame(card.dataset.game);
});

$("closeGame").addEventListener("click", () => {
  cleanup();
  cleanup = () => {};
  area.hidden = true;
  stage.replaceChildren();
  $("games").scrollIntoView({ behavior: "smooth" });
});

filterGames();
