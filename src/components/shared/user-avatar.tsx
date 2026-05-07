import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon } from 'lucide-react';
import Image from 'next/image';

interface UserAvatarProps {
    src?: string | null;
    alt?: string;
    isLoading?: boolean;
}

export function UserAvatar({
    src,
    alt = 'User avatar',
    isLoading = false,
}: UserAvatarProps) {
    if (isLoading) {
        return <Skeleton className="w-20 h-20 rounded-full" />;
    }

    return (
        <div
            className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/30 
                       flex items-center justify-center overflow-hidden shadow-even-md "
        >
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover rounded-full"
                />
            ) : (
                <UserIcon className="w-10 h-10 text-amber-500" />
            )}
        </div>
    );
}
