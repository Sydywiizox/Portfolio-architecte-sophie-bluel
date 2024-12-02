import * as Api from "./api.js";
import * as Works from "./works.js";
let focusable = [];

export function modal() {
    let modal = null;
    const selectable = "button:not(.backButton),i.fa-arrow-left, i.fa-trash-can,label.file-upload-label, input, .image-preview, select";
    let previouslyFocus = null;
    Works.loadGallery();
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
        do{
            if(e.shiftKey === true) {
                index--;    
            } else {
                index++;    
            }
            if (index >= focusable.length) {
                index = 0;
            }
            if (index < 0) {
                index = focusable.length - 1;
            }
        } while(focusable[index].offsetParent === null || focusable[index].classList.contains('disabled'))       
        focusable[index].setAttribute('tabindex', '0')
        focusable[index].focus();
    };

    window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.key === "Esc") {
            closeModal(e);
        }
        if (e.key === "Tab" && modal !== null) {
            focusInModal(e);
        }
        if (e.key === 'Enter') {
            const element = document.activeElement;
            if(element.classList.contains('validPhoto')) return;
            element.click();
          }
    });

    const sendForm = () => {
        const form = document.querySelector("#imageForm");

        if (!form) {
            console.log("Formulaire non trouvé");
            return;
        }

        const formData = new FormData(form);

        Works.postImage(formData); // Envoi de l'image
        form.reset();
        resetPreview();
        document.querySelector(".validPhoto").classList.add("disabled");
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
        if (imageOk && titleOk && categOk) {
            document.querySelector(".validPhoto").classList.remove("disabled");
        } else document.querySelector(".validPhoto").classList.add("disabled");
    };

    function loadCategories() {
        const categorySelect = document.querySelector("#image-categ");
        Api.fetchCategories()
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
