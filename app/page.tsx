import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';
import NavTabs from './components/NavTabs';

const TOOLS = [
  {
    href: '/schedule',
    title: 'Schedule',
    icon: '📅',
    desc: 'Weekly timetable with elective tracks and conflict detection.',
  },
  {
    href: '/course-grade',
    title: 'Course Grade',
    icon: '🎯',
    desc: 'Get your total from RegMid, RegEnd, and Final.',
  },
  {
    href: '/syllabus',
    title: 'Syllabus Builder',
    icon: '📝',
    desc: 'Track attestation grades and weights per course.',
  },
  {
    href: '/gpa',
    title: 'GPA Calculator',
    icon: '📊',
    desc: 'Compute weighted GPA from credits and grades.',
  },
  {
    href: '/final-target',
    title: 'Final Target',
    icon: '🏁',
    desc: 'See what final score you need to pass or get scholarship.',
  },
  {
    href: '/help',
    title: 'Academic Guide',
    icon: '🏫',
    desc: 'Schools, departments, contacts, and grading rules.',
  },
];

export default function Home() {
  return (
    <main className="app-shell" style={{ paddingTop: 0 }}>
      <div className="top-bar">
        <span className="nav-brand">Helper</span>
        <NavTabs />
        <ThemeToggle />
      </div>

      <header className="page-header" style={{ paddingTop: 48, paddingBottom: 8 }}>
        <h1 style={{ fontSize: 28 }}>Helper</h1>
        <p style={{ marginTop: 8, maxWidth: 440 }}>
          Academic toolkit for AITU students.
        </p>
      </header>

      <div id="main" className="home-grid">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="card home-card"
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <span className="home-card__icon">{tool.icon}</span>
            <h2 className="card-title">
              {tool.title}
              <span className="card-arrow">&rarr;</span>
            </h2>
            <p className="card-desc">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
