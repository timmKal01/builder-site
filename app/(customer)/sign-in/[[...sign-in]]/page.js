import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

export const metadata = { title: 'Sign in' };

export default function SignInPage() {
    return (
        <div className="wrap auth-screen">
            <div className="auth-screen__inner">
                <h1 className="auth-screen__title">Welcome back</h1>
                <p className="auth-screen__lede">Sign in to see what your signals have turned up.</p>
                {/* fallbackRedirectUrl rather than forceRedirectUrl: someone sent
                    here from a deep link should land back where they were going,
                    and only fall through to the dashboard when there is nowhere
                    else to return to. */}
                <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
                <p className="auth-screen__alt">
                    Not using signals yet? The <Link href="/actors">pay-per-use catalog</Link> needs no
                    account at all.
                </p>
            </div>
        </div>
    );
}
