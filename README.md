# SkillPath — Career Graph Explorer

SkillPath is a small web app that uses a graph database to explore connections between careers, skills, technologies, and projects.

The idea is simple: instead of looking at careers as separate job titles, you can open a career and see the skills connected to it, related skills, and other careers that have similar requirements.

## Why a graph database?

I chose a graph database because the main purpose of the application is exploring relationships.

For example, if someone is interested in Frontend Engineering, the application can show:

- the skills required for that career
- other skills related to those skills
- technologies used in related projects
- other careers that share similar skills

These relationships would require several joins in a relational database. With a graph database, the relationships are stored directly between the nodes, which makes these types of traversals much more natural to query with Cypher.

## Tech Stack

- React
- TypeScript
- Vite
- Express
- Neo4j JavaScript Driver
- CognoDB Cloud
- Cypher

The Neo4j JavaScript driver is used to connect to CognoDB through Bolt.

## How the graph is structured

The main nodes in the graph are:

- Career
- Skill
- Technology
- Project

The main relationships are:

- `Career -[:REQUIRES]-> Skill`
- `Career -[:USES]-> Technology`
- `Career -[:HAS_PROJECT]-> Project`
- `Career -[:RELATED_TO]-> Career`
- `Skill -[:RELATED_TO]-> Skill`
- `Project -[:BUILT_WITH]-> Technology`

A more detailed version of the model is available in [`docs/graph-model.md`](docs/graph-model.md).

## Main graph queries

### 1. Connected skills

The application can follow:

`Career → Skill → Skill`

This is used to find skills that are connected to the skills required by a career.

### 2. Career recommendations

The application compares careers based on their required skills. Careers with more shared skills receive a higher recommendation score.

### 3. Projects and technologies

The graph can also follow:

`Career → Project → Technology`

This connects a career to real-world projects and the technologies used to build them.

All queries use parameters with the Neo4j driver. User input is not directly added to Cypher queries.

## Project structure

```text
skillpath/
├── client/
│   ├── src/
│   ├── index.html
│   └── vite.config.ts
├── api/
│   └── index.ts
├── cypher/
│   └── queries.cypher
├── docs/
│   ├── graph-model.md
│   ├── main page.png
│   ├── screenshot-career.png
│   └── screenshot-exploration.png
├── scripts/
│   └── seed.ts
├── src/
│   ├── db.ts
│   ├── queries.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
└── README.md