'use client';

import { cn } from '@/lib/utils';

export function UnitsCounter({
    units,
    classWrapper,
    classUnits,
}: {
    units: number;
    classWrapper?: string;
    classUnits?: string;
}) {
    return (
        <span
            className={cn(
                'bg-gray-200 w-4 h-4 rounded-full flex items-center justify-center shadow-sm  shadow-black/90 absolute -top-2 -right-5 transition-all duration-300',
                classWrapper
            )}
        >
            <span
                className={cn(
                    'text-xs text-amber-500 text-shadow-sm transition-all duration-300',
                    classUnits
                )}
            >
                {units}
            </span>
        </span>
    );
}
