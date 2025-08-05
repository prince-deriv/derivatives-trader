import React from 'react';
import { Icon, Text } from '@deriv/components';
import { getDomainUrl } from '@deriv/shared';
import { observer } from '@deriv/stores';
import { Localize } from '@deriv/translations';

const HubButton = observer(() => {
    const handleHubRedirect = () => {
        const PRODUCTION_HUB_URL = `https://hub.${getDomainUrl()}/champion/`;
        const STAGING_HUB_URL = `https://dev-hub.${getDomainUrl()}/champion/`;
        const hubUrl = process.env.NODE_ENV === 'production' ? PRODUCTION_HUB_URL : STAGING_HUB_URL;

        window.open(hubUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div data-testid='dt_hub_button' className='header__menu-link' onClick={handleHubRedirect}>
            <Text size='m' line_height='xs' title='Hub' className='header__menu-link-text'>
                <Icon icon='IcAppstoreTradersHubHome' className='header__icon' />
                <Localize i18n_default_text='Hub' />
            </Text>
        </div>
    );
});

export default HubButton;
