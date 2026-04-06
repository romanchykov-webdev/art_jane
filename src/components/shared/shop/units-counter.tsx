'use client';

import { cn } from '@/lib/utils';
interface UnitsCounterProps {
    units: number;
    classWrapper?: string;
    classUnits?: string;
}

export function UnitsCounter({
    units,
    classWrapper,
    classUnits,
}: UnitsCounterProps) {
    return (
        <span
            className={cn(
                'bg-gray-200 w-4 h-4 rounded-full flex items-center justify-center shadow-sm  shadow-black/90 absolute -top-2 -right-5 transition-all duration-300',
                classWrapper
            )}
        >
            <span
                className={cn(
                    'text-xs text-amber-500 text-shadow-sm transition-all duration-300 font-jane',
                    classUnits
                )}
            >
                {units}
            </span>
        </span>
    );
}
