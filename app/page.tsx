import Link from 'next/link';
import PageLayout from './components/PageLayout';

const TOOLS = [
  {
    href: '/schedule',
    title: 'Schedule',
    icon: '📅',
  },
  {
    href: '/map',
    title: 'Campus Map',
    icon: '🗺️',
  },
  {
    href: '/course-grade',
    title: 'Course Grade',
    icon: '🎯',
  },
  {
    href: '/syllabus',
    title: 'Syllabus Builder',
    icon: '📝',
  },
  {
    href: '/gpa',
    title: 'GPA Calculator',
    icon: '📊',
  },
  {
    href: '/final-target',
    title: 'Final Target',
    icon: '🏁',
  },
  {
    href: '/help',
    title: 'AITU Guide',
    icon: '🏫',
  },
];

export default function Home() {
  return (
    <PageLayout title="AITU Tools">
      <section className="card section-block">
        <div className="section-head">
          <div>
            <h2>Tools</h2>
          </div>
          <div className="row-actions">
            <Link href="/schedule" className="btn btn-primary">Schedule</Link>
            <Link href="/map" className="btn btn-muted">Map</Link>
            <Link href="/gpa" className="btn btn-muted">GPA</Link>
          </div>
        </div>
      </section>

      <div className="home-grid">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="card home-card"
          >
            <div className="home-card__top">
              <span className="home-card__icon">{tool.icon}</span>
            </div>
            <h2 className="card-title">
              {tool.title}
              <span className="card-arrow">&rarr;</span>
            </h2>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
