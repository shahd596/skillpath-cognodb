import 'dotenv/config';
import { driver, closeDatabase } from '../src/db.js';

const skills = [
  ['javascript', 'JavaScript', 'Programming'], ['typescript', 'TypeScript', 'Programming'], ['react', 'React', 'Frontend'],
  ['css', 'CSS', 'Frontend'], ['html', 'HTML', 'Frontend'], ['accessibility', 'Accessibility', 'Frontend'],
  ['nodejs', 'Node.js', 'Backend'], ['apis', 'REST APIs', 'Backend'], ['sql', 'SQL', 'Data'], ['python', 'Python', 'Programming'],
  ['testing', 'Software Testing', 'Engineering'], ['git', 'Git', 'Engineering'], ['cloud', 'Cloud Computing', 'Infrastructure'],
  ['docker', 'Docker', 'Infrastructure'], ['ux', 'UX Design', 'Design'], ['ui', 'UI Design', 'Design'],
  ['figma', 'Figma', 'Design'], ['research', 'User Research', 'Design'], ['system-design', 'System Design', 'Engineering'],
  ['graphql', 'GraphQL', 'Backend'], ['data-analysis', 'Data Analysis', 'Data'], ['statistics', 'Statistics', 'Data']
];

const technologies = [
  ['react', 'React', 'Frontend framework'], ['nextjs', 'Next.js', 'React framework'], ['vite', 'Vite', 'Frontend build tool'],
  ['tailwind', 'Tailwind CSS', 'Utility-first CSS'], ['nodejs', 'Node.js', 'JavaScript runtime'], ['express', 'Express', 'Backend framework'],
  ['postgresql', 'PostgreSQL', 'Relational database'], ['cognodb', 'CognoDB', 'Managed graph database'], ['aws', 'AWS', 'Cloud platform'],
  ['docker', 'Docker', 'Container platform'], ['figma', 'Figma', 'Design platform'], ['python', 'Python', 'Programming language']
];

const careers = [
  ['frontend-engineer', 'Frontend Engineer', 'Build responsive, accessible web interfaces.', 'Engineering'],
  ['fullstack-engineer', 'Full-Stack Engineer', 'Build user-facing applications across frontend and backend.', 'Engineering'],
  ['backend-engineer', 'Backend Engineer', 'Design APIs, services, data flows and reliable server systems.', 'Engineering'],
  ['product-engineer', 'Product Engineer', 'Combine engineering with product thinking to ship user-focused solutions.', 'Engineering'],
  ['ui-engineer', 'UI Engineer', 'Bridge design systems and frontend implementation.', 'Design + Engineering'],
  ['ux-designer', 'UX Designer', 'Research user needs and turn them into intuitive experiences.', 'Design'],
  ['product-designer', 'Product Designer', 'Own product experiences from research through visual design.', 'Design'],
  ['data-analyst', 'Data Analyst', 'Turn data into insights that support business decisions.', 'Data'],
  ['cloud-engineer', 'Cloud Engineer', 'Build and operate scalable cloud infrastructure.', 'Infrastructure']
];

const careerSkills: Record<string, string[]> = {
  'frontend-engineer': ['javascript','typescript','react','css','html','accessibility','testing','git'],
  'fullstack-engineer': ['javascript','typescript','react','nodejs','apis','sql','git','testing'],
  'backend-engineer': ['javascript','typescript','nodejs','apis','sql','system-design','testing','git'],
  'product-engineer': ['javascript','typescript','react','nodejs','apis','sql','ux','git'],
  'ui-engineer': ['javascript','typescript','react','css','html','accessibility','ui','figma'],
  'ux-designer': ['ux','research','figma','ui','accessibility'],
  'product-designer': ['ux','research','figma','ui','accessibility','statistics'],
  'data-analyst': ['sql','python','data-analysis','statistics','git'],
  'cloud-engineer': ['cloud','docker','nodejs','python','system-design','git']
};

const careerTech: Record<string, string[]> = {
  'frontend-engineer': ['react','nextjs','vite','tailwind'], 'fullstack-engineer': ['react','nodejs','express','postgresql'],
  'backend-engineer': ['nodejs','express','postgresql','cognodb'], 'product-engineer': ['react','nodejs','postgresql','cognodb'],
  'ui-engineer': ['react','vite','tailwind','figma'], 'ux-designer': ['figma'], 'product-designer': ['figma'],
  'data-analyst': ['python','postgresql'], 'cloud-engineer': ['aws','docker','nodejs','python']
};

