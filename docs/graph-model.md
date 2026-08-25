# SkillPath graph model

```mermaid
graph LR
  Career -->|REQUIRES| Skill
  Career -->|USES| Technology
  Career -->|HAS_PROJECT| Project
  Career -->|RELATED_TO| Career
  Skill -->|RELATED_TO| Skill
  Project -->|BUILT_WITH| Technology
```

## Nodes
- **Career**: slug, name, description, category
- **Skill**: slug, name, category
- **Technology**: slug, name, description
- **Project**: slug, name, description

## Relationships
- `REQUIRES`: a career needs a skill
- `USES`: a career commonly uses a technology
- `HAS_PROJECT`: a representative project demonstrates the career
- `BUILT_WITH`: a project uses a technology
- `RELATED_TO`: two careers or skills have a meaningful connection
