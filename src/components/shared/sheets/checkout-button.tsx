'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useLinkStatus } from 'next/link';

export function CheckoutButton() {
    const { pending } = useLinkStatus();

    return (
        <Button
            disabled={pending}
            className="w-full bg-white text-black hover:bg-white/90 rounded-full font-jane 
            transition-all duration-300
            h-14 text-xl tracking-wider disabled:opacity-100 cursor-pointer
            hover:shadow-even-md hover:text-amber-500 
            "
        >
            {pending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
                'CHECKOUT'
            )}
        </Button>
    );
}