const projects = [
  ['task-management-platform','Task Management Platform','A collaborative task application with notifications and cloud services.',['react','nodejs','aws','postgresql']],
  ['accessible-commerce-ui','Accessible Commerce UI','A responsive storefront focused on keyboard and screen-reader usability.',['react','vite','tailwind','figma']],
  ['career-insights-dashboard','Career Insights Dashboard','A dashboard that connects skills, roles and learning opportunities.',['react','typescript','cognodb']],
  ['cloud-notification-service','Cloud Notification Service','Event-driven notifications using queues, functions and email delivery.',['nodejs','aws']],
  ['customer-research-study','Customer Research Study','A research project combining interviews, usability tests and quantitative analysis.',['figma','python']]
];

const relatedSkills: [string,string][] = [
  ['javascript','typescript'],['javascript','react'],['typescript','react'],['react','css'],['react','accessibility'],['react','testing'],
  ['nodejs','apis'],['apis','sql'],['sql','data-analysis'],['data-analysis','statistics'],['python','data-analysis'],['cloud','docker'],
  ['docker','system-design'],['ux','research'],['research','statistics'],['ui','figma'],['figma','ux'],['html','accessibility'],
  ['git','testing'],['system-design','apis'],['graphql','apis']
];

async function main() {
  const session = driver.session();
  try {
    await session.run(`MATCH (n) DETACH DELETE n`);
    await session.run(`UNWIND $rows AS row MERGE (s:Skill {slug: row[0]}) SET s.name=row[1], s.category=row[2]`, { rows: skills });
    await session.run(`UNWIND $rows AS row MERGE (t:Technology {slug: row[0]}) SET t.name=row[1], t.description=row[2]`, { rows: technologies });
    await session.run(`UNWIND $rows AS row MERGE (c:Career {slug: row[0]}) SET c.name=row[1], c.description=row[2], c.category=row[3]`, { rows: careers });

    for (const [career, skillSlugs] of Object.entries(careerSkills)) {
      await session.run(`MATCH (c:Career {slug:$career}) MATCH (s:Skill) WHERE s.slug IN $skills MERGE (c)-[:REQUIRES]->(s)`, { career, skills: skillSlugs });
    }
    for (const [career, techSlugs] of Object.entries(careerTech)) {
      await session.run(`MATCH (c:Career {slug:$career}) MATCH (t:Technology) WHERE t.slug IN $technologies MERGE (c)-[:USES]->(t)`, { career, technologies: techSlugs });
    }
    for (const [a,b] of relatedSkills) {
      await session.run(`MATCH (a:Skill {slug:$a}), (b:Skill {slug:$b}) MERGE (a)-[:RELATED_TO]->(b) MERGE (b)-[:RELATED_TO]->(a)`, { a,b });
    }
    for (const [slug,name,description,techs] of projects) {
      await session.run(`MERGE (p:Project {slug:$slug}) SET p.name=$name, p.description=$description WITH p MATCH (t:Technology) WHERE t.slug IN $techs MERGE (p)-[:BUILT_WITH]->(t)`, {slug,name,description,techs});
    }
    for (const [career, projectSlug] of [['frontend-engineer','accessible-commerce-ui'],['fullstack-engineer','task-management-platform'],['backend-engineer','cloud-notification-service'],['product-engineer','career-insights-dashboard'],['ui-engineer','accessible-commerce-ui'],['ux-designer','customer-research-study'],['product-designer','customer-research-study'],['data-analyst','career-insights-dashboard'],['cloud-engineer','cloud-notification-service']] as const) {
      await session.run(`MATCH (c:Career {slug:$career}), (p:Project {slug:$project}) MERGE (c)-[:HAS_PROJECT]->(p)`, {career,project:projectSlug});
    }
    const relatedCareers: [string,string][] = [['frontend-engineer','ui-engineer'],['frontend-engineer','fullstack-engineer'],['fullstack-engineer','backend-engineer'],['fullstack-engineer','product-engineer'],['ui-engineer','product-designer'],['ux-designer','product-designer'],['backend-engineer','cloud-engineer']];
    for (const [a,b] of relatedCareers) await session.run(`MATCH (a:Career {slug:$a}), (b:Career {slug:$b}) MERGE (a)-[:RELATED_TO]->(b) MERGE (b)-[:RELATED_TO]->(a)`, {a,b});
    console.log('Seed complete.');
  } finally { await session.close(); await closeDatabase(); }
}
main().catch((err) => { console.error('Seed failed:', err.message); process.exit(1); });
