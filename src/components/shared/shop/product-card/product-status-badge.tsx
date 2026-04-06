import { Badge } from '@/components/ui/badge';
import { ProductStatus } from '@/generated/prisma';
import { cn } from '@/lib/utils';
import React, { JSX } from 'react';

interface Props {
    isAvailable: boolean;
    classBage?: string;
    status: ProductStatus;
}

export const ProductStatusBadge: React.FC<Props> = ({
    isAvailable,
    classBage,
    status,
}): JSX.Element => {
    // console.log({ status });

    return (
        <>
            {!isAvailable && (
                <Badge
                    variant="destructive"
                    className={cn(
                        'absolute left-0 top-0 z-10 uppercase bg-amber-500 text-white text-shadow-sm  w-10 h-10 rounded-none rounded-br-lg px-10 font-jane shadow-sm shadow-black/90',
                        classBage
                    )}
                >
                    {status.replace('_', ' ')}
                </Badge>
            )}
        </>
    );
};
