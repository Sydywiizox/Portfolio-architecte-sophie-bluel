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
            figure.setAttribute("img-id", work.id);
            figure.appendChild(img);
            figure.appendChild(figcaption);
            gallery.appendChild(figure);
        });
    }

    function removeFromGallery(id) {
        document.querySelector(`.gallery figure[img-id="${id}"]`).remove();
    }

    function postImage(formData) {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            console.error("Token manquant ou invalide");
            return;
        }
    
        fetch(getWorksUrl, {
            method: "POST",
            body: formData,  // Envoi de FormData
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    console.error("Erreur serveur:", text);  // Log de l'erreur complète
                    throw new Error(text);  // Lancer l'erreur avec texte de la réponse
                });
            }
            return response.json();  // On traite la réponse JSON si tout est OK
        })
        .then((data) => {
            console.log("Image envoyée avec succès :", data);
        })
        .catch((error) => {
            console.error("Erreur:", error);
        });
    }

    function deleteImage(id, divElement) {
        fetch(getWorksUrl + `/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
        })
            .then((response) => {
                if (response.ok) {
                    console.log("Opération réussie");
                    removeFromGallery(divElement.getAttribute("img-id"));
                    divElement.remove();
                } else {
                    console.log("Erreur de suppression");
                }
            })
            .catch((error) => console.error("Erreur:", error));
    }

    function displayGallery(works, element) {
        works.forEach((work) => {
            const img = document.createElement("img");
            img.src = work.imageUrl;
            img.alt = work.title;

            const divImg = document.createElement("div");
            divImg.setAttribute("img-id", work.id);

            const trash = document.createElement("i");
            trash.classList.add("fa-solid", "fa-trash-can");

            trash.addEventListener("click", () => deleteImage(work.id, divImg));

            divImg.appendChild(img);
            divImg.appendChild(trash);
            element.appendChild(divImg);
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
    loadGallery();
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

    const sendForm = () => {
        const form = document.querySelector("#imageForm");
    
        if (!form) {
            console.log("Formulaire non trouvé");
            return;
        }
    
        const formData = new FormData(form);
        console.log(formData)    
    
        // Log les données du formulaire pour vérifier
        for (let [key, value] of formData.entries()) {
            console.log(key, value);  // Log des clés et des valeurs
        }
        
        postImage(formData);  // Envoi de l'image
    };

    const addPhotoModal = () => {
        const addPhotoButton = document.querySelector(
            ".modal-content button.addPhoto"
        );
        addPhotoButton.removeEventListener("click", addPhotoModal);
        modal.querySelector(".modal-content h2").textContent = "Ajout photo";
        addPhotoButton.textContent = "Valider";
        addPhotoButton.addEventListener("click", sendForm);
        const backButton = document.querySelector(".backButton");
        backButton.style.display = "block";
        backButton.addEventListener("click", galleryModal);
        const form = document.querySelector(".modal-form");
        form.style.display = "block";
        const grid = document.querySelector(".modal-grid");
        grid.style.display = "none";
        console.log(modal);
    };

    function loadGallery() {
        const gallery = document.querySelector(".modal-grid");
        fetch(getWorksUrl)
            .then((response) => response.json())
            .then((works) => {
                allWorks = works;
                displayGallery(allWorks, gallery);
            })
            .catch((error) =>
                console.error(
                    "Erreur lors de la récupération des travaux :",
                    error
                )
            );
    }

    const galleryModal = () => {
        const backButton = document.querySelector(".backButton");
        backButton.style.display = "none";

        modal.querySelector(".modal-content h2").textContent = "Galerie photo";
        modal.querySelector(".modal-content button.addPhoto").textContent =
            "Ajouter une photo";
        const form = document.querySelector(".modal-form");
        form.style.display = "none";
        const grid = document.querySelector(".modal-grid");
        grid.style.display = "grid";
        const addPhotoButton = document.querySelector(
            ".modal-content button.addPhoto"
        );
        console.log(addPhotoButton);
        addPhotoButton.addEventListener("click", addPhotoModal);
        console.log(modal);
    };
    const addPhotoButton = document.querySelector(
        ".modal-content button.addPhoto"
    );
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

    console.log(editButton);
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
