import * as Api from "./api.js";
import * as Works from "./works.js";
export function categories() {
    Api.fetchCategories()
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
                Works.displayWorks(Works.getWorks());
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
                    const filteredWorks = Works.getWorks().filter(
                        (work) => work.categoryId === categorie.id
                    );
                    Works.displayWorks(filteredWorks);
                });
                document.querySelector(".categories").appendChild(button);
            });
        });

    function setActiveButton(selectedButton) {
        const buttons = document.querySelectorAll(".categorie");
        buttons.forEach((button) => button.classList.remove("active"));
        selectedButton.classList.add("active");
    }
}
