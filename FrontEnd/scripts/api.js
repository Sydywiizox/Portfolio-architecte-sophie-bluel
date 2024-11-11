const getWorksUrl = "http://localhost:5678/api/works";
const getCategoriesUrl = "http://localhost:5678/api/categories";
const postLoginUrl = "http://localhost:5678/api/users/login";
console.log("api.js");
export function fetchCategories() {
    return fetch(getCategoriesUrl);
}

export function fetchWorks() {
    return fetch(getWorksUrl);
}

export function fetchLogin(formContent) {
    return fetch(postLoginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formContent),
    });
}

export function postImage(formData) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        console.error("Token manquant ou invalide");
        return;
    }
    return fetch(getWorksUrl, {
        method: "POST",
        body: formData, // Envoi de FormData
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export function deleteImage(id) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        console.error("Token manquant ou invalide");
        return;
    }
    return fetch(getWorksUrl + `/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
}
