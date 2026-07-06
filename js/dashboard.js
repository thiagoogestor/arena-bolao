const userNameElement = document.querySelector("[data-user-name]");
const userShortNameElement = document.querySelector("[data-user-short-name]");
const userAvatarElement = document.querySelector("[data-user-avatar]");
const logoutButton = document.querySelector("[data-logout]");
const appContent = document.querySelector("[data-app-content]");
const navItems = document.querySelectorAll("[data-route]");

let currentUser = null;
let currentProfile = null;

const routes = {
  home: renderHome,
  arenas: renderArenas,
  games: renderGames,
  ranking: renderRanking,
  profile: renderProfile
};

auth.onAuthStateChanged(async function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  const snapshot = await db.ref(`users/${user.uid}`).once("value");
  currentProfile = snapshot.val() || {};

  const name = currentProfile.name || user.displayName || "Jogador";

  userNameElement.textContent = `Olá, ${name}`;
  userShortNameElement.textContent = name.split(" ")[0];
  userAvatarElement.textContent = name.charAt(0).toUpperCase();

  navigateTo("home");
});

logoutButton.addEventListener("click", async function () {
  await auth.signOut();
  window.location.href = "index.html";
});

navItems.forEach(function (item) {
  item.addEventListener("click", function () {
    const route = item.dataset.route;
    navigateTo(route);
  });
});

function navigateTo(route) {
  navItems.forEach(function (item) {
    item.classList.toggle("active", item.dataset.route === route);
  });

  routes[route]();
}

function renderHome() {
  appContent.innerHTML = `
    <div class="hero-panel">
      <span class="eyebrow">Sua jornada começa agora</span>
      <h2>Crie sua primeira Arena e chame quem faz parte da história.</h2>
      <p>
        A Arena Bolão não é sobre apostas. É sobre viver cada jogo com amigos,
        família e aquela rivalidade saudável que vira memória.
      </p>
      <button class="btn btn-primary" onclick="navigateTo('arenas')">
        Criar minha Arena
      </button>
    </div>

    <div class="dashboard-preview">
      <article class="metric-card">
        <span>Posição</span>
        <strong>#--</strong>
        <p>Ranking será ativado após os primeiros jogos.</p>
      </article>

      <article class="metric-card">
        <span>Pontos</span>
        <strong>0</strong>
        <p>Seus palpites ainda vão escrever essa história.</p>
      </article>

      <article class="metric-card">
        <span>Próximo jogo</span>
        <strong>--:--</strong>
        <p>Cadastre uma competição para liberar os jogos.</p>
      </article>
    </div>
  `;
}

function renderArenas() {
  appContent.innerHTML = `
    <div class="section-heading">
      <span class="eyebrow">Minha Arena</span>
      <h2>Crie o lugar onde sua galera vai competir.</h2>
      <p>Sua Arena pode ser da família, empresa, igreja, escola ou grupo de amigos.</p>
    </div>

    <form class="arena-form" data-create-arena-form>
      <label>
        Nome da Arena
        <input type="text" data-arena-name placeholder="Ex: Arena Família Silva" />
      </label>

      <button type="submit" class="btn btn-primary">
        Criar Arena
      </button>

      <div class="auth-feedback" data-arena-feedback></div>
    </form>

    <div class="arena-list" data-arena-list></div>
  `;

  setupArenaForm();
  loadUserArenas();
}

function renderGames() {
  appContent.innerHTML = `
    <div class="empty-state">
      <h2>Jogos em breve</h2>
      <p>Depois de criar uma Arena, vamos cadastrar a primeira competição e liberar os palpites.</p>
    </div>
  `;
}

function renderRanking() {
  appContent.innerHTML = `
    <div class="empty-state">
      <h2>Ranking em breve</h2>
      <p>Assim que os jogos tiverem resultados, o ranking começa a ganhar vida.</p>
    </div>
  `;
}

function renderProfile() {
  const name = currentProfile?.name || currentUser?.displayName || "Jogador";
  const email = currentProfile?.email || currentUser?.email || "";

  appContent.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">${name.charAt(0).toUpperCase()}</div>
      <h2>${name}</h2>
      <p>${email}</p>

      <div class="profile-stats">
        <div>
          <strong>0</strong>
          <span>Pontos</span>
        </div>
        <div>
          <strong>Bronze</strong>
          <span>Nível</span>
        </div>
        <div>
          <strong>0%</strong>
          <span>Aproveitamento</span>
        </div>
      </div>
    </div>
  `;
}

async function setupArenaForm() {
  const form = document.querySelector("[data-create-arena-form]");
  const input = document.querySelector("[data-arena-name]");
  const feedback = document.querySelector("[data-arena-feedback]");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = input.value.trim();

    if (!name) {
      feedback.textContent = "Dê um nome para sua Arena.";
      feedback.className = "auth-feedback error";
      return;
    }

    feedback.textContent = "Criando sua Arena...";
    feedback.className = "auth-feedback info";

    const arenaRef = db.ref("arenas").push();
    const arenaId = arenaRef.key;

    const arenaData = {
      id: arenaId,
      name,
      slug: name.toLowerCase().replaceAll(" ", "-"),
      ownerId: currentUser.uid,
      createdAt: Date.now(),
      status: "active",
      visibility: "private"
    };

    await arenaRef.set(arenaData);

    await db.ref(`memberships/${arenaId}/${currentUser.uid}`).set({
      role: "owner",
      displayName: currentProfile.name || currentUser.displayName || "Jogador",
      points: 0,
      level: "bronze",
      joinedAt: Date.now()
    });

    feedback.textContent = "Arena criada! Agora já temos um lugar para reunir sua galera.";
    feedback.className = "auth-feedback success";

    input.value = "";

    loadUserArenas();
  });
}

async function loadUserArenas() {
  const list = document.querySelector("[data-arena-list]");
  if (!list) return;

  list.innerHTML = "<p>Buscando suas Arenas...</p>";

  try {
    const membershipsSnapshot = await db.ref("memberships").once("value");
    const memberships = membershipsSnapshot.val() || {};

    const arenaIds = Object.keys(memberships).filter(function (arenaId) {
      return memberships[arenaId][currentUser.uid];
    });

    if (!arenaIds.length) {
      list.innerHTML = `
        <div class="empty-state small">
          <h3>Nenhuma Arena criada ainda.</h3>
          <p>Crie sua primeira Arena e comece a reunir sua galera.</p>
        </div>
      `;
      return;
    }

    const arenaPromises = arenaIds.map(function (arenaId) {
      return db.ref(`arenas/${arenaId}`).once("value");
    });

    const arenaSnapshots = await Promise.all(arenaPromises);

    const arenas = arenaSnapshots
      .map(function (snapshot) {
        return snapshot.val();
      })
      .filter(Boolean);

    list.innerHTML = arenas.map(function (arena) {
      return `
        <article class="arena-card">
          <div>
            <span class="eyebrow">Arena ativa</span>
            <h3>${arena.name}</h3>
            <p>Agora esse é o lugar onde sua galera vai competir.</p>
          </div>

          <button class="btn btn-secondary">
            Abrir Arena
          </button>
        </article>
      `;
    }).join("");

  } catch (error) {
    console.error(error);

    list.innerHTML = `
      <div class="empty-state small">
        <h3>Não conseguimos buscar suas Arenas.</h3>
        <p>Verifique as regras do Firebase e tente novamente.</p>
      </div>
    `;
  }
}
