import { ClerkProvider } from '@clerk/nextjs';

// ClerkProvider sits on this route group rather than the root layout, so the
// marketing pages and the admin area never load Clerk's client bundle. Inside
// <body> is required from Core 3 onwards.
export default function CustomerLayout({ children }) {
    return <ClerkProvider>{children}</ClerkProvider>;
}
