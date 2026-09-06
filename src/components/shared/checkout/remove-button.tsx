'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function RemoveItemButton({
    handleRemove,
}: {
    handleRemove: () => void;
}) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="text-white/50 hover:text-rose-400 hover:bg-transparent cursor-pointer"
        >
            <Trash2 className={`h-4 w-4 `} />
        </Button>
    );
}
