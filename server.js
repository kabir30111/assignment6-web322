/********************************************************************************
*  WEB322 – Assignment 03
*  
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*  
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*  
*  Name: Kabir Hemant Merchant
*  Student ID: 101390243
*  Date: 17-02-2025  
*
********************************************************************************/

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("public"));

// Home Page
app.get("/", (req, res) => res.render("home"));

// About Page
app.get("/about", (req, res) => res.render("about"));

// Projects List Page
app.get("/solutions/projects", (req, res) => {
    const projects = [
        { id: 1, title: "Solar Energy", sector: "Energy", summary_short: "Solar power generation." },
        { id: 2, title: "Wind Turbines", sector: "Energy", summary_short: "Wind energy conversion." }
    ];
    res.render("projects", { projects });
});

// Individual Project Page
app.get("/solutions/projects/:id", (req, res) => {
    const project = {
        id: req.params.id,
        title: "Solar Energy",
        feature_img_url: "https://example.com/solar.jpg",
        intro_short: "Solar energy project",
        impact: "Reduced carbon emissions",
        original_source_url: "https://example.com/full-article"
    };
    res.render("project", { project });
});

// 404 Page
app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
