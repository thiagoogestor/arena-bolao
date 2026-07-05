const userNameElement = document.querySelector("[data-user-name]");
const logoutButton = document.querySelector("[data-logout]");

auth.onAuthStateChanged(async function (user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const snapshot = await db.ref(`users/${user.uid}`).once("value");
  const profile = snapshot.val();

  userNameElement.textContent = `Olá, ${profile?.name || "jogador"} 👋`;
});

logoutButton.addEventListener("click", async function () {
  await auth.signOut();
  window.location.href = "index.html";
});
