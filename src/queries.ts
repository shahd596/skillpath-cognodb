export const queries = {
  careers: `
    MATCH (c:Career)
    OPTIONAL MATCH (c)-[:REQUIRES]->(s:Skill)
    RETURN c.slug AS slug, c.name AS name, c.description AS description,
           c.category AS category, collect(DISTINCT s.name) AS skills
    ORDER BY c.name
  `,
  careerBySlug: `
    MATCH (c:Career {slug: $slug})
    OPTIONAL MATCH (c)-[:REQUIRES]->(s:Skill)
    OPTIONAL MATCH (c)-[:USES]->(t:Technology)
    OPTIONAL MATCH (c)-[:HAS_PROJECT]->(p:Project)
    OPTIONAL MATCH (c)-[:RELATED_TO]->(related:Career)
    RETURN c.slug AS slug, c.name AS name, c.description AS description,
           c.category AS category,
           collect(DISTINCT s.name) AS skills,
           collect(DISTINCT t.name) AS technologies,
           collect(DISTINCT {name: p.name, slug: p.slug, description: p.description}) AS projects,
           collect(DISTINCT {name: related.name, slug: related.slug, category: related.category}) AS relatedCareers
  `,
  skillPaths: `
    MATCH (c:Career {slug: $slug})-[:REQUIRES]->(s:Skill)
    MATCH (s)-[:RELATED_TO]->(related:Skill)
    RETURN s.name AS source, related.name AS related, related.category AS category
    ORDER BY source, related
  `,
  careerRecommendations: `
    MATCH (target:Career {slug: $slug})-[:REQUIRES]->(s:Skill)
    MATCH (other:Career)-[:REQUIRES]->(s)
    WHERE other.slug <> target.slug
    WITH other, count(DISTINCT s) AS sharedSkills,
         collect(DISTINCT s.name) AS overlappingSkills
    MATCH (other)-[:REQUIRES]->(allSkill:Skill)
    WITH other, sharedSkills, overlappingSkills, count(DISTINCT allSkill) AS totalSkills
    RETURN other.slug AS slug, other.name AS name, other.category AS category,
           sharedSkills, totalSkills, overlappingSkills,
           round(100.0 * sharedSkills / totalSkills) AS matchPercent
    ORDER BY matchPercent DESC, sharedSkills DESC
    LIMIT 5
  `,
  skillSearch: `
    MATCH (s:Skill)
    WHERE toLower(s.name) CONTAINS toLower($term)
    OPTIONAL MATCH (c:Career)-[:REQUIRES]->(s)
    RETURN s.slug AS slug, s.name AS name, s.category AS category,
           collect(DISTINCT {slug: c.slug, name: c.name}) AS careers
    ORDER BY s.name
    LIMIT 12
  `,
  graphStats: `
    MATCH (n)
    WITH count(n) AS nodes
    MATCH ()-[r]->()
    RETURN nodes, count(r) AS relationships
  `
};
