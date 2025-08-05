import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@deriv/components';
import { getDomainUrl, isStaging } from '@deriv/shared';
import { localize } from '@deriv/translations';

const LoginButtonV2 = ({ className }) => {
    const handleLogin = () => {
        const hubUrl = isStaging()
            ? `https://staging-hub.${getDomainUrl()}/champion/login`
            : `https://dev-hub.${getDomainUrl()}/champion/login`;

        window.location.href = hubUrl;
    };

    return (
        <Button
            id='dt_login_button_v2'
            className={className}
            has_effect
            text={localize('Log in')}
            onClick={handleLogin}
            primary
        />
    );
};

LoginButtonV2.propTypes = {
    className: PropTypes.string,
};

export { LoginButtonV2 };
