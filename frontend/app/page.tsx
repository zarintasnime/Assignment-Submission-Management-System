/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

/* ---------------------------------------------------------------------------
   Inline icons — no icon package, no network request.
   --------------------------------------------------------------------------- */

function IconCap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4 2 9l10 5 10-5-10-5Z" fill="currentColor" />
      <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2.5" fill="currentColor" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRocket() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 3c4 1.5 7 5 8 9-4 1-7.5-.5-9.5-3S11 4.5 13 3Z" fill="currentColor" />
      <path d="M11.5 12.5 4 20M8 14l-3 1 1 3 3-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="m10 8.5 6 3.5-6 3.5v-7Z" fill="currentColor" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" fill="currentColor" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5.5h16v11H12l-5 3.5v-3.5H4v-11Z" fill="currentColor" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 5 6v6c0 4.2 3 7.5 7 9 4-1.5 7-4.8 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="6" y="12" width="3.5" height="6" rx="1" fill="currentColor" />
      <rect x="11.5" y="8" width="3.5" height="10" rx="1" fill="currentColor" />
      <rect x="17" y="4.5" width="3.5" height="13.5" rx="1" fill="currentColor" />
    </svg>
  );
}

function IconBank() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9.5 12 4l9 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 11v6M10 11v6M14 11v6M18 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconBoard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7.5 9h6M7.5 12.5h4M12 16.5V20M9 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.8" fill="currentColor" />
      <path d="M4.8 20c.8-3.7 3.7-5.8 7.2-5.8s6.4 2.1 7.2 5.8" fill="currentColor" />
    </svg>
  );
}

function IconMedal() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="14" r="5.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11.8l.8 1.7 1.9.3-1.4 1.3.3 1.9-1.6-.9-1.6.9.3-1.9-1.4-1.3 1.9-.3.8-1.7Z" fill="currentColor" />
      <path d="M8.5 8.5 6.5 3h11l-2 5.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Stack marks — drawn here rather than shipping vendor logo files.
   --------------------------------------------------------------------------- */

function MarkDotnet() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 3.2 34.5 11v18L20 36.8 5.5 29V11L20 3.2Z" fill="#6f3fb8" />
      <path d="M20 6.6 31.5 12.9v14.2L20 33.4 8.5 27.1V12.9L20 6.6Z" fill="#8b5cd6" />
      <text x="18.5" y="25.5" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">C</text>
      <path d="M26 15.5h5M28.5 13v5M31.5 19.5h4M33.5 17.5v4" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MarkNext() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="#0b0b0b" />
      <path d="M14.5 27V13.2h2.6l9.4 12.4" stroke="#ffffff" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25.4 13.2V22" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

function MarkPostgres() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M20 5.5c6.6 0 11.4 3.1 11.4 8.6 0 4.6-1.4 8.8-3 12.2-1.1 2.4-2.6 4.4-4.4 4.4-1.3 0-1.8-.9-1.8-2.2 0-1.6.5-3.6.5-5.6 0-1.6-.8-2.6-2.4-2.6s-2.6 1.2-2.6 3.1c0 1.8.4 3.4.4 4.8 0 1.4-.6 2.5-2 2.5-2 0-3.6-2.2-4.7-4.8-1.4-3.3-2.7-7.4-2.7-11.8 0-5.5 4.7-8.6 11.3-8.6Z"
        fill="#3a6b9c"
      />
      <path
        d="M20 8c5 0 8.7 2.3 8.7 6.4 0 3.7-1.2 7.3-2.5 10.2"
        stroke="#e8f1f8"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="16" cy="14" r="1.5" fill="#ffffff" />
      <circle cx="24" cy="14" r="1.5" fill="#ffffff" />
      <path d="M14 31.5c1.5 1.6 3.6 2.5 6 2.5s4.5-.9 6-2.5" stroke="#3a6b9c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function MarkJwt() {
  const spokes = [
    '#d64545', '#e07b39', '#d9b445', '#5fa832',
    '#2f9c8f', '#2f74d0', '#5b4bd6', '#a63fb5',
  ];
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="5" fill="#1b2440" />
      {spokes.map((colour, index) => (
        <rect
          key={colour}
          x="18.6"
          y="1.5"
          width="2.8"
          height="11"
          rx="1.4"
          fill={colour}
          transform={`rotate(${index * 45} 20 20)`}
        />
      ))}
    </svg>
  );
}

