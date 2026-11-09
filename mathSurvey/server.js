const express = require("express");
const fs = require("fs");
const app = express();
let sessions = [];

app.use(express.static("sourceCode"));

async function readInput(req) {
    let text = "";
    for await (const chunk of req) {
        text += chunk;
    }
    return JSON.parse(text);
}

function accountList() {
    return JSON.parse(fs.readFileSync("back/accounts.json"));
}

function loggedIn(token) {
    for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].token === token) {
            return sessions[i].file;
        }
    }
    return null;
}

app.post("/create", async function(req, res) {
    try {
        let input = await readInput(req);
        if (typeof input.username !== "string" || typeof input.password !== "string" ||
            input.username.trim() === "" || input.password.trim() === "") {
            res.send({error: "Enter a username and password."});
            return;
        }
        let accounts = accountList();
        let id = 1;
        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].username === input.username.trim()) {
                res.send({error: "That username is already taken."});
                return;
            }
            if (accounts[i].id >= id) {
                id = accounts[i].id + 1;
            }
        }
        let file = "back/accounts/" + id + ".json";
        let account = {
            id: id,
            username: input.username.trim(),
            password: input.password,
            submitted: false,
            name: "",
            topic: "",
            confidence: "",
            hours: "",
            notes: ""
        };
        fs.writeFileSync(file, JSON.stringify(account), {flag: "wx"});
        accounts[accounts.length] = {
            username: account.username,
            password: account.password,
            file: file,
            id: id
        };
        fs.writeFileSync("back/accounts.json", JSON.stringify(accounts));
        res.send({message: "Account created. You can now log in."});
    } catch (error) {
        res.status(500).send({error: "The account could not be created."});
    }
});

app.post("/login", async function(req, res) {
    try {
        let input = await readInput(req);
        let accounts = accountList();
        for (let i = 0; i < accounts.length; i++) {
            if (accounts[i].username === input.username && accounts[i].password === input.password) {
                let token = "";
                do {
                    token = Math.random().toString(36) + Math.random().toString(36);
                } while (loggedIn(token) !== null);
                sessions[sessions.length] = {token: token, file: accounts[i].file};
                res.send({token: token});
                return;
            }
        }
        res.send({error: "Login information is incorrect."});
    } catch (error) {
        res.status(500).send({error: "Login could not be completed."});
    }
});

app.post("/survey", async function(req, res) {
    try {
        let input = await readInput(req);
        let file = loggedIn(input.token);
        if (file === null) {
            res.status(401).send({error: "Please log in again."});
            return;
        }
        let account = JSON.parse(fs.readFileSync(file));
        res.send({id: account.id, name: account.name, topic: account.topic,
            confidence: account.confidence, hours: account.hours, notes: account.notes});
    } catch (error) {
        res.status(500).send({error: "The survey could not be loaded."});
    }
});

app.post("/save", async function(req, res) {
    try {
        let input = await readInput(req);
        let file = loggedIn(input.token);
        if (file === null) {
            res.status(401).send({error: "Please log in again."});
            return;
        }
        let account = JSON.parse(fs.readFileSync(file));
        if (input.password !== account.password) {
            res.send({error: "Password is incorrect. Your answers were not changed."});
            return;
        }
        if (typeof input.name !== "string" || typeof input.notes !== "string" ||
            !["", "Algebra", "Geometry", "Statistics"].includes(input.topic) ||
            !["", "Low", "Medium", "High"].includes(input.confidence) ||
            typeof input.hours !== "string" ||
            (input.hours !== "" && (!Number.isFinite(Number(input.hours)) ||
                Number(input.hours) < 0 || Number(input.hours) > 168))) {
            res.send({error: "Check your survey answers. Hours must be between 0 and 168."});
            return;
        }
        account.name = input.name;
        account.topic = input.topic;
        account.confidence = input.confidence;
        account.hours = input.hours;
        account.notes = input.notes;
        account.submitted = true;
        fs.writeFileSync(file, JSON.stringify(account));
        res.send({message: "Your answers were saved."});
    } catch (error) {
        res.status(500).send({error: "Your answers could not be saved."});
    }
});

app.post("/records", async function(req, res) {
    try {
        let input = await readInput(req);
        if (loggedIn(input.token) === null) {
            res.status(401).send({error: "Please log in again."});
            return;
        }
        let accounts = accountList();
        let records = [];
        let total = 0;
        let answeredHours = 0;
        let submitted = 0;
        for (let i = 0; i < accounts.length; i++) {
            let account = JSON.parse(fs.readFileSync(accounts[i].file));
            records[records.length] = {id: account.id, submitted: account.submitted,
                name: account.name, topic: account.topic, confidence: account.confidence,
                hours: account.hours, notes: account.notes};
            if (account.submitted) {
                submitted++;
                if (account.hours !== "") {
                    total += Number(account.hours);
                    answeredHours++;
                }
            }
        }
        let average = "No answers yet";
        if (answeredHours > 0) {
            average = (total / answeredHours).toFixed(1);
        }
        res.send({records: records, submitted: submitted, average: average});
    } catch (error) {
        res.status(500).send({error: "The records could not be loaded."});
    }
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Server is running on port " + (process.env.PORT || 3000));
});
