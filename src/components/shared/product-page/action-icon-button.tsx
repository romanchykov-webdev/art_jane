import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionIconButtonProps {
    icon: LucideIcon;
    active: boolean;
    onClick: (e?: React.MouseEvent) => void;
    disabled?: boolean;
}

export function ActionIconButton({
    icon: Icon,
    active,
    onClick,
    disabled,
}: ActionIconButtonProps) {
    return (
        <Button
            variant="destructive"
            onClick={onClick}
            // disabled={disabled}
            aria-disabled={disabled}
            aria-pressed={active}
            className="flex-1  rounded-none py-6 uppercase tracking-widest text-xs cursor-pointer
                transition-all duration-300 active:scale-[0.98] border-none font-jane group"
        >
            <Icon
                className={`size-10 transition-colors duration-300 ${
                    active
                        ? 'text-black fill-black'
                        : 'text-black fill-transparent group-hover:fill-black/20'
                }`}
            />
        </Button>
    );
}
