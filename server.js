const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'data/projects.json';

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir('data', { recursive: true });
  } catch (error) {
    console.log('Data directory already exists');
  }
}

// Load projects from file
async function loadProjects() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const projects = JSON.parse(data);
    // Ensure all records have id and are sorted
    projects.forEach(project => {
      project.records = ensureAndSortRecords(project.records);
    });
    return projects;
  } catch (error) {
    return [];
  }
}

// Save projects to file
async function saveProjects(projects) {
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2));
}

// Utility to assign IDs to records if missing and sort them by id
function ensureAndSortRecords(records) {
  if (!Array.isArray(records)) return [];
  return records.map(record => {
    if (!record.id) {
      record.id = uuidv4();
    }
    // Optionally, you can also assign ids to subRecords here if needed
    return record;
  }).sort((a, b) => a.id.localeCompare(b.id));
}

// API Routes

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await loadProjects();
    // Ensure all records have id and are sorted
    projects.forEach(project => {
      project.records = ensureAndSortRecords(project.records);
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load projects' });
  }
});

// Get a specific project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const projects = await loadProjects();
    const project = projects.find(p => p.id === req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Ensure all records have id and are sorted
    project.records = ensureAndSortRecords(project.records);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load project' });
  }
});

// Create a new project
app.post('/api/projects', async (req, res) => {
  try {
    const { name, details, records } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const projects = await loadProjects();
    // Ensure all records have id and are sorted
    const safeRecords = ensureAndSortRecords(records || []);
    const newProject = {
      id: uuidv4(),
      name: name.trim(),
      details: details || '',
      records: safeRecords,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    projects.push(newProject);
    await saveProjects(projects);
    
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update a project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { name, details, records } = req.body;
    const projects = await loadProjects();
    const projectIndex = projects.findIndex(p => p.id === req.params.id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    let updatedRecords = ensureAndSortRecords(records || projects[projectIndex].records);
    projects[projectIndex] = {
      ...projects[projectIndex],
      name: name || projects[projectIndex].name,
      details: details !== undefined ? details : projects[projectIndex].details,
      records: updatedRecords,
      updatedAt: new Date().toISOString()
    };
    
    await saveProjects(projects);
    res.json(projects[projectIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete a project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const projects = await loadProjects();
    const filteredProjects = projects.filter(p => p.id !== req.params.id);
    
    if (filteredProjects.length === projects.length) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    await saveProjects(filteredProjects);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Save project data
app.post('/api/projects/:id/save', async (req, res) => {
  try {
    const { projectData } = req.body;
    const projects = await loadProjects();
    const projectIndex = projects.findIndex(p => p.id === req.params.id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    let updatedRecords = ensureAndSortRecords((projectData && projectData.records) || projects[projectIndex].records);
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...projectData,
      records: updatedRecords,
      updatedAt: new Date().toISOString()
    };
    
    await saveProjects(projects);
    res.json(projects[projectIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save project data' });
  }
});

// Start server
async function startServer() {
  await ensureDataDir();
  
  app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error); 