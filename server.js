/********************************************************************************
*  WEB322 – Assignment 06
*  
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*  
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*  
*  Name: Kabir Hemant Merchant
*  Student ID: 101390243
*  Date: 03-04-2025
*
********************************************************************************/

const express = require("express");
const path = require("path");
require("dotenv").config();
const mongoose = require("mongoose");
const authData = require("./modules/auth-service");
const clientSessions = require("client-sessions");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.urlencoded({ extended: true }));

// Set EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Configure session middleware
app.use(clientSessions({
  cookieName: "session",
  secret: "kabirAssignmentSecret",
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}));

// Middleware to expose session to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Auth middleware
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

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
app.get("/solutions/addProject", ensureLogin, (req, res) => {
  getAllSectors()
    .then((sectors) => {
      res.render("addProject", {
        sectors,
        page: "/solutions/addProject"
      });
    })
    .catch((err) => {
      res.render("500", { message: `Error loading sectors: ${err}` });
    });
});

// Add Project - Submission
app.post("/solutions/addProject", ensureLogin, (req, res) => {
  addProject(req.body)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`
      });
    });
});

// Edit Project - Form
app.get("/solutions/editProject/:id", ensureLogin, (req, res) => {
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
app.post("/solutions/editProject", ensureLogin, (req, res) => {
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
app.get("/solutions/deleteProject/:id", ensureLogin, (req, res) => {
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

// GET - Login Page
app.get("/login", (req, res) => {
  res.render("login", {
    errorMessage: "",
    userName: ""
  });
});

// GET - Register Page
app.get("/register", (req, res) => {
  res.render("register", {
    errorMessage: "",
    successMessage: "",
    userName: ""
  });
});

// POST - Register
app.post("/register", (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render("register", {
        successMessage: "User created",
        errorMessage: "",
        userName: ""
      });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        successMessage: "",
        userName: req.body.userName
      });
    });
});

// POST - Login
app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("login", {
        errorMessage: err,
        userName: req.body.userName
      });
    });
});

// GET - Logout
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

// GET - User History
app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

// 404 Page
app.use((req, res) => {
  res.status(404).render("404", { message: "Page not found" });
});

// Start Server after all services are initialized
initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to initialize server:", err);
  });
