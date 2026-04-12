import { cn } from '@/lib/utils';

interface CountBadgeProps {
    count: number;
    className?: string;
}

export function CountBadge({ count, className }: CountBadgeProps) {
    if (count <= 0) return null;

    return (
        <span
            className={cn(
                'absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black shadow-even-sm',
                className
            )}
        >
            {count}
        </span>
    );
}
