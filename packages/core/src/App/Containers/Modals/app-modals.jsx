import React from 'react';
import { useLocation } from 'react-router-dom';

import { useIsTNCNeeded } from '@deriv/hooks';
import { ContentFlag, moduleLoader, SessionStore } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';

import DerivRealAccountRequiredModal from 'App/Components/Elements/Modals/deriv-real-account-required-modal.jsx';
import RedirectNoticeModal from 'App/Components/Elements/Modals/RedirectNotice';

import ReadyToDepositModal from './ready-to-deposit-modal';

const UrlUnavailableModal = React.lazy(() =>
    moduleLoader(() => import(/* webpackChunkName: "url-unavailable-modal" */ '../UrlUnavailableModal'))
);

const RedirectToLoginModal = React.lazy(() =>
    moduleLoader(() => import(/* webpackChunkName: "reset-password-modal" */ '../RedirectToLoginModal'))
);

const AppModals = observer(() => {
    const { client, ui, traders_hub } = useStore();
    const { is_authorize, is_logged_in, fetchFinancialAssessment, setCFDScore } = client;
    const { content_flag } = traders_hub;
    const {
        is_deriv_account_needed_modal_visible,
        is_ready_to_deposit_modal_visible,
        isUrlUnavailableModalVisible,
        toggleTncUpdateModal,
    } = ui;
    const temp_session_signup_params = SessionStore.get('signup_query_param');
    const url_params = new URLSearchParams(useLocation().search || temp_session_signup_params);
    const url_action_param = url_params.get('action');

    const is_eu_user = [ContentFlag.LOW_RISK_CR_EU, ContentFlag.EU_REAL, ContentFlag.EU_DEMO].includes(content_flag);

    const is_tnc_needed = useIsTNCNeeded();

    React.useEffect(() => {
        if (is_tnc_needed) {
            toggleTncUpdateModal(true);
        }
    }, [is_tnc_needed, toggleTncUpdateModal]);

    React.useEffect(() => {
        if (is_logged_in && is_authorize) {
            fetchFinancialAssessment().then(response => {
                setCFDScore(response?.cfd_score ?? 0);
            });
        }
    }, [is_logged_in, is_authorize]);

    let ComponentToLoad = null;
    switch (url_action_param) {
        case 'redirect_to_login':
            ComponentToLoad = <RedirectToLoginModal />;
            break;
        default:
            break;
    }
    if (!url_action_param) {
        if (is_deriv_account_needed_modal_visible) {
            ComponentToLoad = <DerivRealAccountRequiredModal />;
        } else if (isUrlUnavailableModalVisible) {
            ComponentToLoad = <UrlUnavailableModal />;
        }

        if (is_ready_to_deposit_modal_visible) {
            ComponentToLoad = <ReadyToDepositModal />;
        }
    }

    return (
        <>
            <RedirectNoticeModal is_logged_in={is_logged_in} is_eu={is_eu_user} portal_id='popup_root' />
            {ComponentToLoad ? <React.Suspense fallback={<div />}>{ComponentToLoad}</React.Suspense> : null}
        </>
    );
});

export default AppModals;
