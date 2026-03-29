import Link from "next/link";

export default function NavbarDemoPage() {
  return (
    <div className="app-shell min-h-screen bg-background text-foreground">
      <section className="container py-12">
        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Legacy preview route.
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            The app now uses the shared sidebar shell
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            The top navbar preview was retired after the navigation moved into
            the responsive app sidebar. Use the main routes below to inspect
            the current production shell.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to home
            </Link>
            <Link
              href="/schedule"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Open schedule
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
