/********************************************************************************
*  WEB322 – Assignment 05
*  
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*  
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*  
*  Name: Kabir Hemant Merchant
*  Student ID: 101390243
*  Date: 22-03-2025
*
********************************************************************************/

const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.urlencoded({ extended: true }));

// Set EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Import project functions
const {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  getAllSectors,
  addProject,
  editProject,
  deleteProject
} = require("./modules/projects");

// Home Page
app.get("/", (req, res) => res.render("home"));

// About Page
app.get("/about", (req, res) => res.render("about"));

// Projects List Page
app.get("/solutions/projects", (req, res) => {
  getAllProjects()
    .then((projects) => {
      res.render("projects", { projects });
    })
    .catch((err) => {
      res.render("500", { message: `Error loading projects: ${err}` });
    });
});

// Individual Project Page
app.get("/solutions/projects/:id", (req, res) => {
  getProjectById(req.params.id)
    .then((project) => {
      res.render("project", { project });
    })
    .catch((err) => {
      res.status(404).render("404", { message: err });
    });
});

// Add Project - Form Page
app.get("/solutions/addProject", (req, res) => {
  getAllSectors()
    .then((sectors) => {
      res.render("addProject", {
        sectors,
        page: "/solutions/addProject", // ✅ this is what avoids undefined page errors
      });
    })
    .catch((err) => {
      res.render("500", { message: `Error loading sectors: ${err}` });
    });
});

// Add Project - Submission
app.post("/solutions/addProject", (req, res) => {
  addProject(req.body)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});


// Edit Project - Form
app.get("/solutions/editProject/:id", (req, res) => {
  Promise.all([
    getAllSectors(),
    getProjectById(req.params.id)
  ])
    .then(([sectors, project]) => {
      res.render("editProject", { sectors, project });
    })
    .catch((err) => {
      res.status(404).render("404", { message: err });
    });
});

// Edit Project - Submit
app.post("/solutions/editProject", (req, res) => {
  editProject(req.body.id, req.body)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`
      });
    });
});

// Delete Project
app.get("/solutions/deleteProject/:id", (req, res) => {
  deleteProject(req.params.id)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`
      });
    });
});

// 404 Page
app.use((req, res) => {
  res.status(404).render("404", { message: "Page not found" });
});

// Start Server
initialize().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  );
}).catch(err => {
  console.error("Failed to initialize database:", err);
});