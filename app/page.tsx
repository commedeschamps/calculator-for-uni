import Link from 'next/link';
import PageLayout from './components/PageLayout';
import HomeNextLesson from './components/HomeNextLesson';
import { TOOL_LINKS } from './lib/navigation';

export default function Home() {
  // Filter out the home link, we only need the other tools
  const tools = TOOL_LINKS.filter((tool) => tool.href !== '/');

  return (
    <PageLayout title="AITU Tools">
      <div className="home-stack">
        <HomeNextLesson />

        <div className="home-grid">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="card home-card"
              >
                <div className="home-card__top">
                  <span className="home-card__icon">
                    <Icon className="h-8 w-8" />
                  </span>
                </div>
                <h2 className="card-title">
                  {tool.label}
                  <span className="card-arrow">&rarr;</span>
                </h2>
              </Link>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
