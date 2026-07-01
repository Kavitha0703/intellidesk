import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, Target, Workflow, Users, BarChart3, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SITE = 'https://intellidesk.lovable.app';
const PATH = '/blog/it-support-best-practices';
const TITLE = 'IT Support Best Practices: A Guide to Modern IT Ticketing Systems';
const DESCRIPTION =
  'A practical guide to IT service management (ITSM) best practices — streamline IT workflows, define help desk KPIs, and manage employee complaints with a modern IT ticketing system.';

export default function ITSupportBestPractices() {
  const url = `${SITE}${PATH}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    author: { '@type': 'Organization', name: 'IntelliDesk' },
    publisher: {
      '@type': 'Organization',
      name: 'IntelliDesk',
      url: SITE,
    },
    mainEntityOfPage: url,
    datePublished: '2026-07-01',
    dateModified: '2026-07-01',
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      </Helmet>

      <header className="border-b bg-card/60 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to IntelliDesk
          </Link>
          <Button asChild size="sm">
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </header>

      <article className="container max-w-3xl py-12 md:py-16">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">IT Service Management</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
          IT Support Best Practices: A Guide to Modern IT Ticketing Systems
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A practical playbook for IT managers who want faster resolution times, clearer accountability,
          and happier employees — built around a modern IT ticketing system.
        </p>

        <div className="mt-10 space-y-10 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Workflow className="h-6 w-6 text-primary" /> 1. Streamline your IT workflows
            </h2>
            <p className="mt-3">
              The single biggest lever in IT service management (ITSM) is removing friction from the moment
              a user files a ticket to the moment it's resolved. Every extra email, spreadsheet, or "quick
              chat" is time your team isn't spending on real work.
            </p>
            <ul className="mt-4 space-y-2">
              {[
                'Centralize intake — one portal, one form, one queue. No shadow channels.',
                'Auto-categorize and route tickets by type (hardware, network, access, software).',
                'Standardize priority levels (P1–P4) with clear response and resolution SLAs.',
                'Attach evidence at intake: screenshots, notes, and reproduction steps.',
                'Automate status updates so users stop asking "any progress?"',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" /> 2. Define the KPIs that actually matter
            </h2>
            <p className="mt-3">
              Most help desks drown in metrics no one uses. Pick a small set of KPIs that map directly to
              user experience and team health, and review them weekly.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { k: 'First Response Time', v: 'How quickly a human acknowledges a new ticket.' },
                { k: 'Mean Time to Resolution', v: 'Average time from ticket open to close.' },
                { k: 'First Contact Resolution', v: '% of tickets solved on the first touch.' },
                { k: 'Backlog Age', v: 'Median age of open tickets — a leading indicator of pain.' },
                { k: 'CSAT / Feedback Score', v: 'Post-resolution satisfaction from the requester.' },
                { k: 'Reopen Rate', v: '% of "resolved" tickets that come back — flags weak fixes.' },
              ].map((row) => (
                <Card key={row.k}>
                  <CardContent className="p-4">
                    <div className="font-semibold">{row.k}</div>
                    <p className="text-sm text-muted-foreground mt-1">{row.v}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> 3. Manage employee complaints efficiently
            </h2>
            <p className="mt-3">
              Employees don't care about your queue depth — they care whether their problem is being taken
              seriously. Small changes in how you communicate transform how support "feels".
            </p>
            <ul className="mt-4 space-y-2">
              {[
                'Acknowledge every ticket within minutes, even if resolution takes longer.',
                'Give each ticket a clear owner — never "the team".',
                'Post an internal notice for widespread issues before people file duplicates.',
                'Close the loop with a short explanation of what was fixed and why.',
                'Collect structured feedback on resolution quality, not just speed.',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" /> 4. Choosing an IT ticketing system
            </h2>
            <p className="mt-3">
              The right IT ticketing system enforces good habits automatically. When evaluating options,
              look for:
            </p>
            <ul className="mt-4 space-y-2">
              {[
                'Role-based portals — separate experiences for end users and admins.',
                'Rich evidence support — multiple screenshots, notes, and inline previews.',
                'Bulk operations and filters for admins triaging at scale.',
                'Exportable reports (PDF/CSV) for leadership reviews.',
                'Notices and announcements for proactive communication.',
                'Mobile-friendly / installable (PWA) so support is always in reach.',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" /> 5. A 30-day rollout plan
            </h2>
            <ol className="mt-4 space-y-3 list-decimal pl-5">
              <li><strong>Week 1 —</strong> Move all intake into one portal. Kill email-based tickets.</li>
              <li><strong>Week 2 —</strong> Define priorities, SLAs, and ownership rules. Document them.</li>
              <li><strong>Week 3 —</strong> Turn on your KPI dashboard. Baseline the current numbers.</li>
              <li><strong>Week 4 —</strong> Launch feedback collection and a weekly review ritual.</li>
            </ol>
          </section>

          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold">Try IntelliDesk</h2>
            <p className="mt-2 text-muted-foreground">
              IntelliDesk is a smart IT support platform built around these practices — separate user and
              admin portals, evidence-rich tickets, notices, feedback, and PDF reporting out of the box.
            </p>
            <Button asChild className="mt-4">
              <Link to="/auth">Get started free</Link>
            </Button>
          </section>
        </div>
      </article>
    </div>
  );
}
