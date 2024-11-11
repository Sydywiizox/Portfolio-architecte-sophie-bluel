import * as Auth from "./auth.js";
import * as Login from "./login.js";
import * as Modal from "./modal.js";
import * as Works from "./works.js";
import * as Categories from "./categories.js";

if (window.location.href.includes("index.html")) {
    Modal.modal();
    Works.works();
    Categories.categories();
}
if (window.location.href.includes("login.html")) {
    Login.login();
}

if (localStorage.getItem("auth_token")) {
    Auth.auth();
}
