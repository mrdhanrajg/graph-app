# Developer Knowledge Graph

A full-stack graph database application that models relationships between developers, projects, and technologies using **CognoDB** as the graph database, **Spring Boot + Java 21** as the backend, and **React + Vite** for the frontend.

## Live Demo

**Frontend:**
https://graph-app-one.vercel.app/

**Backend API:**
https://graph-app-o34z.onrender.com/

**GitHub Repository:**
https://github.com/mrdhanrajg/graph-app

---

## Overview

The Developer Knowledge Graph represents how developers, projects, and technologies are connected.

A developer can:

* know multiple technologies
* work on multiple projects
* use different technologies within those projects

Technologies can also be related to other technologies.

The application allows users to explore these relationships through an interactive graph and discover technologies connected through multi-hop traversal.

### Main Features

* Developer technology profile
* Project and technology relationships
* Relationship properties such as experience, proficiency, role, duration, and version
* Interactive graph visualization
* Multi-hop technology discovery
* Parameterized Cypher queries
* REST APIs
* Loading, empty, and error states
* Centralized exception handling
* Environment-based database configuration
* Dockerized backend deployment

---

## Why a Graph Database?

The primary questions in this application are about **connections and relationships**, rather than only individual records.

For example, the application needs to discover technologies connected through a developer's projects and technology stack.

This requires traversing relationships such as:

```text
Developer
    |
    | WORKED_ON
    v
Project
    |
    | USES
    v
Technology
    |
    | RELATED_TO
    v
Technology
```

A relational database could represent the same domain using multiple tables and junction tables, but multi-hop relationship queries would require joins across those structures.

A graph database represents entities and their relationships directly, making traversal across connected entities a natural part of the model.

This application therefore uses a graph database because **the relationships themselves are central to the questions the application answers**.

---

## Use Case

The application models a developer knowledge graph.

### Nodes

```text
Developer
Project
Technology
```

### Relationships

```text
Developer ── KNOWS ────────> Technology

Developer ── WORKED_ON ────> Project

Project   ── USES ─────────> Technology

Technology ── RELATED_TO ──> Technology
```

### Relationship Properties

`KNOWS`

```text
years
proficiency
```

`WORKED_ON`

```text
durationMonths
role
```

`USES`

```text
version
```

---

## Architecture

```text
┌──────────────────────────────┐
│        React + Vite          │
│                              │
│  Dashboard                   │
│  Recommendations             │
│  Interactive Graph           │
└──────────────┬───────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────┐
│       Spring Boot API        │
│                              │
│ Controllers                  │
│ Services                     │
│ Repository                   │
│ Exception Handling           │
└──────────────┬───────────────┘
               │
               │ Neo4j Java Driver
               ▼
┌──────────────────────────────┐
│           CognoDB            │
│                              │
│ Nodes                        │
│ Relationships                │
│ Properties                   │
│ Cypher Queries               │
└──────────────────────────────┘
```

### Production Deployment

```text
Browser
   │
   ▼
Vercel
React + Vite
   │
   │ HTTPS REST API
   ▼
Render
Docker + Java 21 + Spring Boot
   │
   │ Bolt
   ▼
CognoDB
```

---

## Technology Stack

### Backend

* Java 21
* Spring Boot 4.1
* Spring Web MVC
* Official Neo4j Java Driver
* Maven

### Database

* CognoDB
* openCypher
* Bolt protocol

### Frontend

* React
* Vite
* React Flow
* Lucide React

### Deployment

* GitHub
* Vercel
* Render
* Docker

---

## Project Structure

```text
wexa-graph-app/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/dhanraj/graph/app/
│   │       │       ├── config/
│   │       │       ├── controller/
│   │       │       ├── exception/
│   │       │       ├── repository/
│   │       │       └── service/
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   ├── Dockerfile
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   └── screenshots/
│
├── .gitignore
└── README.md
```

---

## API Endpoints

### Developer Technologies

```http
GET /api/developers/{name}/technologies
```

Returns the technologies known by the specified developer.

### Developer Graph

```http
GET /api/developers/{name}/graph
```

Returns the developer's known technologies, projects, and project technologies.

### Connected Technologies

```http
GET /api/developers/{name}/recommendations
```

Uses multi-hop graph traversal to discover technologies connected to technologies used by projects the developer has worked on.

### Graph Visualization Data

```http
GET /api/developers/{name}/graph/relationships
```

