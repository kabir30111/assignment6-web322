const projectData = require("../data/projectData");  // Ensure this file exists
const sectorData = require("../data/sectorData");   // Ensure this file exists

let projects = [];

// Initialize the projects with sector names
function initialize() {
    return new Promise((resolve, reject) => {
        try {
            if (projects.length > 0) {
                return resolve("Already initialized.");
            }

            projects = projectData.map(project => {
                const sector = sectorData.find(sec => sec.id === project.sector_id);
                return {
                    ...project,
                    sector: sector ? sector.sector_name : "Unknown"
                };
            });

            resolve("Project data initialized successfully.");
        } catch (error) {
            reject("Error during initialization: " + error.message);
        }
    });
}

// Get all projects
function getAllProjects() {
    return new Promise((resolve, reject) => {
        projects.length > 0 ? resolve(projects) : reject("No projects found.");
    });
}

// Get project by ID (Ensures IDs match correctly)
function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        const project = projects.find(p => p.id == projectId);  // Uses == to match string/number
        project ? resolve(project) : reject(`Project with ID ${projectId} not found.`);
    });
}

// Get projects by sector (Case-insensitive exact match)
function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        const filteredProjects = projects.filter(p => 
            p.sector.toLowerCase().includes(sector.toLowerCase())
        );
        
        if (filteredProjects.length === 0) {
            console.error(`No projects found for sector: ${sector}`);
        }
        
        resolve(filteredProjects);
        
        filteredProjects.length > 0 ? resolve(filteredProjects) : reject(`No projects found for sector: ${sector}`);
    });
}

// Export functions
module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };
