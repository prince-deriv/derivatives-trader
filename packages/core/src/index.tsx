/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
import ReactDOM from 'react-dom';
import React from 'react';
import 'promise-polyfill';
// eslint-disable-next-line
import registerServiceWorker from 'Utils/pwa';
import initStore from 'App/initStore';
import App from 'App/app.jsx';
import { checkAndSetEndpointFromUrl } from '@deriv/shared';
import AppNotificationMessages from './App/Containers/app-notification-messages.jsx';
import { AnalyticsInitializer } from 'Utils/Analytics';
import { isTmbEnabled } from '@deriv/utils';
import './temp-auth'; // Temporary: Authentication flow

AnalyticsInitializer();
if (
    !!window?.localStorage.getItem?.('debug_service_worker') || // To enable local service worker related development
    (!window.location.hostname.startsWith('localhost') && !/binary\.sx/.test(window.location.hostname)) ||
    window.location.hostname === 'deriv-app.binary.sx'
) {
    registerServiceWorker();
}

const has_endpoint_url = checkAndSetEndpointFromUrl();

// if has endpoint url, APP will be redirected
if (!has_endpoint_url) {
    const initApp = async () => {
        const is_tmb_enabled = await isTmbEnabled();
        // For simplified authentication, we don't need to pass accounts to initStore
        // The authentication will be handled by temp-auth.js and client-store.js
        const root_store = initStore(AppNotificationMessages);

        const wrapper = document.getElementById('deriv_app');
        if (wrapper) {
            ReactDOM.render(<App useSuspense={false} root_store={root_store} />, wrapper);
        }
    };

    initApp();
}
