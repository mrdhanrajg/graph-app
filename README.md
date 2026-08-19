# Developer Knowledge Graph

A full-stack graph database application built for the Wexa AI take-home assignment.

The application uses **CognoDB** as the graph database, a **Spring Boot + Java** backend, and a **React + Vite** frontend with an interactive graph visualization.

---

## Overview

The Developer Knowledge Graph models relationships between:

* Developers
* Projects
* Technologies

A developer can know multiple technologies, work on multiple projects, and projects can use multiple technologies. Technologies can also be connected to other technologies.

The application allows users to explore these relationships and discover technologies connected through multi-hop graph traversal.

### Main features

* Developer technology profile
* Project and technology relationships
* Relationship properties such as experience, proficiency, role, duration and version
* Interactive graph visualization
* Multi-hop technology discovery
* Parameterized Cypher queries
* Graceful database error handling
* REST API

---

## Why a Graph Database?

The primary questions in this application are about **connections and relationships**, rather than only individual records.

For example:

> Which technologies are connected to the technologies used by projects that a developer has worked on?

This requires traversing multiple relationships:

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

A relational database could represent this model using multiple tables and join tables, but multi-hop relationship traversal becomes increasingly dependent on joins across those tables.

A graph database represents the relationships directly, making traversal between connected entities a natural part of the data model.

---

## Graph Data Model

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

### Relationship properties

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

### Example

```text
                         ┌─────────────────┐
                         │     Java        │
                         └────────┬────────┘
                                  │
                             RELATED_TO
                                  │
                                  v
                         ┌─────────────────┐
                         │   Spring Boot   │
                         └────────┬────────┘
                                  │
                             RELATED_TO
                                  │
                                  v
                         ┌─────────────────┐
                         │  Microservices  │
                         └─────────────────┘


┌─────────────┐      WORKED_ON      ┌─────────────────────────────┐
│  Dhanraj    │────────────────────>│ Developer Knowledge Platform│
└──────┬──────┘                     └─────────────┬───────────────┘
       │                                          │
       │ KNOWS                                    │ USES
       │                                          │
       ├────────────> Java                        ├────────> Java
       │                                          ├────────> React
       ├────────────> React                       ├────────> Spring Boot
       │                                          └────────> Kafka
       └────────────> Kafka
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
               │ HTTP
               v
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
               v
┌──────────────────────────────┐
│           CognoDB            │
│                              │
│ Nodes                        │
│ Relationships                │
│ Properties                   │
│ Cypher Queries               │
└──────────────────────────────┘
```

---

## Technology Stack

### Backend

* Java 21
* Spring Boot 4.1
* Spring Web MVC
* Official Neo4j Java Driver

### Database

* CognoDB
* openCypher
* Bolt protocol

### Frontend

* React
* Vite
* React Flow
* Lucide React

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
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── docs/
│   └── screenshots/
│
├── .gitignore
└── README.md
```

---

## API Endpoints

### Developer technologies

```http
GET /api/developers/{name}/technologies
```

Returns the technologies known by the specified developer.

---

### Developer graph

```http
GET /api/developers/{name}/graph
```

Returns:

* Developer
* Known technologies
* Projects
* Project technologies

---

### Connected technologies

```http
GET /api/developers/{name}/recommendations
```

Uses multi-hop graph traversal to find technologies connected to technologies used by projects the developer has worked on.

Example relationship path:

```text
Java
  |
  | RELATED_TO
  v
Spring Boot
  |
  | RELATED_TO
  v
Microservices
```

---

### Graph visualization data

```http
GET /api/developers/{name}/graph/relationships
```

Returns normalized graph data containing nodes and edges used by the React graph visualization.

---

### Health check

```http
GET /api/health
```

Returns:

```text
OK
```

---

## Cypher

### Find technologies known by a developer

```cypher
MATCH (d:Developer {name: $name})
      -[:KNOWS]->
      (t:Technology)
