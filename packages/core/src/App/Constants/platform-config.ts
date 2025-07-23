import { getPlatformSettings, routes } from '@deriv/shared';
import { localize } from '@deriv/translations';

type TPlatformConfig = {
    description: () => string;
    href?: string;
    icon: string;
    link_to?: string;
    name: string;
    title: () => string;
};

// Simplified platform config to only include trader platform
const platform_config: TPlatformConfig[] = [
    {
        icon: getPlatformSettings('trader').icon,
        title: () => getPlatformSettings('trader').name,
        name: getPlatformSettings('trader').name,
        description: () => localize('A whole new trading experience on a powerful yet easy to use platform.'),
        link_to: routes.trade,
    },
];

export default platform_config;
