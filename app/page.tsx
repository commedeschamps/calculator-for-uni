import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';
import NavTabs from './components/NavTabs';

const TOOLS = [
  {
    href: '/schedule',
    title: 'Schedule',
    desc: 'Weekly timetable for SE-2411 with elective tracks, filters, and conflict analysis.',
  },
  {
    href: '/course-grade',
    title: 'Course Grade',
    desc: 'Calculate your course result from midterm, endterm, and final scores.',
  },
  {
    href: '/syllabus',
    title: 'Syllabus Builder',
    desc: 'Create weighted grading templates and track your progress per course.',
  },
  {
    href: '/gpa',
    title: 'GPA Calculator',
    desc: 'Add courses with credits and grades to compute your weighted GPA.',
  },
  {
    href: '/final-target',
    title: 'Final Target',
    desc: 'Find out what score you need on the final to reach your goal.',
  },
  {
    href: '/help',
    title: 'Academic Guide',
    desc: 'AITU grading rules, formulas, GPA calculation, retake policies, and key contacts.',
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
        <h1 style={{ fontSize: 28 }}>Academic tools.</h1>
        <p style={{ marginTop: 8, maxWidth: 440 }}>
          A minimal set of calculators for course grades, GPA tracking, and exam planning.
        </p>
      </header>

      <div id="main" className="home-grid">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="card"
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
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
