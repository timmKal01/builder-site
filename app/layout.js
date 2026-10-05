import { Figtree, IBM_Plex_Mono } from 'next/font/google';
import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal.js';
import ThemeToggle from '@/components/ThemeToggle.js';
import { DevToIcon, DiscordIcon, GithubIcon, XIcon } from '@/components/SocialIcons.js';
import { SOCIAL_LINKS } from '@/lib/social.js';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, jsonLd } from '@/lib/site.js';
import './globals.css';

// Runs synchronously in <head>, before first paint, so there's no flash of
// the wrong theme: picks up a stored choice, else the OS preference.
const THEME_INIT_SCRIPT = `
(function () {
    try {
        var stored = localStorage.getItem('theme');
        var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    document.documentElement.classList.add('js');
})();
`;

// Figtree is a variable font (300-900), so the whole weight range comes from a
// single file. Asking for discrete weights instead makes next/font resolve five
// separate URLs, which is what broke the Vercel build.
const figtree = Figtree({
    subsets: ['latin'],
    variable: '--font-figtree',
    display: 'swap',
});

const plexMono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-plex-mono',
});

export const metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: SITE_TITLE,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    openGraph: { siteName: SITE_NAME, type: 'website', locale: 'en_US' },
    twitter: { card: 'summary_large_image' },
    verification: {
        google: 'dGGzJEEr_kn7zjWhnwxny0qVfvTpLp3EE_3jUPhC4pg',
    },
};

const SITE_SCHEMA = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#org`,
            name: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/icon.png`,
            sameAs: Object.values(SOCIAL_LINKS).filter(Boolean),
        },
        {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            publisher: { '@id': `${SITE_URL}/#org` },
        },
    ],
};

const MARK = (
    <svg
        viewBox="0 0 24 24"
        width="17"
        height="17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M2 7.5c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2.4 5-1.2" />
        <path d="M2 13c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2.4 5-1.2" />
        <path d="M2 18.5c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2.4 5-1.2" />
    </svg>
);

function Wordmark() {
    return (
        <Link href="/" className="wordmark">
            <span className="wordmark__mark" aria-hidden="true">
                {MARK}
            </span>
            {SITE_NAME}
        </Link>
    );
}

const FOOTER_SOCIAL = [
    ['devto', 'dev.to', DevToIcon],
    ['discord', 'Discord', DiscordIcon],
    ['github', 'GitHub', GithubIcon],
    ['x', 'X', XIcon],
];

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${figtree.variable} ${plexMono.variable}`} suppressHydrationWarning>
            <head>
                {/* Sets data-theme and the .js class before paint — see THEME_INIT_SCRIPT above. */}
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(SITE_SCHEMA)} />
            </head>
            <body>
                <header className="site-header">
                    <div className="site-header__row">
                        <Wordmark />
                        <nav className="site-nav">
                            <Link href="/signals">Signals</Link>
                            <Link href="/actors">Catalog</Link>
                            <Link href="/#pricing">Pricing</Link>
                            <Link href="/log">Build log</Link>
                        </nav>
                        <div className="site-header__actions">
                            <ThemeToggle />
                            {/* Always rendered signed-out, rather than reading the session
                                here. Showing "Dashboard" to a signed-in visitor would mean
                                running Clerk's middleware on every marketing request for a
                                cosmetic label, and these pages are the ones that have to stay
                                fast. A signed-in visitor who clicks Sign in is sent straight
                                on to their dashboard by Clerk, so the behaviour is right
                                either way. */}
                            <Link href="/sign-in" className="site-header__signin">
                                Sign in
                            </Link>
                            <Link href="/sign-up" className="cta-btn cta-btn--primary cta-btn--sm cta-btn--nav">
                                <span className="cta-btn__long">Start free</span>
                                <span className="cta-btn__short">Start</span>
                            </Link>
                        </div>
                    </div>
                </header>
                <main>{children}</main>
                <footer className="site-footer">
                    <div className="wrap">
                        <div className="site-footer__grid">
                            <div className="site-footer__brand">
                                <Wordmark />
                                <p className="site-footer__blurb">
                                    Public records in, clean JSON out. Pay-per-use data APIs built on
                                    official sources, with the code for every one of them in the open.
                                </p>
                                <div className="site-footer__social">
                                    {FOOTER_SOCIAL.map(([key, label, icon]) =>
                                        SOCIAL_LINKS[key] ? (
                                            <a
                                                key={key}
                                                href={SOCIAL_LINKS[key]}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={label}
                                            >
                                                {icon}
                                            </a>
                                        ) : null
                                    )}
                                </div>
                            </div>

                            <div>
                                <h2 className="site-footer__col-title">Explore</h2>
                                <ul className="site-footer__links">
                                    <li>
                                        <Link href="/signals">Lead signals</Link>
                                    </li>
                                    <li>
                                        <Link href="/actors">Full catalog</Link>
                                    </li>
                                    <li>
                                        <Link href="/#how">How it works</Link>
                                    </li>
                                    <li>
                                        <Link href="/#pricing">What it costs</Link>
                                    </li>
                                    <li>
                                        <Link href="/#faq">FAQ</Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="site-footer__col-title">Build log</h2>
                                <ul className="site-footer__links">
                                    <li>
                                        <Link href="/log">Latest entries</Link>
                                    </li>
                                    {SOCIAL_LINKS.devto && (
                                        <li>
                                            <a href={SOCIAL_LINKS.devto} target="_blank" rel="noreferrer">
                                                Writing on dev.to
                                            </a>
                                        </li>
                                    )}
                                    {SOCIAL_LINKS.x && (
                                        <li>
                                            <a href={SOCIAL_LINKS.x} target="_blank" rel="noreferrer">
                                                Updates on X
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div>
                                <h2 className="site-footer__col-title">Source</h2>
                                <ul className="site-footer__links">
                                    {SOCIAL_LINKS.github && (
                                        <li>
                                            <a href={SOCIAL_LINKS.github} target="_blank" rel="noreferrer">
                                                GitHub
                                            </a>
                                        </li>
                                    )}
                                    <li>
                                        <a href="https://apify.com/m_ctim" target="_blank" rel="noreferrer">
                                            Apify Store
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="site-footer__bottom">
                            <span>&copy; 2026 Timothy Kalungu. All rights reserved.</span>
                            <span>Built on public data. No proxies, no logins.</span>
                        </div>
                    </div>
                </footer>
                <ScrollReveal />
            </body>
        </html>
    );
}
