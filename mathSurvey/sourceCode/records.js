let idSelect = document.getElementById("id_select");
let output = document.getElementById("output");
let records;
let token = sessionStorage.getItem("login");

function answer(value) {
    if (value.trim() === "") return "Left empty";
    return value;
}

function showRecord() {
    for (let i = 0; i < records.length; i++) {
        if (String(records[i].id) === idSelect.value) {
            let record = records[i];
            document.getElementById("record_id").textContent = record.id;
            document.getElementById("record_name").textContent = answer(record.name);
            document.getElementById("record_topic").textContent = answer(record.topic);
            document.getElementById("record_confidence").textContent = answer(record.confidence);
            document.getElementById("record_hours").textContent = answer(record.hours);
            document.getElementById("record_notes").textContent = answer(record.notes);
            output.textContent = record.submitted ? "Saved survey answers" : "This account has not submitted a survey yet.";
        }
    }
}

async function loadRecords() {
    if (token === null) {
        window.location.href = "index.html";
        return;
    }
    try {
        let response = await fetch("/records", {method: "POST", body: JSON.stringify({token: token})});
        let data = await response.json();
        if (data.error) {
            alert(data.error);
            if (response.status === 401) window.location.href = "index.html";
            return;
        }
        records = data.records;
        document.getElementById("statistics").textContent = "Accounts: " + records.length +
            " | Surveys submitted: " + data.submitted + " | Average study hours per week: " + data.average;
        idSelect.innerHTML = "";
        for (let i = 0; i < records.length; i++) {
            idSelect.innerHTML += '<option value="' + records[i].id + '">' + records[i].id + '</option>';
        }
        showRecord();
    } catch (error) {
        alert("The records could not be loaded.");
    }
}

idSelect.addEventListener("change", showRecord);
loadRecords();
