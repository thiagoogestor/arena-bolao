const params = new URLSearchParams(window.location.search);
const arenaId = params.get("id");

const arenaNameElement = document.querySelector("[data-arena-name]");
const membersCountElement = document.querySelector("[data-members-count]");
const gamesListElement = document.querySelector("[data-games-list]");
const seedButton = document.querySelector("[data-seed-games]");
const seedFeedback = document.querySelector("[data-seed-feedback]");

let currentUser = null;

const defaultGames = [
  {
    id: "game-france-morocco",
    homeTeam: "França",
    awayTeam: "Marrocos",
    homeFlag: "🇫🇷",
    awayFlag: "🇲🇦",
    phase: "Quartas de Final",
    startsAt: "2026-07-09T17:00:00-03:00",
    status: "scheduled"
  },
  {
    id: "game-norway-england",
    homeTeam: "Noruega",
    awayTeam: "Inglaterra",
    homeFlag: "🇳🇴",
    awayFlag: "🏴",
    phase: "Quartas de Final",
    startsAt: "2026-07-11T18:00:00-03:00",
    status: "scheduled"
  },
  {
    id: "game-argentina-egypt-winner",
    homeTeam: "Vencedor ARG/EGI",
    awayTeam: "Vencedor SUI/COL",
    homeFlag: "🏆",
    awayFlag: "🏆",
    phase: "Quartas de Final",
    startsAt: "2026-07-11T22:00:00-03:00",
    status: "scheduled"
  }
];

auth.onAuthStateChanged(async function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  if (!arenaId) {
    arenaNameElement.textContent = "Arena não encontrada";
    return;
  }

  await loadArena();
  await loadMembers();
  await loadGames();
});

async function loadArena() {
  const snapshot = await db.ref(`arenas/${arenaId}`).once("value");
  const arena = snapshot.val();

  if (!arena) {
    arenaNameElement.textContent = "Arena não encontrada";
    return;
  }

  arenaNameElement.textContent = arena.name;
}

async function loadMembers() {
  const snapshot = await db.ref(`memberships/${arenaId}`).once("value");
  const members = snapshot.val() || {};
  const total = Object.keys(members).length;

  membersCountElement.textContent = total;
}

async function loadGames() {
  gamesListElement.innerHTML = "Buscando jogos...";

  const snapshot = await db.ref(`games/${arenaId}`).once("value");
  const games = snapshot.val() || {};
  const gamesArray = Object.values(games);

  if (!gamesArray.length) {
    gamesListElement.innerHTML = `
      <div class="empty-state small">
        <h3>Nenhum jogo cadastrado ainda.</h3>
        <p>Carregue os jogos da próxima fase para liberar os palpites.</p>
      </div>
    `;
    return;
  }

  gamesListElement.innerHTML = gamesArray.map(function (game) {
    const date = new Date(game.startsAt).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    });

    return `
      <article class="game-card">
        <div>
          <span class="eyebrow">${game.phase}</span>
          <h3>${game.homeFlag} ${game.homeTeam} <span>x</span> ${game.awayTeam} ${game.awayFlag}</h3>
          <p>${date}</p>
        </div>

        <button class="btn btn-secondary">
          Palpitar
        </button>
      </article>
    `;
  }).join("");
}

seedButton.addEventListener("click", async function () {
  seedFeedback.textContent = "Carregando jogos...";
  seedFeedback.className = "auth-feedback info";

  const updates = {};

  defaultGames.forEach(function (game) {
    updates[`games/${arenaId}/${game.id}`] = game;
  });

  await db.ref().update(updates);

  seedFeedback.textContent = "Jogos carregados! Agora sua Arena já pode receber palpites.";
  seedFeedback.className = "auth-feedback success";

  await loadGames();
});
