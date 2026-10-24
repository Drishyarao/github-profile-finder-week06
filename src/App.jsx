import { useState, useEffect } from "react";

// Keys used to save data in the browser (localStorage)
const HISTORY_KEY = "devfinder-history";
const THEME_KEY = "devfinder-theme";

// Read saved search history from the browser (safe if nothing is saved)
function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Read saved theme from the browser (default is dark)
function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

// Turn "Mar 5 2011" style dates into "March 5, 2011"
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Make sure a website link starts with http so it opens correctly
function fixUrl(url) {
  return url.startsWith("http") ? url : "https://" + url;
}

function App() {
  // ----- State -----
  const [inputValue, setInputValue] = useState(""); // what the user is typing
  const [username, setUsername] = useState(""); // the name we are searching for
  const [searchId, setSearchId] = useState(0); // changes on every search so we can re-fetch the same name
  const [user, setUser] = useState(null); // profile data from GitHub
  const [repos, setRepos] = useState([]); // repository list from GitHub
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(loadHistory);
  const [theme, setTheme] = useState(loadTheme);

  // ----- Effect 1: fetch data from GitHub whenever a new search starts -----
  useEffect(() => {
    if (!username) return;

    // AbortController lets us cancel an old request if a new search starts
    const controller = new AbortController();

    async function fetchProfile() {
      setLoading(true);
      setError("");
      setUser(null);
      setRepos([]);

      try {
        const [userResponse, reposResponse] = await Promise.all([
          fetch("https://api.github.com/users/" + encodeURIComponent(username), {
            signal: controller.signal,
          }),
          fetch(
            "https://api.github.com/users/" +
              encodeURIComponent(username) +
              "/repos?sort=updated&per_page=6",
            { signal: controller.signal }
          ),
        ]);

        // Handle errors from the profile request
        if (userResponse.status === 404) {
          throw new Error(
            'No GitHub user named "' + username + '" was found. Check the spelling and try again.'
          );
        }
        if (userResponse.status === 403 || userResponse.status === 429) {
          throw new Error(
            "GitHub's request limit has been reached. Please wait a few minutes and try again."
          );
        }
        if (!userResponse.ok) {
          throw new Error("Something went wrong on GitHub's side. Please try again.");
        }

        const userData = await userResponse.json();
        const repoData = reposResponse.ok ? await reposResponse.json() : [];

        setUser(userData);
        setRepos(Array.isArray(repoData) ? repoData : []);

        // Save to search history (newest first, no duplicates, max 6)
        setHistory((previous) => {
          const withoutDuplicate = previous.filter(
            (name) => name.toLowerCase() !== userData.login.toLowerCase()
          );
          return [userData.login, ...withoutDuplicate].slice(0, 6);
        });
      } catch (err) {
        // Ignore cancelled requests - they are outdated
        if (err.name === "AbortError") return;

        if (err instanceof TypeError) {
          setError("Network error. Check your internet connection and try again.");
        } else {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    // Cleanup: cancel the request if the search changes or the page closes
    return () => controller.abort();
  }, [username, searchId]);

  // ----- Effect 2: save history in the browser whenever it changes -----
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Saving is optional, so we ignore errors
    }
  }, [history]);

  // ----- Effect 3: apply the theme to the page and save it -----
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Saving is optional, so we ignore errors
    }
  }, [theme]);

  // ----- Event handlers -----
  function startSearch(name) {
    setUsername(name);
    setSearchId((id) => id + 1);
  }

  // Runs when the button is clicked OR Enter is pressed (it is a form)
  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = inputValue.trim();

    if (!trimmed) {
      setUser(null);
      setRepos([]);
      setError("Please enter a GitHub username to search.");
      return;
    }
    startSearch(trimmed);
  }

  function handleHistoryClick(name) {
    setInputValue(name);
    startSearch(name);
  }

  function clearHistory() {
    setHistory([]);
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  const showEmptyState = !user && !loading && !error;

  // ----- What appears on the screen -----
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">GH</span>
            <span className="logo-text">DevFinder</span>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Switch between dark and light mode"
          >
            <span>{theme === "dark" ? "☀️" : "🌙"}</span>
            <span className="theme-toggle-text">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>
        </div>
      </header>

      <main className="main">
        {/* Hero + search */}
        <section className="hero">
          <h1 className="hero-title">
            Find your next <span className="hero-gradient">developer profile.</span>
          </h1>
          <p className="hero-subtitle">
            Search any GitHub username to see their profile, stats and latest repositories.
          </p>

          <form className="search-form" onSubmit={handleSubmit}>
            <input
              className="search-input"
              type="text"
              placeholder="Enter a GitHub username, e.g. octocat"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              aria-label="GitHub username"
              autoComplete="off"
            />
            <button className="search-button" type="submit" disabled={loading}>
              Search Profile
            </button>
          </form>

          {history.length > 0 && (
            <div className="history">
              <span className="history-label">Recent searches</span>
              {history.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="history-chip"
                  onClick={() => handleHistoryClick(name)}
                >
                  {name}
                </button>
              ))}
              <button type="button" className="history-clear" onClick={clearHistory}>
                Clear
              </button>
            </div>
          )}
        </section>

        {/* Loading message */}
        {loading && (
          <div className="status-box" role="status">
            <div className="spinner"></div>
            <p>Loading profile…</p>
          </div>
        )}

        {/* Error message */}
        {error && !loading && (
          <div className="error-box" role="alert">
            <span className="error-icon">⚠️</span>
            <div>
              <h2 className="error-title">Couldn't load that profile</h2>
              <p className="error-text">{error}</p>
            </div>
          </div>
        )}

        {/* Empty state (before first search) */}
        {showEmptyState && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2 className="empty-title">Start with a username</h2>
            <p className="empty-text">
              Type a GitHub username above and press Enter. Try <strong>octocat</strong> to see how
              a profile looks.
            </p>
          </div>
        )}

        {/* Profile results */}
        {user && !loading && (
          <>
            <section className="profile-card">
              <img className="profile-avatar" src={user.avatar_url} alt={user.login + " avatar"} />

              <div className="profile-info">
                <h2 className="profile-name">{user.name || user.login}</h2>
                <p className="profile-username">@{user.login}</p>
                <p className="profile-bio">{user.bio || "This user has no bio yet."}</p>

                <ul className="profile-meta">
                  {user.location && <li className="meta-item">📍 {user.location}</li>}
                  {user.company && <li className="meta-item">🏢 {user.company}</li>}
                  {user.blog && (
                    <li className="meta-item">
                      🔗{" "}
                      <a href={fixUrl(user.blog)} target="_blank" rel="noreferrer">
                        {user.blog}
                      </a>
                    </li>
                  )}
                  <li className="meta-item">📅 Joined {formatDate(user.created_at)}</li>
                </ul>

                <a
                  className="visit-button"
                  href={user.html_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View GitHub Profile
                </a>
              </div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{user.public_repos}</span>
                <span className="stat-label">Public repositories</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{user.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{user.following}</span>
                <span className="stat-label">Following</span>
              </div>
            </section>

            <section className="repos-section">
              <h2 className="section-title">Recent repositories</h2>

              {repos.length === 0 ? (
                <p className="repos-empty">This user has no public repositories yet.</p>
              ) : (
                <div className="repo-grid">
                  {repos.map((repo) => (
                    <a
                      key={repo.id}
                      className="repo-card"
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <h3 className="repo-name">{repo.name}</h3>
                      <p className="repo-desc">{repo.description || "No description provided."}</p>
                      <div className="repo-footer">
                        {repo.language ? (
                          <span className="repo-lang">
                            <span className="lang-dot"></span>
                            {repo.language}
                          </span>
                        ) : (
                          <span className="repo-lang">No language</span>
                        )}
                        <span className="repo-stat">⭐ {repo.stargazers_count}</span>
                        <span className="repo-stat">🍴 {repo.forks_count}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>DevFinder · Built with React and the GitHub REST API</p>
      </footer>
    </div>
  );
}

export default App;