import { ClerkProvider } from '@clerk/nextjs';

// Scoped to the demo pages so the forms can tell whether someone is signed in
// before they press Run, rather than letting them fill everything in and
// bounce off a 401. The homepage and catalog stay free of Clerk's client
// bundle, which is the whole reason this is not in the root layout.
export default function TryLayout({ children }) {
    return <ClerkProvider>{children}</ClerkProvider>;
}