RETURN t.name AS technology
```

The developer name is supplied as a query parameter through the Neo4j Java Driver.

---

### Find technologies used by projects

```cypher
MATCH (d:Developer {name: $name})
      -[:WORKED_ON]->
      (p:Project)
      -[:USES]->
      (t:Technology)
RETURN t.name AS technology
```

---

### Multi-hop technology traversal

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

This demonstrates a 1–2 hop traversal through the technology graph.

---

## Parameterized Queries

User-controlled values are passed as query parameters rather than concatenated directly into Cypher.

Example:

```cypher
MATCH (d:Developer {name: $name})
RETURN d
```

Java supplies the value separately:

```java
Map.of("name", developerName)
```

This keeps the queries safer and easier to maintain.

---

## Error Handling

The backend uses centralized exception handling for application failures.

### Developer not found

Returns:

```http
404 Not Found
```

### Graph database unavailable

Returns:

```http
503 Service Unavailable
```

### Unexpected application error

Returns:

```http
500 Internal Server Error
```

Database sessions are managed using try-with-resources, and the Neo4j driver is configured as a Spring bean with a shutdown method so resources are released cleanly.

---

## Environment Variables

Database credentials are never committed to source control.

Configure:

```text
COGNODB_URI=<your CognoDB Bolt URI>
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=<your password>
```

The backend reads these values through Spring configuration.

Example `application.properties`:

```properties
cognodb.uri=${COGNODB_URI}
cognodb.username=${COGNODB_USERNAME}
cognodb.password=${COGNODB_PASSWORD}
```

Never commit the actual password or other credentials.

---

## Local Setup

### Prerequisites

* Java 21
* Maven
* Node.js
* npm
* CognoDB instance

### 1. Configure CognoDB

Create a CognoDB instance and obtain the Bolt URI, username and password.

Set the required environment variables.

### 2. Start the backend

```bash
cd backend
mvnw spring-boot:run
```

Backend:

```text
http://localhost:8080
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## UI

The application provides:

* Developer overview
* Technology cards
* Project information
* Project technology stack
* Connected technology recommendations
* Interactive graph exploration
* Loading and error states

---

## Screenshots

Add final screenshots here before submission:

```text
docs/screenshots/dashboard.png
docs/screenshots/graph.png
docs/screenshots/recommendations.png
docs/screenshots/error-state.png
```

Example:

```markdown
![Dashboard](docs/screenshots/dashboard.png)

![Interactive Graph](docs/screenshots/graph.png)

![Recommendations](docs/screenshots/recommendations.png)
```

---

## Hosted Demo

Add the deployed application URL here:

```text
TODO: <hosted frontend URL>
```

---

## Screen Recording

Add the final walkthrough link here:

```text
TODO: <screen recording URL>
```

The walkthrough should demonstrate:

1. Application overview
2. Developer profile
3. Technology and project relationships
4. Interactive graph
5. Multi-hop recommendations
6. Explanation of why a graph database was selected

---

## Engineering Decisions

### Official Neo4j Java Driver

CognoDB supports the official Neo4j drivers, so the application uses the official Java driver rather than a custom database SDK.

### Graph-oriented data model

Relationships are first-class elements of the model.

For example:

```text
Developer -[:KNOWS]-> Technology
Developer -[:WORKED_ON]-> Project
Project -[:USES]-> Technology
Technology -[:RELATED_TO]-> Technology
```

### Relationship properties

Properties describing a connection are stored on the relationship itself.

Examples:

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

### API normalization

The graph visualization endpoint converts database paths into a normalized nodes-and-edges representation consumed by the React frontend.

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
* More advanced graph analytics

---

## Assignment Deliverables

The repository contains:

* Full source code
* Graph seed data
* Cypher queries
* Graph data model documentation
* Backend and frontend
* Interactive graph visualization
* Error handling
* Environment-based database configuration
* Setup instructions

The final submission will additionally provide:

* Hosted application demo
* Screen recording
* Final screenshots
