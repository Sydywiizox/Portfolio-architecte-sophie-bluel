export function auth() {
    const login = document.querySelector(".nav-login");
    const edit = document.querySelector(".edit");
    const editButton = document.querySelector(".js-modal");
    const categories = document.querySelector(".categories");
    const portfolioTitle = document.querySelector("#portfolio h2");
    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.removeItem("auth_token");
        login.textContent = "login";
        edit.style.display = "none";
        editButton.style.display = "none";
        categories.style.display = "flex";
        portfolioTitle.style.marginBottom = "0";
        login.removeEventListener("click", handleLogout);
    };

    if (localStorage.getItem("auth_token")) {
        login.textContent = "logout";
        edit.style.display = "block";
        editButton.style.display = "block";
        categories.style.display = "none";
        portfolioTitle.style.marginBottom = "92px";
        document.body.prepend();
        login.addEventListener("click", handleLogout);
    }

}