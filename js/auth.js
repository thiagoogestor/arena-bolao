const form = document.querySelector("[data-auth-form]");
const nameInput = document.querySelector("[data-name]");
const emailInput = document.querySelector("[data-email]");
const passwordInput = document.querySelector("[data-password]");
const feedback = document.querySelector("[data-feedback]");

function showFeedback(message, type = "info") {
  feedback.textContent = message;
  feedback.className = `auth-feedback ${type}`;
}

async function createUserProfile(user, name) {
  const userRef = db.ref(`users/${user.uid}`);

  const snapshot = await userRef.once("value");

  if (!snapshot.exists()) {
    await userRef.set({
      uid: user.uid,
      name: name,
      email: user.email,
      role: "player",
      points: 0,
      createdAt: Date.now()
    });
  }
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!name || !email || !password) {
    showFeedback("Preencha nome, e-mail e senha.", "error");
    return;
  }

  if (password.length < 6) {
    showFeedback("A senha precisa ter pelo menos 6 caracteres.", "error");
    return;
  }

  showFeedback("Conectando...", "info");

  try {
    const login = await auth.signInWithEmailAndPassword(email, password);

    await createUserProfile(login.user, name);

    showFeedback("Login realizado com sucesso!", "success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);

  } catch (loginError) {
    try {
      const register = await auth.createUserWithEmailAndPassword(email, password);

      await createUserProfile(register.user, name);

      showFeedback("Conta criada com sucesso!", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);

    } catch (registerError) {
      let message = "Não foi possível entrar. Verifique seus dados.";

      if (registerError.code === "auth/email-already-in-use") {
        message = "Este e-mail já existe. Verifique a senha.";
      }

      if (registerError.code === "auth/invalid-email") {
        message = "Digite um e-mail válido.";
      }

      if (registerError.code === "auth/weak-password") {
        message = "A senha está fraca. Use pelo menos 6 caracteres.";
      }

      showFeedback(message, "error");
    }
  }
});

const googleButton = document.querySelector("[data-google-login]");

googleButton.addEventListener("click", async function () {
  showFeedback("Abrindo login do Google...", "info");

  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    await createUserProfile(user, user.displayName || "Jogador");

    showFeedback("Login com Google realizado!", "success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);

} catch (error) {
  console.error(error);
  showFeedback(`Erro Google: ${error.code}`, "error");
}
});
