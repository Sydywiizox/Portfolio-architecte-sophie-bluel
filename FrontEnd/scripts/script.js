const getWorksUrl = "http://localhost:5678/api/works";
const getCategoriesUrl = "http://localhost:5678/api/categories";
const postLoginUrl = "http://localhost:5678/api/users/login";
let allWorks = [];

if (window.location.href.includes("index.html")) {
    function displayWorks(works) {
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = "";

        works.forEach((work) => {
            const figure = document.createElement("figure");
            const img = document.createElement("img");
            img.src = work.imageUrl;
            img.alt = work.title;

            const figcaption = document.createElement("figcaption");
            figcaption.textContent = work.title;

            figure.appendChild(img);
            figure.appendChild(figcaption);
            gallery.appendChild(figure);
        });
    }

    fetch(getWorksUrl)
        .then((response) => response.json())
        .then((works) => {
            allWorks = works;
            displayWorks(allWorks);
        })
        .catch((error) =>
            console.error("Erreur lors de la récupération des travaux :", error)
        );

    fetch(getCategoriesUrl)
        .then((response) => response.json())
        .then((categories) => {
            const uniqueCategoriesMap = {};
            categories.forEach((categorie) => {
                uniqueCategoriesMap[categorie.id] = categorie;
            });
            const uniqueCategories = Object.values(uniqueCategoriesMap);
            const allButton = document.createElement("button");
            allButton.textContent = "Tous";
            allButton.setAttribute("id", "0");
            allButton.classList.add("categorie");
            allButton.classList.add("active");
            allButton.addEventListener("click", () => {
                displayWorks(allWorks);
                setActiveButton(allButton);
            });
            document.querySelector(".categories").appendChild(allButton);
            uniqueCategories.forEach((categorie) => {
                const button = document.createElement("button");
                button.textContent = categorie.name;
                button.setAttribute("id", `${categorie.id}`);
                button.classList.add("categorie");
                button.addEventListener("click", () => {
                    setActiveButton(button);
                    const filteredWorks = allWorks.filter(
                        (work) => work.categoryId === categorie.id
                    );
                    displayWorks(filteredWorks);
                });
                document.querySelector(".categories").appendChild(button);
            });
        });

    function setActiveButton(selectedButton) {
        const buttons = document.querySelectorAll(".categorie");
        buttons.forEach((button) => button.classList.remove("active"));
        selectedButton.classList.add("active");
    }
    // MODAL
    let modal = null;
    const selectable = "button, a, input, textarea";
    let focusable = [];
    previouslyFocus = null;

    const openModal = function (e) {
        modal = document.querySelector(e.target.getAttribute("href"));
        focusable = Array.from(modal.querySelectorAll(selectable));
        previouslyFocus = document.activeElement;
        modal.style.display = "flex";
        setTimeout(() => {
            if (focusable.length > 0) {
                focusable[focusable.length - 1].focus();
            }
        }, 100);
        modal.removeAttribute("aria-hidden");
        modal.addEventListener("click", closeModal);
        modal
            .querySelector(".js-modal-close")
            .addEventListener("click", closeModal);
        modal
            .querySelector(".js-modal-stop")
            .addEventListener("click", stopPropagation);
    };

    const closeModal = function (e) {
        if (modal === null) return;
        if (previouslyFocus !== null) previouslyFocus.focus();
        e.preventDefault();
        const hideModal = function () {
            modal.style.display = "none";
            modal.removeEventListener("animationend", hideModal);
            modal = null;
        };
        modal.addEventListener("animationend", hideModal);
        modal.setAttribute("aria-hidden", "true");
        modal.removeEventListener("click", closeModal);
        modal
            .querySelector(".js-modal-close")
            .removeEventListener("click", closeModal);
        modal
            .querySelector(".js-modal-stop")
            .removeEventListener("click", stopPropagation);
        galleryModal();
    };

    const stopPropagation = function (e) {
        e.stopPropagation();
    };

    document.querySelectorAll(".js-modal").forEach((a) => {
        a.addEventListener("click", openModal);
    });

    const focusInModal = function (e) {
        e.preventDefault();
        const focusedElement = document.activeElement;
        let index = focusable.indexOf(focusedElement);
        e.shiftKey === true ? index-- : index++;
        if (index >= focusable.length) {
            index = 0;
        }
        if (index < 0) {
            index = focusable.length - 1;
        }
        focusable[index].focus();
    };

    window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.key === "Esc") {
            closeModal(e);
        }
        if (e.key === "Tab" && modal !== null) {
            focusInModal(e);
        }
    });

    const addPhotoModal = () => {
        const addPhotoButton = document.querySelector(".modal-content button");
        addPhotoButton.removeEventListener("click", addPhotoModal);
        modal.querySelector(".modal-content h2").textContent = "Ajout photo";
        modal.querySelector(".modal-content button").textContent = "Valider";
        const backButton = document.createElement("button");
        backButton.classList.add("backButton");
        backButton.innerHTML = `
            <i class="fa-solid fa-arrow-left"></i> Retour
        `;
        const form = document.createElement("div");
        form.classList.add("modal-form");
        modal
            .querySelector(".modal-content h2")
            .insertAdjacentElement("afterend", form);
        modal.querySelector(".modal-content").prepend(backButton);
        backButton.addEventListener("click", galleryModal);
        if (modal && modal.querySelector(".modal-content .modal-grid")) {
            modal.querySelector(".modal-content .modal-grid").remove();
        }

        console.log(modal);
    };

    const galleryModal = () => {
        if (modal && modal.querySelector(".modal-content .backButton")) {
            modal.querySelector(".modal-content .backButton").remove();
        }

        modal.querySelector(".modal-content h2").textContent = "Galerie photo";
        if (!(modal && modal.querySelector(".modal-content .modal-grid"))) {
            const gallery = document.createElement("div");
            gallery.classList.add("modal-grid");
            gallery.innerHTML = `
                <div>img</div><div>img</div><div>img</div><div>img</div><div>img</div>
                <div>img</div><div>img</div><div>img</div><div>img</div><div>img</div>
                <div>img</div><div>img</div><div>img</div><div>img</div><div>img</div>
            `;
            modal
                .querySelector(".modal-content h2")
                .insertAdjacentElement("afterend", gallery);
        }

        modal.querySelector(".modal-content button").textContent =
            "Ajouter une photo";
        if (modal && modal.querySelector(".modal-content .modal-form")) {
            modal.querySelector(".modal-content .modal-form").remove();
        }
        const addPhotoButton = document.querySelector(".modal-content button");
        console.log(addPhotoButton);
        addPhotoButton.addEventListener("click", addPhotoModal);
        console.log(modal);
    };
    const addPhotoButton = document.querySelector(".modal-content button");
    console.log(addPhotoButton);
    addPhotoButton.addEventListener("click", addPhotoModal);
}

