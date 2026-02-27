import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import NavTabs from '../components/NavTabs';

const SCHOOLS = [
  {
    name: 'School of Software Engineering',
    abbr: 'SSE',
    color: '#2563eb',
    cabinet: 'C1.2.356',
    email: 'sse@astanait.edu.kz',
  },
  {
    name: 'School of Artificial Intelligence and Data Science',
    abbr: 'SAIDS',
    color: '#7c3aed',
    cabinet: 'C1.2.358',
    email: 'saids@astanait.edu.kz',
  },
  {
    name: 'School of Intelligent Systems',
    abbr: 'SIS',
    color: '#0891b2',
    cabinet: 'C1.2.354',
    email: 'sis@astanait.edu.kz',
  },
  {
    name: 'Cybersecurity School',
    abbr: 'CSS',
    color: '#dc2626',
    cabinet: 'C1.2.352',
    email: 'css@astanait.edu.kz',
  },
  {
    name: 'School of Creative Industries',
    abbr: 'SCI',
    color: '#ea580c',
    cabinet: 'C1.2.350',
    email: 'sci@astanait.edu.kz',
  },
  {
    name: 'School of Digital Public Administration',
    abbr: 'SDPA',
    color: '#16a34a',
    cabinet: 'C1.2.348',
    email: 'sdpa@astanait.edu.kz',
  },
  {
    name: 'School of General Education Subjects',
    abbr: 'SGES',
    color: '#6b7280',
    cabinet: 'C1.2.346',
    email: 'sges@astanait.edu.kz',
  },
];

const DEPARTMENTS = [
  { name: "Registrar's Office", cabinet: 'C1.1.270', email: 'aliya.koitanova@astanait.edu.kz', phone: null },
  { name: 'Student Department', cabinet: 'C1.1.273', email: 'g.zhussupova@astanait.edu.kz', phone: null },
  { name: 'Academic Affairs', cabinet: 'C1.1.266', email: 'G.Bekmagambetova@astanait.edu.kz', phone: null },
  { name: 'IT Department', cabinet: 'C1.1.260', email: 'it@astanait.edu.kz', phone: null },
  { name: 'Career Center', cabinet: 'C1.1.272', email: 'madina.mukaliyeva@astanait.edu.kz', phone: null },
  { name: 'International Cooperation', cabinet: 'C1.2.370', email: 'leila.salykova@astanait.edu.kz', phone: null },
  { name: 'Library', cabinet: '1st floor, C1', email: 'maral.nuralina@astanait.edu.kz', phone: null },
  { name: 'Admissions Committee', cabinet: 'C1, 1st floor', email: 'admission@astanait.edu.kz', phone: '+7 (7172) 64-57-10' },
  { name: 'General Office', cabinet: 'C1', email: 'info@astanait.edu.kz', phone: '+7 (7172) 645-716' },
  { name: 'PR / Media', cabinet: null, email: 'pr@astanait.edu.kz', phone: '+7 775 005 3995' },
];

export default function HelpPage() {
  return (
    <main className="app-shell">
      <div className="top-bar">
        <Link href="/" className="nav-brand">Helper</Link>
        <NavTabs />
        <ThemeToggle />
      </div>

      <header className="page-header" style={{ paddingTop: 28 }}>
        <h1>AITU Schools &amp; Departments</h1>
        <p>{SCHOOLS.length} schools · {DEPARTMENTS.length} offices &amp; departments</p>
      </header>

      <section id="main" className="content help-content">
        <h2 className="help-section-title">Schools</h2>
        <div className="schools-grid">
          {SCHOOLS.map((school) => (
            <article key={school.abbr} className="card school-card">
              <div className="school-card__header">
                <span className="school-card__badge" style={{ background: school.color }}>{school.abbr}</span>
                <h2 className="school-card__name">{school.name}</h2>
              </div>
              <div className="school-card__contact">
                <span className="school-card__detail">📍 {school.cabinet}</span>
                <a className="school-card__detail school-card__email" href={`mailto:${school.email}`}>✉ {school.email}</a>
              </div>
            </article>
          ))}
        </div>

        <h2 className="help-section-title" style={{ marginTop: 32 }}>Offices &amp; Departments</h2>
        <div className="dept-list">
          {DEPARTMENTS.map((dept) => (
            <div key={dept.name} className="card dept-row">
              <span className="dept-row__name">{dept.name}</span>
              <div className="dept-row__info">
                {dept.cabinet && <span className="dept-row__detail">📍 {dept.cabinet}</span>}
                {dept.phone && <span className="dept-row__detail">📞 {dept.phone}</span>}
                <a className="dept-row__detail dept-row__email" href={`mailto:${dept.email}`}>✉ {dept.email}</a>
              </div>
            </div>
          ))}
        </div>

        <p className="help-footer">
          Source: AITU 2025–2026. For full details see{' '}
          <a href="https://astanait.edu.kz" target="_blank" rel="noopener noreferrer">astanait.edu.kz</a>
        </p>
      </section>
    </main>
  );
}