function MarkDocker() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <g fill="#2496ed">
        <rect x="11" y="17" width="5" height="4.6" rx="0.7" />
        <rect x="17" y="17" width="5" height="4.6" rx="0.7" />
        <rect x="23" y="17" width="5" height="4.6" rx="0.7" />
        <rect x="17" y="11.6" width="5" height="4.6" rx="0.7" />
        <rect x="23" y="11.6" width="5" height="4.6" rx="0.7" />
        <rect x="23" y="6.2" width="5" height="4.6" rx="0.7" />
      </g>
      <path
        d="M5 23.5h29c0 5.5-4.2 9.5-11 9.5-6 0-10.4-2.4-13.3-6-2.6-3.2-4.7-3.5-4.7-3.5Z"
        fill="#2496ed"
      />
      <path d="M31 20.5c1.4-1 3-1.2 4.6-.6-.4 1.9-1.7 3-3.6 3.1" fill="#2496ed" />
    </svg>
  );
}

function MarkRbac() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 4.5 32 9v10.5c0 7-5 12.6-12 16-7-3.4-12-9-12-16V9l12-4.5Z" fill="#c9a227" />
      <circle cx="20" cy="17" r="4.2" fill="#ffffff" />
      <path d="M12.8 28c1-4 3.8-6.2 7.2-6.2s6.2 2.2 7.2 6.2" fill="#ffffff" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Static content
   --------------------------------------------------------------------------- */

const techItems = [
  { label: 'ASP.NET Core', icon: <MarkDotnet /> },
  { label: 'Next.js', icon: <MarkNext /> },
  { label: 'PostgreSQL', icon: <MarkPostgres /> },
  { label: 'JWT Auth', icon: <MarkJwt /> },
  { label: 'Docker', icon: <MarkDocker /> },
  { label: 'Role Based Access', icon: <MarkRbac /> },
];

const pillarCards = [
  {
    key: 'admin',
    title: 'Admin',
    icon: <IconBank />,
    description: 'Manage users, classes, subjects and system settings.',
    href: '/login',
  },
  {
    key: 'teacher',
    title: 'Teacher',
    icon: <IconBoard />,
    description: 'Create assignments, review submissions and provide feedback.',
    href: '/login',
  },
  {
    key: 'student',
    title: 'Student',
    icon: <IconUser />,
    description: 'View assignments, submit work and track progress.',
    href: '/login',
  },
  {
    key: 'grade',
    title: 'Grade',
    icon: <IconMedal />,
    description: 'Evaluate performance and ensure academic excellence.',
    href: '/login',
  },
];

const featureItems = [
  { icon: <IconShield />, title: 'Secure & Reliable', text: 'JWT authentication and role-based access control' },
  { icon: <IconClock />, title: 'Deadline Management', text: 'Track due dates and late submissions effortlessly' },
  { icon: <IconChart />, title: 'Performance Insights', text: 'Monitor progress and improve outcomes' },
  { icon: <IconMessage />, title: 'Feedback System', text: 'Provide meaningful feedback and support learning' },
];

const roleCards = [
  {
    role: 'Admin',
    mark: '01',
    title: 'Academic control',
    description:
      'Create users, classes and subjects, then connect students and teachers to the correct academic context.',
    art: '/illustrations/admin.svg',
    alt: 'An administrator organising class, subject and user records',
    duties: ['Users & roles', 'Classes & subjects', 'Teacher mapping'],
  },
  {
    role: 'Teacher',
    mark: '02',
    title: 'Assignment workflow',
    description:
      'Create only from assigned class-subject mappings, publish work, review submissions and grade safely.',
    art: '/illustrations/teacher.svg',
    alt: 'A teacher publishing an assignment on the class board',
    duties: ['Draft & publish', 'Review submissions', 'Marks & feedback'],
  },
  {
    role: 'Student',
    mark: '03',
    title: 'Submission lifecycle',
    description:
      'See eligible work, understand deadline state, submit versions and review released grades and feedback.',
    art: '/illustrations/student.svg',
    alt: 'A student submitting an assignment from a laptop',
    duties: ['Open assignments', 'Submit & resubmit', 'Marks & feedback'],
  },
];

const registerStats = [
  { value: '3', label: 'Roles', note: 'Admin, Teacher, Student' },
  { value: '10', label: 'Tables', note: 'Normalised PostgreSQL schema' },
  { value: '39', label: 'Tests', note: 'Rules, access and lifecycle' },
  { value: '2', label: 'Auth gates', note: 'Role claim, then ownership' },
];

