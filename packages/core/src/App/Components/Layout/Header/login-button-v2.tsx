import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@deriv/components';
import { localize } from '@deriv/translations';
import { champion_url } from '@deriv/shared';

interface LoginButtonV2Props {
    className?: string;
}

const LoginButtonV2 = ({ className }: LoginButtonV2Props) => {
    const handleLogin = () => {
        window.location.href = champion_url.login;
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
