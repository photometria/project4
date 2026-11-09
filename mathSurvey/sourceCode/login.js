let username = document.getElementById("username");
let password = document.getElementById("password");
let remember = document.getElementById("remember");

sessionStorage.removeItem("login");
remember.checked = localStorage.getItem("remember") === "true";
if (remember.checked) {
    username.value = localStorage.getItem("username") || "";
}

function rememberUsername() {
    localStorage.setItem("remember", remember.checked);
    if (remember.checked) {
        localStorage.setItem("username", username.value);
    } else {
        localStorage.removeItem("username");
    }
}

remember.addEventListener("change", rememberUsername);
username.addEventListener("input", rememberUsername);

document.getElementById("login_form").addEventListener("submit", async function(event) {
    event.preventDefault();
    rememberUsername();
    try {
        let response = await fetch("/login", {
            method: "POST",
            body: JSON.stringify({username: username.value, password: password.value})
        });
        let data = await response.json();
        if (data.error) {
            alert(data.error);
            return;
        }
        sessionStorage.setItem("login", data.token);
        window.location.href = "records.html";
    } catch (error) {
        alert("Login could not be completed. Check that the server is running.");
    }
});