export default function HomePage() {
  return (
    <main className="landing-page" id="main-content">
      {/* ================= TOP BAR ================= */}
      <header className="cf-topbar">
        <div className="cf-topbar-inner">
          <Link href="/" className="cf-brand">
            <span className="cf-brand-mark">CF</span>
            <span className="cf-brand-text">
              <strong>CampusFlow</strong>
              <small>Assignment Registry</small>
            </span>
          </Link>

          <span className="cf-topbar-divider" aria-hidden="true" />

          <div className="cf-topbar-tagline">
            <span className="cf-topbar-badge" aria-hidden="true">
              <IconCap />
            </span>
            <p>
              Manage assignments. Track submissions.
              <br />
              Achieve excellence.
            </p>
          </div>

          <Link href="/login" className="cf-btn cf-btn-primary cf-topbar-login">
            <IconLock />
            <span>Login</span>
            <IconArrow />
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="cf-hero">
        <div className="cf-hero-copy">
          <span className="cf-eyebrow">Assignment &amp; Submission Management System</span>

          <h1 className="cf-hero-title">
            A clear academic workflow from assignment to
            <span className="cf-hero-line">
              <span className="cf-hero-accent">
                final grade.
                <svg className="cf-underline" viewBox="0 0 320 14" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 9c62-8 132-9 198-5 42 3 80 6 116 7" />
                </svg>
              </span>
            </span>
          </h1>

          <p className="cf-hero-lead">
            A role-based ASP.NET Core and Next.js application designed so an evaluator can understand the complete
            Admin → Teacher → Student flow in minutes.
          </p>

          <div className="cf-hero-actions">
            <Link href="/login" className="cf-btn cf-btn-primary cf-btn-lg">
              <IconRocket />
              <span>Explore Demo</span>
            </Link>
            <a href="#workflow" className="cf-btn cf-btn-ghost cf-btn-lg">
              <IconPlay />
              <span>View Workflow</span>
            </a>
          </div>
        </div>

        <div className="cf-hero-art">
          {/* decorative laptop-on-folder scene */}
          <svg className="cf-hero-scene" viewBox="0 0 560 460" aria-hidden="true">
            <path
              className="cf-arc"
              d="M96 372C64 250 150 96 300 78c96-12 168 26 206 92"
              fill="none"
              strokeDasharray="7 11"
            />
            {/* folder */}
            <path d="M118 366l52-104h300l-58 116c-6 12-18 20-32 20H130c-14 0-18-12-12-32Z" fill="#e8bd6a" />
            <path d="M150 254h300l-16 32H134Z" fill="#f0cf90" />
            {/* laptop */}
            <g transform="rotate(-7 320 190)">
              <rect x="182" y="66" width="290" height="196" rx="16" fill="#1b2440" />
              <rect x="206" y="94" width="150" height="18" rx="9" fill="#e8bd6a" />
              <rect x="206" y="130" width="66" height="42" rx="9" fill="#ffffff" opacity=".1" />
              <rect x="282" y="130" width="66" height="42" rx="9" fill="#ffffff" opacity=".1" />
              <rect x="358" y="130" width="66" height="42" rx="9" fill="#ffffff" opacity=".1" />
              <rect x="206" y="190" width="218" height="12" rx="6" fill="#ffffff" opacity=".26" />
              <rect x="206" y="214" width="176" height="12" rx="6" fill="#ffffff" opacity=".18" />
              <rect x="164" y="262" width="326" height="14" rx="7" fill="#aeb6c6" />
            </g>
            {/* sparkles */}
            <path className="cf-spark" d="M470 150l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" />
            <path className="cf-spark" d="M118 300l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
          </svg>

          <article className="cf-note cf-note-1">
            <span className="cf-note-icon cf-tone-green">
              <IconCheck />
            </span>
            <div>
              <strong>Assignment Submitted</strong>
              <p>Your assignment has been submitted successfully.</p>
              <small>2 min ago</small>
            </div>
          </article>

          <article className="cf-note cf-note-2">
            <span className="cf-note-icon cf-tone-gold">
              <IconStar />
            </span>
            <div>
              <strong>Grade Update</strong>
              <b className="cf-note-score">98%</b>
              <p className="cf-note-score-label">Excellent</p>
              <small>Just now</small>
            </div>
          </article>

          <article className="cf-note cf-note-3">
            <span className="cf-note-icon cf-tone-blue">
              <IconMessage />
            </span>
            <div>
              <strong>Teacher Feedback</strong>
              <span className="cf-note-bar" />
              <span className="cf-note-bar cf-note-bar-short" />
              <small>3 min ago</small>
            </div>
          </article>

          <span className="cf-seal">A+</span>
        </div>
      </section>

      {/* ================= TECH STRIP ================= */}
      <section className="cf-tech" aria-label="Technology stack">
        <p className="cf-tech-label">
          Built with
          <br />
          modern technologies
        </p>
        <ul className="cf-tech-list">
          {techItems.map((item) => (
            <li key={item.label}>
              <span className="cf-tech-mark">{item.icon}</span>
              <span className="cf-tech-name">{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ================= PILLARS ================= */}
      <section className="cf-pillars">
        <h2 className="cf-rule-heading">
          <span>Built for academic excellence</span>
        </h2>

        <ol className="cf-pillar-grid">
          {pillarCards.map((card) => (
            <li className="cf-pillar" key={card.key}>
              <div className="cf-pillar-head">
                <span className={`cf-pillar-icon cf-tone-${card.key}`}>{card.icon}</span>
                <h3>{card.title}</h3>
              </div>
              <p>{card.description}</p>
              <Link href={card.href} className="cf-pillar-link">
                Learn more <IconArrow />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ================= FEATURE STRIP ================= */}
      <section className="cf-features" aria-label="Platform capabilities">
        {featureItems.map((item) => (
          <div className="cf-feature" key={item.title}>
            <span className="cf-feature-icon">{item.icon}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ======================================================================
          EVERYTHING BELOW THIS LINE IS UNCHANGED FROM THE PREVIOUS VERSION
          ====================================================================== */}

      <section className="classroom-band">
        <div className="classroom-band-inner">
          <figure className="classroom-figure">
            <img
              src="/illustrations/classroom.svg"
              alt="A teacher publishes an assignment on the class board while students submit their work from their desks"
              width={1200}
              height={520}
              loading="lazy"
            />
          </figure>
          <div className="classroom-caption">
            <span className="eyebrow">One classroom, one record</span>
            <h2>Everything a class does leaves a trail.</h2>
            <p>
              A teacher publishes to a class and subject they are actually mapped to. Enrolled students see it, submit
              an answer, and every later attempt is kept as its own version. Nothing is overwritten and nothing is
              guessed — the API decides who may do what, on every request.
            </p>
            <ul className="classroom-points">
              <li>
                <strong>Published only to the right class.</strong> Draft work stays invisible to students.
              </li>
              <li>
                <strong>Every attempt is a version.</strong> Resubmitting keeps history and asks for a fresh grade.
              </li>
              <li>
                <strong>Late is recorded, not hidden.</strong> The grace window is explicit and so is the late flag.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="role-section">
        <div className="section-heading">
          <span className="eyebrow">Role clarity</span>
          <h2>Three workspaces, one controlled workflow.</h2>
          <p>Each interface exposes only the actions that belong to the signed-in role.</p>
        </div>
        <div className="role-card-grid">
          {roleCards.map((card) => (
            <article className={`role-card role-card-${card.role.toLowerCase()}`} key={card.role}>
              <div className="role-card-head">
                <span className="role-number">{card.mark}</span>
                <span className="role-label">{card.role}</span>
              </div>

              <figure className="role-portrait">
                <img src={card.art} alt={card.alt} width={400} height={400} loading="lazy" />
              </figure>

              <h3>{card.title}</h3>
              <p>{card.description}</p>

              <ul className="role-duties">
                {card.duties.map((duty) => (
                  <li key={duty}>{duty}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="register-strip" aria-label="System at a glance">
        {registerStats.map((stat) => (
          <div className="register-cell" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
            <small>{stat.note}</small>
          </div>
        ))}
      </section>

      <section className="workflow-section" id="workflow">
        <div className="section-heading compact-heading">
          <span className="eyebrow">Evaluator walkthrough</span>
          <h2>The complete flow at a glance.</h2>
        </div>
        <div className="workflow-track">
          <div className="workflow-step">
            <span>1</span>
            <div>
              <strong>Admin prepares context</strong>
              <p>Users, class, subject, enrollment and teacher mapping.</p>
            </div>
          </div>
          <div className="workflow-step">
            <span>2</span>
            <div>
              <strong>Teacher publishes</strong>
              <p>Assignment is created from an owned active mapping.</p>
            </div>
          </div>
          <div className="workflow-step">
            <span>3</span>
            <div>
              <strong>Student submits</strong>
              <p>Eligibility and deadline rules are enforced by the API.</p>
            </div>
          </div>
          <div className="workflow-step">
            <span>4</span>
            <div>
              <strong>Teacher grades</strong>
              <p>Marks are validated against Max Marks and feedback is stored.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="closing-band">
        <div className="closing-copy">
          <h2>Sign in with a demo account and follow the whole flow.</h2>
          <p>Admin, Teacher and Student credentials are pre-filled on the login screen.</p>
        </div>
        <Link href="/login" className="btn btn-primary btn-large">
          Open the login screen
        </Link>
      </section>

      <footer className="landing-footer">
        <strong>CampusFlow</strong>
        <span>ASP.NET Core 8 • EF Core • PostgreSQL • Next.js • Docker</span>
      </footer>
    </main>
  );
}
