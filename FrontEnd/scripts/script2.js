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
            body: formData, // Envoi de FormData
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        console.error("Erreur serveur:", text); // Log de l'erreur complète
                        throw new Error(text); // Lancer l'erreur avec texte de la réponse
                    });
                }
                return response.json(); // On traite la réponse JSON si tout est OK
            })
            .then((data) => {
                console.log("Image envoyée avec succès :", data);
                refreshGallery();
            })
            .catch((error) => {
                console.error("Erreur:", error);
            });
    }

    function deleteImage(id, divElement) {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            console.error("Token manquant ou invalide");
            return;
        }
        fetch(getWorksUrl + `/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
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
        console.log(formData);

        // Log les données du formulaire pour vérifier
        for (let [key, value] of formData.entries()) {
            console.log(key, value); // Log des clés et des valeurs
        }

        postImage(formData); // Envoi de l'image
        form.reset();
        resetPreview();
    };

    function resetPreview() {
        const form = document.querySelector("#imageForm");
        const imagePreview = form.querySelector(".image-preview");
        const addImageDiv = form.querySelector(".addImage");
        const elementsToHide = addImageDiv.querySelectorAll(
            "i, .file-upload-label, p"
        );
        elementsToHide.forEach((element) => {
            element.style.display = "block";
        });
        imagePreview.src = "";
        imagePreview.style.display = "none"; // Affiche l'image de prévisualisation
        addImageDiv.style.paddingBlock = "13px 19px";
    }

    function verifImage() {
        const form = document.querySelector("#imageForm");
        const fileInput = form.querySelector("#file-upload");
        const imagePreview = form.querySelector(".image-preview");
        const addImageDiv = form.querySelector(".addImage");
        const elementsToHide = addImageDiv.querySelectorAll(
            "i, .file-upload-label, p"
        ); // Sélectionne les autres éléments à masquer
        const file = fileInput.files[0]; // Récupère le fichier sélectionné
        console.log(file);
        if (file && file.type.startsWith("image/")) {
            // Affiche l'aperçu de l'image
            imagePreview.src = URL.createObjectURL(file);
            imagePreview.style.display = "block"; // Affiche l'image de prévisualisation
            addImageDiv.style.paddingBlock = "0";

            // Masque les autres éléments dans le div .addImage
            elementsToHide.forEach((element) => {
                element.style.display = "none";
            });
        } else {
            // Si aucun fichier ou fichier non image, cache la prévisualisation et affiche les autres éléments
            imagePreview.style.display = "none";
            imagePreview.src = "";
            addImageDiv.style.paddingBlock = "13px 19px";

            // Réaffiche les autres éléments dans le div .addImage
            elementsToHide.forEach((element) => {
                element.style.display = "block";
            });
        }
        // Permet de modifier l'image en cliquant sur l'aperçu
        imagePreview.addEventListener("click", () => {
            fileInput.click(); // Ouvre à nouveau le sélecteur de fichiers
        });
        return fileInput.files.length > 0;
    }

    const verifForm = () => {
        const form = document.querySelector("#imageForm");
        const title = form.querySelector("#image-title");
        const categ = form.querySelector("#image-categ");
        const imageOk = verifImage();
        const titleOk = title.value.trim() != "";
        const categOk = categ.value > 0;
        console.log([imageOk, title, categ]);
        console.log("Image : " + imageOk);
        console.log("Titre : " + titleOk);
        console.log("Categ : " + categOk);
        console.log(document.querySelector(".validPhoto"));
        if (imageOk && titleOk && categOk) {
            document.querySelector(".validPhoto").classList.remove("disabled");
        } else document.querySelector(".validPhoto").classList.add("disabled");
    };

    function loadCategories() {
        const getCategoriesUrl = "http://localhost:5678/api/categories";
        const categorySelect = document.querySelector("#image-categ");
        fetch(getCategoriesUrl)
            .then((response) => response.json())
            .then((categories) => {
                // Ajouter une option par défaut si nécessaire
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Sélectionnez une catégorie";
                categorySelect.appendChild(defaultOption);

                // Boucler à travers les catégories et les ajouter au select
                categories.forEach((category) => {
                    const option = document.createElement("option");
                    option.value = category.id; // Attribuer l'ID de la catégorie comme valeur
                    option.textContent = category.name; // Nom de la catégorie affiché
                    categorySelect.appendChild(option);
                });
            })
            .catch((error) => {
                console.error(
                    "Erreur lors de la récupération des catégories :",
                    error
                );
            });
    }

    function refreshGallery() {
        const gallery = document.querySelector(".modal-grid");
        fetch(getWorksUrl)
            .then((response) => response.json())
            .then((works) => {
                const lastWork = works[works.length - 1]; // Récupère le dernier travail
                const img = document.createElement("img");
                img.src = lastWork.imageUrl;
                img.alt = lastWork.title;

                const divImg = document.createElement("div");
                divImg.setAttribute("img-id", lastWork.id);

                const trash = document.createElement("i");
                trash.classList.add("fa-solid", "fa-trash-can");

                trash.addEventListener("click", () =>
                    deleteImage(lastWork.id, divImg)
                );

                divImg.appendChild(img);
                divImg.appendChild(trash);
                gallery.appendChild(divImg);

                const galleryG = document.querySelector(".gallery");
                const figure = document.createElement("figure");
                const imgG = document.createElement("img");
                imgG.src = lastWork.imageUrl;
                imgG.alt = lastWork.title;

                const figcaption = document.createElement("figcaption");
                figcaption.textContent = lastWork.title;
                figure.setAttribute("img-id", lastWork.id);
                figure.appendChild(imgG);
                figure.appendChild(figcaption);
                galleryG.appendChild(figure);
            })
            .catch((error) =>
                console.error(
                    "Erreur lors de la récupération des travaux :",
                    error
                )
            );
    }

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

    const addPhotoModal = () => {
        modal.querySelector(".modal-content h2").textContent = "Ajout photo";
        modal.querySelector(".modal-content button.addPhoto").style.display =
            "none";
        modal.querySelector(".modal-content button.validPhoto").style.display =
            "block";
        document.querySelector(".backButton").style.display = "block";
        document.querySelector(".modal-form").style.display = "block";
        document.querySelector(".modal-grid").style.display = "none";
    };

    const galleryModal = () => {
        modal.querySelector(".backButton").style.display = "none";
        modal.querySelector(".modal-content h2").textContent = "Galerie photo";
        modal.querySelector(".modal-content button.addPhoto").style.display =
            "block";
        modal.querySelector(".modal-content button.validPhoto").style.display =
            "none";
        modal.querySelector(".modal-form").style.display = "none";
        modal.querySelector(".modal-grid").style.display = "grid";
    };

    document.addEventListener("DOMContentLoaded", () => {
        const form = document.querySelector("#imageForm");
        form.reset();
        resetPreview();
    });

    document.addEventListener("DOMContentLoaded", loadCategories);

    const form = document.querySelector(".modal-form");
    form.addEventListener("submit", sendForm);
    form.addEventListener("input", verifForm);

    const addPhotoButton = document.querySelector(
        ".modal-content button.addPhoto"
    );
    addPhotoButton.addEventListener("click", addPhotoModal);

    const validPhotoButton = document.querySelector(
        ".modal-content button.validPhoto"
    );
    validPhotoButton.addEventListener("click", sendForm);

    const backButton = document.querySelector(".backButton");
    backButton.addEventListener("click", galleryModal);
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
                    passwordError.textContent = "Le mot de passe est incorrect.";
                } else if (response.status === 401) {
                    password.classList.add("invalid");
                    password.style.outline = "2px solid red";
                    passwordError.style.visibility = "visible";
                    passwordError.textContent = "Le mot de passe est incorrect.";
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
