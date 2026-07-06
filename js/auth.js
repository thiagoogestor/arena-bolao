document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("[data-auth-form]");
  const nameInput = document.querySelector("[data-name]");
  const emailInput = document.querySelector("[data-email]");
  const passwordInput = document.querySelector("[data-password]");
  const feedback = document.querySelector("[data-feedback]");
  const googleButton = document.querySelector("[data-google-login]");

  function showFeedback(message, type = "info") {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = `auth-feedback ${type}`;
  }

  async function createUserProfile(user, name) {
    const userRef = db.ref(`users/${user.uid}`);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      await userRef.set({
        uid: user.uid,
        name: name || user.displayName || "Jogador",
        email: user.email,
        photoURL: user.photoURL || "",
        role: "player",
        points: 0,
        createdAt: Date.now()
      });
    }
  }

  auth.onAuthStateChanged(async function (user) {
    if (user) {
      await createUserProfile(user, user.displayName || "Jogador");
      window.location.href = "dashboard.html";
    }
  });

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!name || !email || !password) {
        showFeedback("Preencha nome, e-mail e senha.", "error");
        return;
      }

      showFeedback("Conectando...", "info");

      try {
        const login = await auth.signInWithEmailAndPassword(email, password);
        await createUserProfile(login.user, name);
        window.location.href = "dashboard.html";
      } catch (loginError) {
        try {
          const register = await auth.createUserWithEmailAndPassword(email, password);
          await createUserProfile(register.user, name);
          window.location.href = "dashboard.html";
        } catch (registerError) {
          showFeedback(`Erro: ${registerError.code}`, "error");
        }
      }
    });
  }

  if (googleButton) {
    googleButton.addEventListener("click", async function () {
      showFeedback("Abrindo Google...", "info");

      const provider = new firebase.auth.GoogleAuthProvider();

      try {
        await auth.signInWithPopup(provider);
      } catch (error) {
        console.error(error);
        showFeedback(`Erro Google: ${error.code}`, "error");
      }
    });
  } else {
    console.error("Botão Google não encontrado.");
  }
});
