import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Code2,
  GitBranch,
  Layers3,
  UserRound,
} from "lucide-react";
import { getDeveloperGraph, getRecommendations } from "./services/api";
import KnowledgeGraph from "./components/KnowledgeGraph";
import Recommendations from "./components/Recommendations";
import "./App.css";

function App() {
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    Promise.all([
      getDeveloperGraph("Dhanraj"),
      getRecommendations("Dhanraj"),
    ])
      .then(([graphData, recommendationData]) => {
        setDeveloper(graphData);
        setRecommendations(recommendationData);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-state">
        <div className="spinner" />
        <p>Loading developer graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-state">
        <h2>Unable to load developer data</h2>
        <p>Please check that the backend is running.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brand">Graph Explorer</div>
          <div className="subtitle">Developer knowledge graph</div>
        </div>

        <div className="developer-badge">
          <UserRound size={16} />
          {developer.developer}
        </div>
      </header>

      <main className="content">
        <section className="hero">
          <div>
            <p className="eyebrow">Developer profile</p>
            <h1>{developer.developer}</h1>
            <p className="hero-text">
              Explore skills, projects, technologies and connected knowledge.
            </p>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard
            icon={<Code2 size={20} />}
            label="Known technologies"
            value={developer.knownTechnologies.length}
          />

          <StatCard
            icon={<BriefcaseBusiness size={20} />}
            label="Projects"
            value={developer.projects.length}
          />

          <StatCard
            icon={<Layers3 size={20} />}
            label="Project technologies"
            value={developer.projectTechnologies.length}
          />
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Skills</p>
              <h2>Known technologies</h2>
            </div>
          </div>

          <div className="technology-grid">
            {developer.knownTechnologies.map((tech) => (
              <div className="technology-card" key={tech.technology}>
                <div className="technology-header">
                  <div className="technology-icon">
                    <Code2 size={18} />
                  </div>

                  <div>
                    <h3>{tech.technology}</h3>
                    <span className="proficiency">
                      {tech.proficiency}
                    </span>
                  </div>
                </div>

                <div className="technology-meta">
                  <span>{tech.years} years experience</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Experience</p>
              <h2>Projects</h2>
            </div>
          </div>

          <div className="project-list">
            {developer.projects.map((project) => (
              <div className="project-card" key={project.project}>
                <div className="project-icon">
                  <BriefcaseBusiness size={20} />
                </div>

                <div className="project-content">
                  <h3>{project.project}</h3>

                  <div className="project-meta">
                    <span>{project.role}</span>
                    <span>{project.durationMonths} months</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Graph intelligence</p>
              <h2>Connected technologies</h2>
            </div>
          </div>

          <p className="section-description">
            Technologies connected to the developer's project stack through
            the knowledge graph.
          </p>

          <Recommendations recommendations={recommendations} />
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Technology stack</p>
              <h2>Project technologies</h2>
            </div>
          </div>

          <div className="stack-list">
            {developer.projectTechnologies.map((item) => (
              <div
                className="stack-row"
                key={`${item.project}-${item.technology}`}
              >
                <div>
                  <strong>{item.technology}</strong>
                  <span>{item.project}</span>
                </div>

                <span className="version">v{item.version}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Graph</p>
              <h2>Relationship explorer</h2>
            </div>
          </div>

          <KnowledgeGraph developerName={developer.developer} />
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default App;