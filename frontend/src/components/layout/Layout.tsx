import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ChevronRight,
  CircleHelp,
  FlaskConical,
  Github,
  LayoutDashboard,
  ListChecks,
  Menu,
  PanelLeftClose,
  Play,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/test-cases', label: 'Test Cases', icon: ListChecks },
  { to: '/results', label: 'Results', icon: BarChart3 },
  { to: '/response-quality', label: 'Response Quality', icon: Sparkles },
  { to: '/failure-analysis', label: 'Failure Analysis', icon: TriangleAlert },
  { to: '/evaluate', label: 'Evaluate', icon: Play },
  { to: '/about', label: 'About', icon: CircleHelp },
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
    document.title = `${navigation.find((item) => item.to === location.pathname)?.label ?? 'Page not found'} · Sinhala-English LLM Evaluation`;
  }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === 'Tab') {
        const elements = sidebar.current?.querySelectorAll<HTMLElement>('a, button');
        if (!elements?.length) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          tabIndex={-1}
          onClick={() => {
            setOpen(false);
            menuButton.current?.focus();
          }}
        />
      )}
      <aside ref={sidebar} id="sidebar" className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Activity size={25} />
          </div>
          <div>
            <strong>
              Lingua<span>Eval</span>
            </strong>
            <small>MULTILINGUAL LLM LAB</small>
          </div>
          <button
            className="mobile-close icon-button"
            onClick={() => {
              setOpen(false);
              menuButton.current?.focus();
            }}
            aria-label="Close menu"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>
        <div className="workspace-label">
          WORKSPACE <span>v1.0</span>
        </div>
        <nav aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon }, index) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''} ${index === 5 ? 'nav-divider' : ''}`
              }
            >
              <Icon size={19} strokeWidth={1.7} />
              <span>{label}</span>
              {label === 'Test Cases' && <span className="nav-count">60</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="research-card">
            <FlaskConical size={21} />
            <strong>Built for better evaluation.</strong>
            <p>
              Understanding language.
              <br />
              Measuring what matters.
            </p>
            <Link to="/about">
              Explore the project <ArrowUpRight size={14} />
            </Link>
          </div>
          <a
            className="sidebar-repo"
            href="https://github.com/PoornaviSina/Sinhala-English-LLMEvaluation"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={17} />
            <span>Project repository</span>
            <ArrowUpRight size={14} />
          </a>
          <div className="sidebar-footer">
            <span className="status-dot" /> Go-powered evaluation
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="top-header">
          <button
            ref={menuButton}
            className="menu-button icon-button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="sidebar"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="project-title">
            <strong>Sinhala-English LLM Evaluation</strong>
            <span>Multilingual Customer Support Evaluation Framework</span>
          </div>
          <div
            className="connection"
            title="Configuration display only. No live API connection or credentials are checked."
          >
            <span className="connection-icon">
              <Sparkles size={18} />
            </span>
            <div>
              <strong>
                Gemini API{' '}
                <span className="connected">
                  <span className="status-dot" />
                  Connected
                </span>
              </strong>
              <small>Configuration status only</small>
            </div>
          </div>
        </header>
        <main id="main-content" ref={main} tabIndex={-1}>
          <div className="breadcrumb">
            <BookOpen size={13} /> Workspace <ChevronRight size={12} />
            <span>
              {navigation.find((item) => item.to === location.pathname)?.label ?? 'Not found'}
            </span>
            <span className="dataset-indicator">
              <span className="status-dot" /> Final evaluation dataset
            </span>
          </div>
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>Sinhala-English LLM Evaluation Framework</span>
          <span>
            <ShieldCheck size={13} /> Repository-backed results · 60-case dataset
          </span>
        </footer>
      </div>
    </div>
  );
}
