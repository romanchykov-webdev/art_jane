import { SignOutButton } from '@/components/shared/auth/sign-out-button';
import { UserAvatar } from '@/components/shared/user-avatar';

interface ProfileHeaderProps {
    user: {
        name: string;
        email: string;
        image: string | null;
    };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl">
            <div className="flex flex-col items-center justify-center md:flex-row gap-6">
                <UserAvatar
                    src={user.image}
                    alt={user.name}
                    isLoading={!user.image}
                />
                <div className="text-center md:text-left">
                    <h1 className="text-xl md:text-3xl font-jane tracking-widest uppercase mb-1">
                        {user.name}
                    </h1>
                    <p className="text-grey/40 font-medium">{user.email}</p>
                </div>
            </div>
            <SignOutButton />
        </div>
    );
}
