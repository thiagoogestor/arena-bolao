firebase.auth().onAuthStateChanged(async function(user){

    if(!user){

        location.href="login.html";

        return;

    }

    document.querySelector("[data-arena-name]").innerText="Minha Arena";

});
