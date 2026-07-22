"use client";

import { useEffect, useMemo, useState } from "react";
import agendaData from "./agenda-data.json";

type Session = (typeof agendaData.sessions)[number];

const STORAGE_KEY = "expert-xp-2026:favorites:v1";
const DAY_LABELS: Record<string, { date: string; weekday: string }> = {
  "Dia 1": { date: "23", weekday: "QUI" },
  "Dia 2": { date: "24", weekday: "SEX" },
  "Dia 3": { date: "25", weekday: "SÁB" },
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function uniqueValues(key: "stage" | "theme" | "level") {
  return Array.from(
    new Set(agendaData.sessions.map((session) => session[key]).filter(Boolean)),
  ).sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
}

export default function Home() {
  const [activeDay, setActiveDay] = useState("Dia 1");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("");
  const [theme, setTheme] = useState("");
  const [level, setLevel] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const stages = useMemo(() => uniqueValues("stage"), []);
  const themes = useMemo(() => uniqueValues("theme"), []);
  const levels = useMemo(() => uniqueValues("level"), []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setFavoriteIds(JSON.parse(saved));
      } catch {
        // The agenda still works if persistent browser storage is unavailable.
      }

      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: agendaData.event.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      const currentDay: Record<string, string> = {
        "2026-07-23": "Dia 1",
        "2026-07-24": "Dia 2",
        "2026-07-25": "Dia 3",
      };
      if (currentDay[today]) setActiveDay(currentDay[today]);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const normalizedQuery = normalize(query);

  const filteredSessions = useMemo(() => {
    return agendaData.sessions.filter((session) => {
      if (session.day !== activeDay) return false;
      if (stage && session.stage !== stage) return false;
      if (theme && session.theme !== theme) return false;
      if (level && session.level !== level) return false;
      if (favoritesOnly && !favoriteSet.has(session.id)) return false;
      if (!normalizedQuery) return true;

      const searchable = normalize([
        session.title,
        session.stage,
        session.theme ?? "",
        session.level ?? "",
        session.speakers.join(" "),
      ].join(" "));
      return searchable.includes(normalizedQuery);
    });
  }, [activeDay, favoriteSet, favoritesOnly, level, normalizedQuery, stage, theme]);

  const activeFilterCount = [stage, theme, level].filter(Boolean).length;

  function toggleFavorite(id: string) {
    setFavoriteIds((current) => {
      const next = current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Keep the current-session state when storage is unavailable.
      }
      return next;
    });
  }

  function clearFilters() {
    setQuery("");
    setStage("");
    setTheme("");
    setLevel("");
  }

  return (
    <main className="site-shell">
      <div className="app-column">
        <header className="event-header">
          <div className="brand" aria-label="Expert XP 2026">Expert <span>XP</span> 2026</div>
          <div className="date-badge">23–25 JUL</div>
        </header>

        <section className="control-deck" aria-label="Buscar e filtrar a agenda">
          <p className="intro">Encontre sua próxima sessão</p>
          <div className="search-box">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar palestra, tema ou palestrante"
              aria-label="Buscar palestra, tema ou palestrante"
            />
            {query && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                title="Limpar busca"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>

          <div className="day-tabs" aria-label="Selecionar dia">
            {Object.entries(DAY_LABELS).map(([day, label]) => (
              <button
                key={day}
                type="button"
                className={activeDay === day ? "day-tab active" : "day-tab"}
                aria-pressed={activeDay === day}
                onClick={() => setActiveDay(day)}
              >
                <strong>{label.date}</strong><span>{label.weekday}</span>
              </button>
            ))}
          </div>

          <div className="filter-row">
            <label><span className="sr-only">Filtrar por palco</span>
              <select value={stage} onChange={(event) => setStage(event.target.value)}>
                <option value="">Palco</option>
                {stages.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label><span className="sr-only">Filtrar por tema</span>
              <select value={theme} onChange={(event) => setTheme(event.target.value)}>
                <option value="">Tema</option>
                {themes.map((value) => <option key={value} value={value ?? ""}>{value}</option>)}
              </select>
            </label>
            <label><span className="sr-only">Filtrar por nível</span>
              <select value={level} onChange={(event) => setLevel(event.target.value)}>
                <option value="">Nível</option>
                {levels.map((value) => <option key={value} value={value ?? ""}>{value}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="agenda-section" aria-labelledby="agenda-title">
          <div className="section-heading">
            <div>
              <p>{favoritesOnly ? "Sua seleção" : "Programação"}</p>
              <h1 id="agenda-title">
                {favoritesOnly ? "Favoritos" : `${activeDay} · ${agendaData.sessions.find((item) => item.day === activeDay)?.date}`}
              </h1>
            </div>
            <span aria-live="polite">{filteredSessions.length} {filteredSessions.length === 1 ? "sessão" : "sessões"}</span>
          </div>

          {(normalizedQuery || activeFilterCount > 0) && (
            <div className="filter-summary">
              <span>{normalizedQuery ? `Busca: “${query.trim()}”` : `${activeFilterCount} filtro(s) ativo(s)`}</span>
              <button type="button" onClick={clearFilters}>Limpar</button>
            </div>
          )}

          {filteredSessions.length > 0 ? (
            <div className="session-list">
              {filteredSessions.map((session: Session) => (
                <article className={session.theme || session.speakers.length ? "session-card" : "session-card quiet"} key={session.id}>
                  <time className="session-time" dateTime={`${session.date.split("/").reverse().join("-")}T${session.time}:00`}>{session.time}</time>
                  <div className="session-copy">
                    <p className="session-stage">{session.stage}</p>
                    <h2>{session.title}</h2>
                    {session.speakers.length > 0 && <p className="speakers">{session.speakers.join("; ")}</p>}
                    <div className="session-tags">
                      {session.theme && <span>{session.theme}</span>}
                      {session.level && <span className="level-tag">{session.level}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={favoriteSet.has(session.id) ? "favorite active" : "favorite"}
                    aria-label={favoriteSet.has(session.id) ? `Remover ${session.title} dos favoritos` : `Adicionar ${session.title} aos favoritos`}
                    aria-pressed={favoriteSet.has(session.id)}
                    onClick={() => toggleFavorite(session.id)}
                  ><span aria-hidden="true">{favoriteSet.has(session.id) ? "★" : "☆"}</span></button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">⌕</span>
              <h2>Nenhuma sessão encontrada</h2>
              <p>Tente outro trecho da busca ou remova alguns filtros.</p>
              <button type="button" onClick={clearFilters}>Limpar busca e filtros</button>
            </div>
          )}
        </section>

        <footer>
          <p>Programação sujeita a alterações.</p>
          <p className="disclaimer">Projeto independente, sem vínculo, participação ou endosso da XP Inc.</p>
        </footer>
      </div>

      <nav className="bottom-nav" aria-label="Navegação principal">
        <button type="button" className={!favoritesOnly ? "active" : ""} aria-current={!favoritesOnly ? "page" : undefined} onClick={() => setFavoritesOnly(false)}>
          <span aria-hidden="true">▤</span> Agenda
        </button>
        <button type="button" className={favoritesOnly ? "active" : ""} aria-current={favoritesOnly ? "page" : undefined} onClick={() => setFavoritesOnly(true)}>
          <span aria-hidden="true">★</span> Favoritos
          {favoriteIds.length > 0 && <strong>{favoriteIds.length}</strong>}
        </button>
      </nav>
    </main>
  );
}
