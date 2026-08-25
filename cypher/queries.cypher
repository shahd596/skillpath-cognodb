// 1. All careers and their required skills
MATCH (c:Career)-[:REQUIRES]->(s:Skill)
RETURN c.name, collect(s.name) AS skills
ORDER BY c.name;

// 2. Multi-hop: skills related to the skills required by a career
MATCH (c:Career {slug: $slug})-[:REQUIRES]->(s:Skill)-[:RELATED_TO]->(related:Skill)
RETURN s.name AS source, related.name AS related, related.category AS category;

// 3. Graph-native career recommendation: shared skill neighbourhood
MATCH (target:Career {slug: $slug})-[:REQUIRES]->(s:Skill)
MATCH (other:Career)-[:REQUIRES]->(s)
WHERE other.slug <> target.slug
WITH other, count(DISTINCT s) AS sharedSkills, collect(DISTINCT s.name) AS overlappingSkills
MATCH (other)-[:REQUIRES]->(allSkill:Skill)
WITH other, sharedSkills, overlappingSkills, count(DISTINCT allSkill) AS totalSkills
RETURN other.name, sharedSkills, totalSkills, overlappingSkills,
       round(100.0 * sharedSkills / totalSkills) AS matchPercent
ORDER BY matchPercent DESC
LIMIT 5;

// 4. Cross-entity traversal: career -> project -> technology
MATCH (c:Career {slug: $slug})-[:HAS_PROJECT]->(p:Project)-[:BUILT_WITH]->(t:Technology)
RETURN p.name, collect(t.name) AS technologies;
