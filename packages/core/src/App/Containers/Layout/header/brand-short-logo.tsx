import { StaticUrl } from '@deriv/components';
import BrandShortLogoSVG from 'Assets/SvgComponents/header/brand-short-logo.svg';

const BrandShortLogo = () => {
    return (
        <div className='header__menu-left-logo'>
            <StaticUrl href='/'>
                <BrandShortLogoSVG />
            </StaticUrl>
        </div>
    );
};

export default BrandShortLogo;