if (window.location.href.includes("login.html")) {
    const formLogin = document.querySelector("#login form");
    formLogin.addEventListener("submit", function (event) {
        event.preventDefault();
        const formContent = {
            email: event.target.querySelector("[name=email]").value,
            password: event.target.querySelector("[name=password]").value,
        };
        JSON.stringify(formContent);
        fetch(postLoginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formContent),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error("Login failed");
            })
            .then((data) => {
                const token = data.token;
                localStorage.setItem("auth_token", token);
                window.location.href = "index.html";
            })
            .catch((error) => {
                console.error("Erreur:", error);
                alert("Identifiants incorrects. Veuillez réessayer.");
            });
    });
}

if (localStorage.getItem("auth_token")) {
    const login = document.querySelector(".nav-login");
    const edit = document.querySelector(".edit");
    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.removeItem("auth_token");
        login.textContent = "login";
        edit.style.display = "none";
        login.removeEventListener("click", handleLogout);
    };

    if (localStorage.getItem("auth_token")) {
        login.textContent = "logout";
        edit.style.display = "block";
        document.body.prepend();
        login.addEventListener("click", handleLogout);
    }
}

/*
fetch('url-de-la-requete', {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    },
})
.then(response => {
    if (response.ok) {
        console.log('Opération réussie');
    } else {
        console.log('Erreur de suppression');
    }
})
.catch(error => console.error('Erreur:', error)); 
*/
