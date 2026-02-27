import Link from 'next/link';

const TOOLS = [
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
    href: '/scientific',
    title: 'Scientific Calculator',
    desc: 'Evaluate expressions with trig, log, and other advanced functions.',
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
];

export default function Home() {
  return (
    <main className="app-shell" style={{ paddingTop: 0 }}>
      <div className="top-bar">
        <span className="nav-brand">Campus Suite</span>
      </div>

      <header className="page-header" style={{ paddingTop: 48, paddingBottom: 8 }}>
        <h1 style={{ fontSize: 28 }}>Academic tools, simplified.</h1>
        <p style={{ marginTop: 8, maxWidth: 440 }}>
          A minimal set of calculators for course grades, GPA tracking, and exam planning.
        </p>
      </header>

      <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="card"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              transition: 'border-color 0.15s',
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
              {tool.title} <span style={{ opacity: 0.3 }}>&rarr;</span>
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{tool.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
