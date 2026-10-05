import { SignUp } from '@clerk/nextjs';

export const metadata = { title: 'Create an account' };

export default function SignUpPage() {
    return (
        <div className="wrap auth-screen">
            <SignUp />
        </div>
    );
}
