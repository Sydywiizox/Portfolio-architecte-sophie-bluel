import * as Api from "./api.js";
export function login() {
    const formLogin = document.querySelector("#login form");
    formLogin.addEventListener("submit", function (event) {
        event.preventDefault();
        const formContent = {
            email: event.target.querySelector("[name=email]").value,
            password: event.target.querySelector("[name=password]").value,
        };
        JSON.stringify(formContent);
        Api.fetchLogin(formContent)
            .then((response) => {
                const email = document.querySelector("#email");
                const password = document.querySelector("#password");
                const emailError = document.querySelector("#email-error");
                const passwordError = document.querySelector("#password-error");

                // Réinitialiser les styles
                email.classList.remove("invalid");
                password.classList.remove("invalid");
                emailError.style.visibility = "hidden";
                passwordError.style.visibility = "hidden";
                password.style.outline = "none";
                email.style.outline = "none";

                if (response.ok) {
                    return response.json();
                } else if (response.status === 404) {
                    email.classList.add("invalid");
                    email.style.outline = "2px solid red";
                    password.style.outline = "2px solid red";
                    emailError.style.visibility = "visible";
                    emailError.textContent = "L'adresse e-mail est incorrecte.";
                    password.classList.add("invalid");
                    passwordError.style.visibility = "visible";
                    passwordError.textContent =
                        "Le mot de passe est incorrect.";
                } else if (response.status === 401) {
                    password.classList.add("invalid");
                    password.style.outline = "2px solid red";
                    passwordError.style.visibility = "visible";
                    passwordError.textContent =
                        "Le mot de passe est incorrect.";
                } else {
                    throw new Error("Échec de la connexion.");
                }
            })
            .then((data) => {
                const token = data.token;
                localStorage.setItem("auth_token", token);
                window.location.href = "index.html";
            })
            .catch((error) => {
                console.error("Erreur:", error);
            });
    });
}
