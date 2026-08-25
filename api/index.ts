import express from 'express';
import cors from 'cors';
import neo4j from 'neo4j-driver';
import { driver } from '../src/db.js';
import { queries } from '../src/queries.js';

const app = express();

app.use(cors());
app.use(express.json());

async function run<T = Record<string, unknown>>(
  query: string,
  params: Record<string, unknown> = {}
) {
  const session = driver.session();

  try {
    const result = await session.run(query, params);
    return result.records.map((record) => record.toObject() as T);
  } finally {
    await session.close();
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    await driver.verifyConnectivity();
    res.json({ ok: true });
  } catch {
    res.status(503).json({
      ok: false,
      message: 'The graph database is currently unreachable.',
    });
  }
});

app.get('/api/careers', async (_req, res) => {
  try {
    res.json(await run(queries.careers));
  } catch {
    res.status(503).json({
      message: 'Unable to load careers. Please try again.',
    });
  }
});

app.get('/api/careers/:slug', async (req, res) => {
  try {
    const rows = await run(queries.careerBySlug, {
      slug: req.params.slug,
    });

    if (!rows.length) {
      return res.status(404).json({
        message: 'Career not found.',
      });
    }

    res.json(rows[0]);
  } catch {
    res.status(503).json({
      message: 'Unable to load this career right now.',
    });
  }
});

app.get('/api/careers/:slug/paths', async (req, res) => {
  try {
    res.json(
      await run(queries.skillPaths, {
        slug: req.params.slug,
      })
    );
  } catch {
    res.status(503).json({
      message: 'Unable to explore skill connections.',
    });
  }
});

app.get('/api/careers/:slug/recommendations', async (req, res) => {
  try {
    res.json(
      await run(queries.careerRecommendations, {
        slug: req.params.slug,
      })
    );
  } catch {
    res.status(503).json({
      message: 'Unable to calculate career recommendations.',
    });
  }
});

app.get('/api/search', async (req, res) => {
  const term =
    typeof req.query.q === 'string'
      ? req.query.q.trim()
      : '';

  if (!term) {
    return res.json([]);
  }

  try {
    res.json(
      await run(queries.skillSearch, {
        term,
      })
    );
  } catch {
    res.status(503).json({
      message: 'Search is temporarily unavailable.',
    });
  }
});

app.get('/api/stats', async (_req, res) => {
  try {
    const rows = await run(queries.graphStats);

    const row = rows[0] as {
      nodes?: neo4j.Integer;
      relationships?: neo4j.Integer;
    };

    res.json({
      nodes: Number(row.nodes),
      relationships: Number(row.relationships),
    });
  } catch {
    res.status(503).json({
      message: 'Unable to read graph statistics.',
    });
  }
});

export default app;