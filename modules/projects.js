const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

function initialize() {
    return new Promise((resolve, reject) => {
        try {
            projectData.forEach(project => {
                const sector = sectorData.find(sec => sec.id === project.sector_id);
                if (sector) {
                    project.sector = sector.sector_name;
                    projects.push(project);
                }
            });
            resolve();  
        } catch (error) {
            reject("Error during initialization: " + error);
        }
    });
}


function getAllProjects() {
    return new Promise((resolve, reject) => {
        if (projects.length > 0) {
            resolve(projects);
        } else {
            reject("No projects found : ");
        }
    });
}


function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            resolve(project);
        } else {
            reject(`Project with ID ${projectId} not found : `);
        }
    });
}


function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        const filteredProjects = projects.filter(p => 
            p.sector.toLowerCase().includes(sector.toLowerCase())
        );
        if (filteredProjects.length > 0) {
            resolve(filteredProjects);
        } else {
            reject(`No projects found for sector : ${sector}`);
        }
    });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };
