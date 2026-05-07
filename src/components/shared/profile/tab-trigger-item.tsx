import { TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import React from 'react';

interface TabTriggerItemProps {
    value: string;
    className?: string;
    children: React.ReactNode;
}

export function TabTriggerItem({
    value,
    className,
    children,
}: TabTriggerItemProps) {
    return (
        <TabsTrigger
            value={value}
            className={cn(
                'rounded-xl data-[state=active]:bg-white h-auto md:h-10 data-[state=active]:text-black',
                'font-jane tracking-widest text-sm md:text-base py-4 md:py-0',
                className
            )}
        >
            {children}
        </TabsTrigger>
    );
}
