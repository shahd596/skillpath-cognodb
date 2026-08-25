import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    ArrowRight,
    BriefcaseBusiness,
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    Compass,
    Database,
    GitBranch,
    LoaderCircle,
    Search,
    Sparkles,
    X,
    Network,
    Zap,
    Code2,
    Palette,
    BarChart3,
    Cloud,
} from 'lucide-react';
import './styles.css';

type Career = {
    slug: string;
    name: string;
    description: string;
    category: string;
    skills: string[];
};

type Detail = Career & {
    technologies: string[];
    projects: {
        name: string;
        slug: string;
        description: string;
    }[];
    relatedCareers: {
        name: string;
        slug: string;
        category: string;
    }[];
};

type Recommendation = {
    slug: string;
    name: string;
    category: string;
    sharedSkills: number;
    totalSkills: number;
    overlappingSkills: string[];
    matchPercent: number;
};

type SearchResult = {
    slug: string;
    name: string;
    category: string;
    careers: {
        slug: string;
        name: string;
    }[];
};

type Path = {
    source: string;
    related: string;
    category: string;
};

const api = async <T,>(url: string): Promise<T> => {
    const response = await fetch(url);

    if (!response.ok) {
        let message = 'Something went wrong while contacting the graph.';
        try {
            const body = await response.json();
            message = body.message || message;
        } catch {
            // Keep default message.
        }

        throw new Error(message);
    }

    return response.json();
};

const categoryIcon = (category: string) => {
    const value = category.toLowerCase();

    if (value.includes('design')) return <Palette size={16} />;
    if (value.includes('data')) return <BarChart3 size={16} />;
    if (value.includes('cloud') || value.includes('infrastructure')) {
        return <Cloud size={16} />;
    }

    return <Code2 size={16} />;
};

const categoryClass = (category: string) => {
    const value = category.toLowerCase();

    if (value.includes('design')) return 'category-design';
    if (value.includes('data')) return 'category-data';
    if (value.includes('cloud') || value.includes('infrastructure')) {
        return 'category-cloud';
    }

    return 'category-engineering';
};

