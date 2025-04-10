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
const authData = require("./modules/auth-service");
const clientSessions = require("client-sessions");

const {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  getAllSectors,
  addProject,
  editProject,
  deleteProject,
} = require("./modules/projects");

const app = express();
app.use(express.urlencoded({ extended: true }));

// Set EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Sessions
app.use(
  clientSessions({
    cookieName: "session",
    secret: "kabirAssignmentSecret",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

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

// Routes
app.get("/", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("about"));

app.get("/solutions/projects", (req, res) => {
  getAllProjects()
    .then((projects) => res.render("projects", { projects }))
    .catch((err) => res.render("500", { message: `Error loading projects: ${err}` }));
});

app.get("/solutions/projects/:id", (req, res) => {
  getProjectById(req.params.id)
    .then((project) => res.render("project", { project }))
    .catch((err) => res.status(404).render("404", { message: err }));
});

app.get("/solutions/addProject", ensureLogin, (req, res) => {
  getAllSectors()
    .then((sectors) => res.render("addProject", { sectors, page: "/solutions/addProject" }))
    .catch((err) => res.render("500", { message: `Error loading sectors: ${err}` }));
});

app.post("/solutions/addProject", ensureLogin, (req, res) => {
  addProject(req.body)
    .then(() => res.redirect("/solutions/projects"))
    .catch((err) => res.render("500", { message: `Error: ${err}` }));
});

app.get("/solutions/editProject/:id", ensureLogin, (req, res) => {
  Promise.all([getAllSectors(), getProjectById(req.params.id)])
    .then(([sectors, project]) => res.render("editProject", { sectors, project }))
    .catch((err) => res.status(404).render("404", { message: err }));
});

app.post("/solutions/editProject", ensureLogin, (req, res) => {
  editProject(req.body.id, req.body)
    .then(() => res.redirect("/solutions/projects"))
    .catch((err) => res.render("500", { message: `Error: ${err}` }));
});

app.get("/solutions/deleteProject/:id", ensureLogin, (req, res) => {
  deleteProject(req.params.id)
    .then(() => res.redirect("/solutions/projects"))
    .catch((err) => res.render("500", { message: `Error: ${err}` }));
});

app.get("/login", (req, res) =>
  res.render("login", { errorMessage: "", userName: "" })
);

app.get("/register", (req, res) =>
  res.render("register", { errorMessage: "", successMessage: "", userName: "" })
);

app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", {
        successMessage: "User created",
        errorMessage: "",
        userName: "",
      });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        successMessage: "",
        userName: req.body.userName,
      });
    });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("login", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

app.use((req, res) => {
  res.status(404).render("404", { message: "Page not found" });
});

// 🔧 Hybrid server logic for Vercel & local
const startApp = async () => {
  try {
    await initialize();
    await authData.initialize();

    if (process.env.VERCEL) {
      module.exports = app;
    } else {
      app.listen(process.env.PORT || 8000, () => {
        console.log(`🚀 Server running at http://localhost:${process.env.PORT || 8000}`);
      });
    }
  } catch (err) {
    console.error("❌ Startup failed:", err);
  }
};

startApp();
