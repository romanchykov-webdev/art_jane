import React from 'react';

interface EmptyTabStateProps {
    icon: React.ReactNode;
    text: string;
}

export function EmptyTabState({ icon, text }: EmptyTabStateProps) {
    return (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center">
            {icon}
            <p className="text-white/40 uppercase tracking-widest text-shadow-md mt-4">
                {text}
            </p>
        </div>
    );
}