function App() {
    const [careers, setCareers] = useState<Career[]>([]);
    const [selected, setSelected] = useState<Detail | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [paths, setPaths] = useState<Path[]>([]);

    const [search, setSearch] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const [error, setError] = useState('');
    const [searchError, setSearchError] = useState('');

    const [databaseOnline, setDatabaseOnline] = useState(true);

    useEffect(() => {
        loadCareers();
    }, []);

    const loadCareers = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await api<Career[]>('/api/careers');
            setCareers(data);
            setDatabaseOnline(true);
        } catch (e) {
            setDatabaseOnline(false);
            setError(
                e instanceof Error
                    ? e.message
                    : 'Unable to connect to the career graph.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!search.trim()) {
            setResults([]);
            setSearchLoading(false);
            setSearchError('');
            return;
        }

        setSearchLoading(true);
        setSearchError('');

        const timer = setTimeout(async () => {
            try {
                const data = await api<SearchResult[]>(
                    '/api/search?q=' + encodeURIComponent(search)
                );

                setResults(data);
            } catch {
                setResults([]);
                setSearchError('Search is temporarily unavailable.');
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelected(null);
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const openCareer = async (slug: string) => {
        setDetailLoading(true);
        setSelected(null);
        setError('');

        try {
            const [detail, recommendationsData, pathsData] = await Promise.all([
                api<Detail>('/api/careers/' + slug),
                api<Recommendation[]>(
                    '/api/careers/' + slug + '/recommendations'
                ),
                api<Path[]>('/api/careers/' + slug + '/paths'),
            ]);

            setSelected(detail);
            setRecommendations(recommendationsData);
            setPaths(pathsData);
            setDatabaseOnline(true);
        } catch (e) {
            setDatabaseOnline(false);
            setError(
                e instanceof Error
                    ? e.message
                    : 'Unable to load this career from the graph.'
            );
        } finally {
            setDetailLoading(false);
        }
    };

    const featured = useMemo(() => careers.slice(0, 6), [careers]);

    const searchHasNoResults =
        search.trim().length > 0 &&
        !searchLoading &&
        !searchError &&
        results.length === 0;

    return (
        <div className="app">
            <header className="topbar">
                <div className="brand">
                    <div className="brandmark">
                        <GitBranch size={19} />
                    </div>

                    <div>
                        <span className="brand-name">SkillPath</span>
                        <span className="brand-subtitle">Career Graph Explorer</span>
                    </div>
                </div>

                <div className="database-status">
                    <span
                        className={`status-dot ${databaseOnline ? 'online' : 'offline'
                            }`}
                    />

                    <Database size={14} />

                    <span>
                        {databaseOnline ? 'CognoDB connected' : 'Database unavailable'}
                    </span>
                </div>
            </header>

            <main>
                <section className="hero">
                    <div className="eyebrow">
                        <Sparkles size={14} />
                        GRAPH-POWERED CAREER DISCOVERY
                    </div>

                    <h1>
                        Find where your
                        <span> skills </span>
                        can take you.
                    </h1>

                    <p>
                        Explore the connections between careers, skills, technologies
                        and real-world projects — not just a list of job titles.
                    </p>

                    <div className="searchbox">
                        <Search size={20} />

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search a skill, e.g. React, SQL, Figma..."
                            aria-label="Search careers and skills"
                        />

                        {searchLoading && (
                            <LoaderCircle className="search-spinner spin" size={18} />
                        )}

                        {search && !searchLoading && (
                            <button
                                className="clear-search"
                                onClick={() => setSearch('')}
                                aria-label="Clear search"
                            >
                                <X size={18} />
                            </button>
                        )}

                        {(results.length > 0 ||
                            searchHasNoResults ||
                            searchError) && (
                                <div className="search-results">
                                    {searchLoading && (
                                        <div className="search-state">
                                            <LoaderCircle className="spin" size={18} />
                                            <span>Searching the graph...</span>
                                        </div>
                                    )}

                                    {!searchLoading &&
                                        results.map((result) => (
                                            <button
                                                className="search-result"
                                                key={result.slug}
                                                onClick={() => {
                                                    setSearch('');

                                                    const career = careers.find(
                                                        (item) =>
                                                            item.slug === result.careers[0]?.slug
                                                    );

                                                    if (career) {
                                                        openCareer(career.slug);
                                                    }
                                                }}
                                            >
                                                <div className="search-result-icon">
                                                    {categoryIcon(result.category)}
                                                </div>

                                                <div className="search-result-content">
                                                    <strong>{result.name}</strong>

                                                    <small>
                                                        {result.category} ·{' '}
                                                        {result.careers.length} career paths
                                                    </small>
                                                </div>

                                                <ChevronRight size={17} />
                                            </button>
                                        ))}

                                    {searchHasNoResults && (
                                        <div className="search-empty">
                                            <Compass size={22} />
                                            <strong>No connections found</strong>
                                            <span>
                                                Try another skill such as React, SQL or Figma.
                                            </span>
                                        </div>
                                    )}

                                    {searchError && (
                                        <div className="search-empty search-error">
                                            <CircleAlert size={22} />
                                            <strong>Search unavailable</strong>
                                            <span>{searchError}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                    </div>
                </section>

                {error && (
                    <div className="error-banner">
                        <div className="error-icon">
                            <CircleAlert size={19} />
                        </div>

                        <div className="error-copy">
                            <strong>We couldn't reach the graph</strong>
                            <span>{error}</span>
                        </div>

                        <button onClick={loadCareers}>Retry</button>
                    </div>
                )}

                <section className="section-head">
                    <div>
                        <div className="eyebrow">EXPLORE PATHS</div>
                        <h2>Career paths</h2>
                    </div>

                    {!loading && careers.length > 0 && (
                        <span className="count">
                            {careers.length} connected roles
                        </span>
                    )}
                </section>

                {loading ? (
                    <div className="skeleton-grid">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div className="skeleton-card" key={index}>
                                <div className="skeleton skeleton-tag" />
                                <div className="skeleton skeleton-title" />
                                <div className="skeleton skeleton-line" />
                                <div className="skeleton skeleton-line short" />

                                <div className="skeleton-chips">
                                    <div className="skeleton skeleton-chip" />
                                    <div className="skeleton skeleton-chip" />
                                    <div className="skeleton skeleton-chip" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : careers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Network size={30} />
                        </div>

                        <h3>No careers found</h3>

                        <p>
                            The graph is currently empty. Run the seed script to
                            load the sample dataset.
                        </p>
                    </div>
                ) : (
                    <div className="grid">
                        {featured.map((career) => (
                            <button
                                className={`career-card ${categoryClass(
                                    career.category
                                )}`}
                                key={career.slug}
                                onClick={() => openCareer(career.slug)}
                            >
                                <div className="card-top">
                                    <span className="category-pill">
                                        {categoryIcon(career.category)}
                                        {career.category}
                                    </span>

                                    <span className="card-arrow">
                                        <ArrowRight size={17} />
                                    </span>
                                </div>

                                <h3>{career.name}</h3>

                                <p>{career.description}</p>

                                <div className="skills">
                                    {career.skills.slice(0, 4).map((skill) => (
                                        <span key={skill}>{skill}</span>
                                    ))}

                                    {career.skills.length > 4 && (
                                        <span className="more-chip">
                                            +{career.skills.length - 4}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                <section className="graph-explanation">
                    <div className="graph-visual">
                        <div className="graph-node primary">
                            <BriefcaseBusiness size={20} />
                        </div>

                        <div className="graph-line" />

                        <div className="graph-node secondary">
                            <Zap size={18} />
                        </div>

                        <div className="graph-line" />

                        <div className="graph-node tertiary">
                            <Network size={18} />
                        </div>
                    </div>

                    <div>
                        <div className="eyebrow">
                            <GitBranch size={14} />
                            WHY THIS IS A GRAPH
                        </div>

                        <h2>Relationships are the product.</h2>

                        <p>
                            SkillPath follows paths across multiple relationship
                            types to discover related skills and career transitions.
                            Instead of treating careers as isolated records, the
                            graph makes the connections themselves searchable.
                        </p>

                        <div className="graph-features">
                            <span>
                                <CheckCircle2 size={15} />
                                Multi-hop traversal
                            </span>

                            <span>
                                <CheckCircle2 size={15} />
                                Skill overlap
                            </span>

                            <span>
                                <CheckCircle2 size={15} />
                                Career transitions
                            </span>
                        </div>
                    </div>
                </section>
            </main>

            {detailLoading && !selected && (
                <div className="detail-loading">
                    <div className="detail-loading-card">
                        <LoaderCircle className="spin" size={28} />
                        <strong>Following the graph...</strong>
                        <span>Finding skills, careers and technologies</span>
                    </div>
                </div>
            )}

            {selected && (
                <div
                    className="modal-backdrop"
                    onMouseDown={() => setSelected(null)}
                >
                    <aside
                        className="drawer"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <button
                            className="close"
                            onClick={() => setSelected(null)}
                            aria-label="Close career details"
                        >
                            <X />
                        </button>

                        {detailLoading ? (
                            <div className="drawer-loading">
                                <LoaderCircle className="spin" size={28} />
                                <span>Loading graph relationships...</span>
                            </div>
                        ) : (
                            <>
                                <div
                                    className={`drawer-category ${categoryClass(
                                        selected.category
                                    )}`}
                                >
                                    {categoryIcon(selected.category)}
                                    {selected.category}
                                </div>

                                <h2>{selected.name}</h2>

                                <p className="lead">{selected.description}</p>

                                <div className="detail-block">
                                    <label>CORE SKILLS</label>

                                    <div className="chips">
                                        {selected.skills.map((skill) => (
                                            <span key={skill} className="skill-chip">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="detail-block">
                                    <label>TECHNOLOGIES</label>

                                    <div className="chips">
                                        {selected.technologies
                                            .filter(Boolean)
                                            .map((technology) => (
                                                <span
                                                    key={technology}
                                                    className="technology-chip"
                                                >
                                                    {technology}
                                                </span>
                                            ))}
                                    </div>
                                </div>

                                <div className="detail-block">
                                    <div className="block-heading">
                                        <label>CONNECTED SKILLS · 2 HOPS</label>
                                        <span className="graph-badge">
                                            <GitBranch size={12} />
                                            Graph traversal
                                        </span>
                                    </div>

                                    <p className="block-description">
                                        Skills discovered through:
                                        <strong>
                                            {' '}
                                            Career → Skill → Related Skill
                                        </strong>
                                    </p>

                                    <div className="path-list">
                                        {paths.slice(0, 8).map((path, index) => (
                                            <div className="path-item" key={index}>
                                                <span className="path-source">
                                                    {path.source}
                                                </span>

                                                <ChevronRight size={14} />

                                                <span className="path-related">
                                                    {path.related}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="detail-block">
                                    <div className="block-heading">
                                        <label>YOU MAY ALSO LIKE</label>
                                        <span className="recommendation-label">
                                            <Sparkles size={12} />
                                            Shared graph skills
                                        </span>
                                    </div>

                                    <div className="recommendations">
                                        {recommendations.map((recommendation) => (
                                            <button
                                                key={recommendation.slug}
                                                onClick={() =>
                                                    openCareer(recommendation.slug)
                                                }
                                            >
                                                <div className="recommendation-copy">
                                                    <strong>{recommendation.name}</strong>

                                                    <small>
                                                        {recommendation.overlappingSkills
                                                            .slice(0, 3)
                                                            .join(' · ')}
                                                    </small>

                                                    <div className="match-track">
                                                        <div
                                                            className="match-fill"
                                                            style={{
                                                                width: `${recommendation.matchPercent}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="match-score">
                                                    <strong>
                                                        {recommendation.matchPercent}%
                                                    </strong>
                                                    <span>match</span>
                                                </div>
                                            </button>
                                        ))}

                                        {recommendations.length === 0 && (
                                            <div className="inline-empty">
                                                No related careers found yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selected.projects.length > 0 && (
                                    <div className="detail-block">
                                        <label>CONNECTED PROJECTS</label>

                                        <div className="project-list">
                                            {selected.projects.slice(0, 3).map((project) => (
                                                <div className="project-card" key={project.slug}>
                                                    <div className="project-icon">
                                                        <Code2 size={16} />
                                                    </div>

                                                    <div>
                                                        <strong>{project.name}</strong>
                                                        <p>{project.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
}

createRoot(document.getElementById('root')!).render(<App />);