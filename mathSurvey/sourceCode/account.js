let username = document.getElementById("username");
let password = document.getElementById("password");
let output = document.getElementById("output");

document.getElementById("account_form").addEventListener("submit", async function(event) {
    event.preventDefault();
    if (username.value.trim() === "" || password.value.trim() === "") {
        alert("Enter a username and password.");
        return;
    }
    try {
        let response = await fetch("/create", {
            method: "POST",
            body: JSON.stringify({username: username.value, password: password.value})
        });
        let data = await response.json();
        if (data.error) {
            alert(data.error);
            return;
        }
        output.textContent = data.message;
        password.value = "";
    } catch (error) {
        alert("The account could not be created. Check that the server is running.");
    }
});
