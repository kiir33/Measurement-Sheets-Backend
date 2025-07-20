# Measurement Sheets API

A lightweight Express.js API for managing measurement sheet projects with data persistence.

## Features

- **Project Management**: Create, read, update, and delete projects
- **Data Persistence**: JSON file-based storage
- **CORS Support**: Cross-origin requests enabled
- **RESTful API**: Standard HTTP methods for all operations
- **Multiple Projects**: Support for multiple measurement projects

## Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   yarn install
   ```

2. **Start the Server**:
   ```bash
   # Development mode (with auto-restart)
   yarn dev
   
   # Production mode
   yarn start
   ```

3. **Access the API**:
   - Server runs on: `http://localhost:3000`
   - API base URL: `http://localhost:3000/api`

## API Endpoints

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a specific project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/projects/:id/save` - Save project data

### Request/Response Examples

#### Create Project
```bash
POST /api/projects
Content-Type: application/json

{
  "name": "Kitchen Renovation",
  "details": "Complete kitchen remodeling project"
}
```

#### Get All Projects
```bash
GET /api/projects
```

#### Update Project
```bash
PUT /api/projects/:id
Content-Type: application/json

{
  "name": "Updated Project Name",
  "details": "Updated project details",
  "records": [...]
}
```

## Data Structure

Projects are stored with the following structure:

```json
{
  "id": "uuid",
  "name": "Project Name",
  "details": "Project Description",
  "records": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Data Storage

- Data is stored in `data/projects.json`
- File is automatically created if it doesn't exist
- Data is persisted between server restarts

## Development

- Uses `nodemon` for development with auto-restart
- CORS enabled for frontend integration
- Error handling for all endpoints
- Input validation for required fields

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production) 