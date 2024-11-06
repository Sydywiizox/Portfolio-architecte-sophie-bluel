const getWorksUrl = "http://localhost:5678/api/works";
const getCategoriesUrl = "http://localhost:5678/api/categories";
const postLoginUrl = "http://localhost:5678/api/users/login"
let allWorks = [];

if(window.location.href.includes("index.html")) {
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
}

if(window.location.href.includes("login.html"))  {
    const formLogin = document.querySelector("#login form")
    formLogin.addEventListener("submit", function(event) {
        event.preventDefault()
        const formContent = {
            email: event.target.querySelector("[name=email]").value,
            password: event.target.querySelector("[name=password]").value,
        }
        JSON.stringify(formContent)
        fetch(postLoginUrl, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(formContent)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Login failed');
        })
        .then(data => {
            const token = data.token;
            localStorage.setItem("auth_token", token);
            window.location.href = "index.html";
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert("Identifiants incorrects. Veuillez réessayer.");
        });
    })
}

if(localStorage.getItem("auth_token")) {
    const login = document.querySelector(".nav-login")
    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.removeItem("auth_token");
        login.textContent = "login";
        login.removeEventListener("click", handleLogout);
    };
    
    if (localStorage.getItem("auth_token")) {
        login.textContent = "logout";
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