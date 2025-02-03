/********************************************************************************
*  WEB322 – Assignment 02
*  
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*  
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*  
*  Name: Shubham 
*  Student ID: 167744234 
*  Date: 03-02-2025  
*
********************************************************************************/


const express = require("express");
const projectData = require("./modules/projects");  

// Create an Express app
const app = express();
const PORT = process.env.PORT || 8000;  


app.use(express.json());


projectData.initialize()
    .then(() => {
        console.log("Data initialized successfully!");

        
        app.get("/", (req, res) => {
            res.send("Assignment 2: [Shubham] - [167744234]");
        });

        
        app.get("/solutions/projects", (req, res) => {
            projectData.getAllProjects()
                .then(projects => res.json(projects))
                .catch(err => res.status(500).send(err));
        });

        
        app.get("/solutions/projects/id-demo", (req, res) => {
            const projectId = 8; 
            projectData.getProjectById(projectId)
                .then(project => res.json(project))
                .catch(err => res.status(404).send(err));
        });

        
        app.get("/solutions/projects/sector-demo", (req, res) => {
            const sectorQuery = "agriculture"; 
            projectData.getProjectsBySector(sectorQuery)
                .then(projects => res.json(projects))
                .catch(err => res.status(404).send(err));
        });

        
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    })
    