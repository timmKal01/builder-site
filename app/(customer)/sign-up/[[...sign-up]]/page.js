import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';

export const metadata = { title: 'Create an account' };

export default function SignUpPage() {
    return (
        <div className="wrap auth-screen">
            <div className="auth-screen__inner">
                <h1 className="auth-screen__title">Start free</h1>
                <p className="auth-screen__lede">
                    One saved search, run weekly, delivering only leads you have not seen before. No
                    card needed.
                </p>
                <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />
                <p className="auth-screen__alt">
                    Just want a one-off lookup? The <Link href="/actors">catalog</Link> is
                    pay-per-use with no account.
                </p>
            </div>
        </div>
    );
}
