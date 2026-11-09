let namebox = document.getElementById("name");
let topic = document.getElementById("topic");
let hours = document.getElementById("hours");
let notes = document.getElementById("notes");
let password = document.getElementById("verify_password");
let output = document.getElementById("output");
let token = sessionStorage.getItem("login");

async function loadSurvey() {
    if (token === null) {
        window.location.href = "index.html";
        return;
    }
    try {
        let response = await fetch("/survey", {method: "POST", body: JSON.stringify({token: token})});
        let data = await response.json();
        if (data.error) {
            alert(data.error);
            if (response.status === 401) window.location.href = "index.html";
            return;
        }
        document.getElementById("account_id").textContent = "Your account ID: " + data.id;
        namebox.value = data.name;
        topic.value = data.topic;
        hours.value = data.hours;
        notes.value = data.notes;
        if (data.confidence !== "") {
            document.querySelector('input[name="confidence"][value="' + data.confidence + '"]').checked = true;
        }
        document.getElementById("save_button").disabled = false;
    } catch (error) {
        alert("The survey could not be loaded.");
    }
}

document.getElementById("survey_form").addEventListener("submit", async function(event) {
    event.preventDefault();
    let confidence = document.querySelector('input[name="confidence"]:checked');
    let confidenceValue = "";
    if (confidence !== null) confidenceValue = confidence.value;
    let answers = {token: token, password: password.value, name: namebox.value,
        topic: topic.value, confidence: confidenceValue, hours: hours.value, notes: notes.value};
    try {
        let response = await fetch("/save", {method: "POST", body: JSON.stringify(answers)});
        let data = await response.json();
        if (data.error) {
            alert(data.error);
            return;
        }
        output.textContent = data.message;
        password.value = "";
    } catch (error) {
        alert("Your answers could not be saved.");
    }
});

loadSurvey();
