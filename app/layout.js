import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
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

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
    variable: '--font-space-grotesk',
});

const plexSans = IBM_Plex_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-plex-sans',
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

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className={`${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable}`}
            suppressHydrationWarning
        >
            <head>
                {/* Sets data-theme and the .js class before paint — see THEME_INIT_SCRIPT above. */}
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(SITE_SCHEMA)} />
            </head>
            <body>
                <header className="site-header">
                    <div className="site-header__row">
                        <Link href="/" className="wordmark">
                            {SITE_NAME}
                        </Link>
                        <nav className="site-nav">
                            <Link href="/log">Log</Link>
                            <Link href="/actors">Actors</Link>
                        </nav>
                        <ThemeToggle />
                    </div>
                </header>
                <main>{children}</main>
                <footer className="site-footer">
                    <div className="wrap site-footer__top">
                        <span>public records in, clean JSON out</span>
                        <div className="site-footer__social">
                            {SOCIAL_LINKS.devto && (
                                <a href={SOCIAL_LINKS.devto} target="_blank" rel="noreferrer" aria-label="dev.to">
                                    {DevToIcon}
                                </a>
                            )}
                            {SOCIAL_LINKS.discord && (
                                <a href={SOCIAL_LINKS.discord} target="_blank" rel="noreferrer" aria-label="Discord">
                                    {DiscordIcon}
                                </a>
                            )}
                            {SOCIAL_LINKS.github && (
                                <a href={SOCIAL_LINKS.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                                    {GithubIcon}
                                </a>
                            )}
                            {SOCIAL_LINKS.x && (
                                <a href={SOCIAL_LINKS.x} target="_blank" rel="noreferrer" aria-label="X">
                                    {XIcon}
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="wrap site-footer__copyright">&copy; 2026 Timothy Kalungu. All rights reserved.</div>
                </footer>
                <ScrollReveal />
            </body>
        </html>
    );
}
