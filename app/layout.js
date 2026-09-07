import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

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
    title: 'Build Log',
    description: 'Shipping small data tools in public.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable}`}>
            <body>
                <header className="site-header">
                    <div className="site-header__row">
                        <Link href="/" className="wordmark">
                            build log
                        </Link>
                        <nav className="site-nav">
                            <Link href="/">Log</Link>
                            <Link href="/actors">Actors</Link>
                        </nav>
                    </div>
                </header>
                <main>{children}</main>
                <footer className="site-footer">
                    <div className="wrap">shipping small data tools in public</div>
                </footer>
            </body>
        </html>
    );
}
