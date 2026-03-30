import { type ReactNode } from 'react';

type PageLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function PageLayout({ title, description, children }: PageLayoutProps) {
  return (
    <div className="app-shell page-shell">
      <header className="page-header">
        <div className="page-header__body">
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
      </header>

      <section className="content">{children}</section>
    </div>
  );
}
