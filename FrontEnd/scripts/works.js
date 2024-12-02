import * as Api from "./api.js";
import * as Categories from "./categories.js";
let allWorks = [];
export function works() {
    Api.fetchWorks()
        .then((response) => response.json())
        .then((works) => {
            allWorks = works;
            displayWorks(allWorks);
        })
        .catch((error) =>
            console.error("Erreur lors de la récupération des travaux :", error)
        );
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

export function getWorks() {
    return allWorks;
}

export function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    let loadedImages = 0;

    works.forEach((work) => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        img.addEventListener("load", () => {
            loadedImages++;
            if (loadedImages === works.length) {
                const url = window.location.hash;
                if (url === "#contact") {
                    console.log("Contact");
                    const contact = document.querySelector("#contact");
                    contact.scrollIntoView();
                }
            }
        });

        const figcaption = document.createElement("figcaption");
        figcaption.textContent = work.title;
        figure.setAttribute("img-id", work.id);
        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    });
}

export function removeFromGallery(id) {
    document.querySelector(`.gallery figure[img-id="${id}"]`).remove();
}

export function postImage(formData) {
    Api.postImage(formData)
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
    Categories.refresh();
}

export function refreshGallery() {
    const gallery = document.querySelector(".modal-grid");
    Api.fetchWorks()
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
            Api.fetchWorks()
                .then((response) => response.json())
                .then((works) => {
                    allWorks = works;
                })
                .catch((error) =>
                    console.error(
                        "Erreur lors de la récupération des travaux :",
                        error
                    )
                );
        })
        .catch((error) =>
            console.error("Erreur lors de la récupération des travaux :", error)
        );
}
export function loadGallery() {
    const gallery = document.querySelector(".modal-grid");
    Api.fetchWorks()
        .then((response) => response.json())
        .then((works) => {
            allWorks = works;
            displayGallery(allWorks, gallery);
        })
        .catch((error) =>
            console.error("Erreur lors de la récupération des travaux :", error)
        );
}
export function deleteImage(id, divElement) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        console.error("Token manquant ou invalide");
        return;
    }
    Api.deleteImage(id)
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
