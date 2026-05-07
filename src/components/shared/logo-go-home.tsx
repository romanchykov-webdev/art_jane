import { cn } from '@/lib/utils';
import { ButtonGoHome } from './button-go-home';
import { Logo } from './logo';

interface LogoGoHomeProps {
    classNameWrapper?: string;
    classNameButtonGoHome?: string;
    classNameLogo?: string;
    sizeIconButtonGoHome?: 'sm' | 'md' | 'lg';
    sizeLogo?: 'sm' | 'md' | 'lg';
}

export function LogoGoHome({
    classNameWrapper,
    sizeLogo = 'lg',
    sizeIconButtonGoHome = 'lg',
    classNameButtonGoHome,
    classNameLogo,
}: LogoGoHomeProps) {
    return (
        <div
            className={cn('flex item-center justify-between', classNameWrapper)}
        >
            <ButtonGoHome
                className={classNameButtonGoHome}
                size={sizeIconButtonGoHome}
            />
            <Logo className={classNameLogo} size={sizeLogo} />
        </div>
    );
}