Returns normalized graph nodes and edges consumed by the React Flow visualization.

---

## Key Cypher Queries

### Find Technologies Known by a Developer

```cypher
MATCH (d:Developer {name: $name})
      -[:KNOWS]->
      (t:Technology)
RETURN t.name AS technology
```

### Find Technologies Used by Projects

```cypher
MATCH (d:Developer {name: $name})
      -[:WORKED_ON]->
      (p:Project)
      -[:USES]->
      (t:Technology)
RETURN t.name AS technology
```

### Multi-Hop Technology Discovery

```cypher
MATCH (d:Developer {name: $name})
      -[:WORKED_ON]->
      (p:Project)
      -[:USES]->
      (t:Technology)

MATCH path =
      (t)-[:RELATED_TO*1..2]->(related:Technology)

RETURN DISTINCT
       p.name AS project,
       [node IN nodes(path) | node.name] AS path
```

This query demonstrates multi-hop traversal through the technology graph.

---

## Parameterized Cypher

User-controlled values are passed as parameters through the official Neo4j Java Driver.

Example:

```cypher
MATCH (d:Developer {name: $name})
RETURN d
```

Java supplies the value separately:

```java
Map.of("name", developerName)
```

No user input is concatenated into Cypher strings.

---

## Error Handling

The backend uses centralized exception handling.

### Developer Not Found

Returns:

```http
404 Not Found
```

### Graph Database Unavailable

Returns:

```http
503 Service Unavailable
```

### Unexpected Application Error

Returns:

```http
500 Internal Server Error
```

Database sessions are managed using try-with-resources, and the Neo4j driver is configured with a shutdown method so resources are released cleanly when the application stops.

---

## Environment Variables

Database credentials are never stored in source control.

### Backend

```text
COGNODB_URI=<your CognoDB Bolt URI>
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=<your password>
```

### Frontend

```text
VITE_API_BASE_URL=<backend API URL>
```

The actual credentials are configured through environment variables and are not committed to source control.

---

## Local Setup

### Prerequisites

* Java 21
* Maven
* Node.js
* npm
* CognoDB instance

### Start the Backend

```bash
cd backend
mvnw spring-boot:run
```

### Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Production

### Frontend

https://graph-app-one.vercel.app/

### Backend

https://graph-app-o34z.onrender.com/

### GitHub Repository

https://github.com/mrdhanrajg/graph-app

---

## Screenshots

Stored screenshots under:

```text
docs/screenshots/
```

* Dashboard
* Interactive graph
* Connected technologies

---

## Screen Recording

Recording link:

```text
https://drive.google.com/file/d/1n2l0db2PK4ZA9LlX4SbNdhvq5A8roX4z/view?usp=sharing
```

---

## Engineering Decisions

### Official Neo4j Java Driver

CognoDB supports the official Neo4j drivers, so the backend uses the official Java driver directly.

### Graph-Oriented Data Model

Relationships are first-class elements of the domain:

```text
Developer -[:KNOWS]-> Technology

Developer -[:WORKED_ON]-> Project

Project -[:USES]-> Technology

Technology -[:RELATED_TO]-> Technology
```

### Relationship Properties

Information describing a connection is stored on the relationship itself.

```text
Developer -[:KNOWS {
    years,
    proficiency
}]-> Technology
```

```text
Developer -[:WORKED_ON {
    durationMonths,
    role
}]-> Project
```

```text
Project -[:USES {
    version
}]-> Technology
```

### API Normalization

The graph visualization endpoint converts graph paths into a normalized nodes-and-edges response consumed by the React frontend.

### Centralized Exception Handling

Database exceptions are translated into application-level exceptions and handled centrally rather than duplicating error handling logic across controllers.

### Environment-Based Configuration

Database credentials and environment-specific frontend configuration are provided through environment variables rather than committed to source control.

---

## Future Improvements

Possible extensions include:

* Additional developers and projects
* Developer search
* Technology filtering
* Shortest-path exploration
* Skill-gap analysis
* Project recommendations
* Authentication
* Larger graph datasets
* Advanced graph analytics

---

## Links

**GitHub:**
https://github.com/mrdhanrajg/graph-app

**Live Demo:**
https://graph-app-one.vercel.app/

**Backend API:**
https://graph-app-o34z.onrender.com/

**Screen Recording:**
https://drive.google.com/file/d/1n2l0db2PK4ZA9LlX4SbNdhvq5A8roX4z/view?usp=sharing
