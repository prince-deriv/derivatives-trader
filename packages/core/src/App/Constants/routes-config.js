import React from 'react';
import { Redirect as RouterRedirect } from 'react-router-dom';

import { Loading } from '@deriv/components';
import { makeLazyLoader, moduleLoader, routes } from '@deriv/shared';
import { localize } from '@deriv/translations';

import Redirect from 'App/Containers/Redirect';
import Endpoint from 'Modules/Endpoint';

import OSRedirect from '../Containers/OSRedirect';
import CallbackPage from '../../Modules/Callback/CallbackPage.tsx';

// Error Routes
const Page404 = React.lazy(() => import(/* webpackChunkName: "404" */ 'Modules/Page404'));

const Trader = React.lazy(() => import(/* webpackChunkName: "trader" */ '@deriv/trader'));

const Reports = React.lazy(() => {
    // eslint-disable-next-line import/no-unresolved
    return import(/* webpackChunkName: "reports" */ '@deriv/reports');
});

const Account = React.lazy(() =>
    moduleLoader(() => {
        // eslint-disable-next-line import/no-unresolved
        return import(/* webpackChunkName: "account" */ '@deriv/account');
    })
);

const getModules = () => {
    const modules = [
        {
            path: routes.reports,
            component: Reports,
            getTitle: () => localize('Reports'),
            icon_component: 'IcReports',
            is_authenticated: true,
            routes: [
                {
                    path: routes.positions,
                    component: Reports,
                    getTitle: () => localize('Open positions'),
                    icon_component: 'IcOpenPositions',
                    default: true,
                },
                {
                    path: routes.profit,
                    component: Reports,
                    getTitle: () => localize('Trade table'),
                    icon_component: 'IcProfitTable',
                },
                {
                    path: routes.statement,
                    component: Reports,
                    getTitle: () => localize('Statement'),
                    icon_component: 'IcStatement',
                },
            ],
        },
        {
            path: routes.account_closed,
            component: Account,
            getTitle: () => localize('Account deactivated'),
        },
        {
            path: routes.account,
            component: Account,
            getTitle: () => localize('Account settings'),
            icon_component: 'IcUserOutline',
            is_authenticated: true,
            routes: [
                {
                    getTitle: () => localize('Profile'),
                    icon: 'IcUserOutline',
                    subroutes: [
                        {
                            path: routes.personal_details,
                            component: Account,
                            getTitle: () => localize('Personal details'),
                            default: true,
                        },

                        {
                            path: routes.languages,
                            component: Account,
                            getTitle: () => localize('Languages'),
                        },
                    ],
                },
                {
                    getTitle: () => localize('Assessments'),
                    icon: 'IcAssessment',
                    subroutes: [
                        {
                            path: routes.trading_assessment,
                            component: Account,
                            getTitle: () => localize('Trading assessment'),
                        },
                        {
                            path: routes.financial_assessment,
                            component: Account,
                            getTitle: () => localize('Financial assessment'),
                        },
                    ],
                },
                {
                    getTitle: () => localize('Verification'),
                    icon: 'IcVerification',
                    subroutes: [
                        {
                            path: routes.proof_of_identity,
                            component: Account,
                            getTitle: () => localize('Proof of identity'),
                        },
                        {
                            path: routes.proof_of_address,
                            component: Account,
                            getTitle: () => localize('Proof of address'),
                        },
                        {
                            path: routes.proof_of_ownership,
                            component: Account,
                            getTitle: () => localize('Proof of ownership'),
                        },
                        {
                            path: routes.proof_of_income,
                            component: Account,
                            getTitle: () => localize('Proof of income'),
                        },
                    ],
                },
                {
                    getTitle: () => localize('Security and safety'),
                    icon: 'IcSecurity',
                    subroutes: [
                        {
                            path: routes.passwords,
                            component: Account,
                            getTitle: () => localize('Email and passwords'),
                        },
                        {
                            path: routes.passkeys,
                            component: Account,
                            getTitle: () => (
                                <>
                                    {localize('Passkeys')}
                                    <span className='dc-vertical-tab__header--new'>{localize('NEW')}!</span>
                                </>
                            ),
                        },
                        {
                            path: routes.self_exclusion,
                            component: Account,
                            getTitle: () => localize('Self-exclusion'),
                        },
                        {
                            path: routes.account_limits,
                            component: Account,
                            getTitle: () => localize('Account limits'),
                        },
                        {
                            path: routes.login_history,
                            component: Account,
                            getTitle: () => localize('Login history'),
                        },
                        {
                            path: routes.api_token,
                            component: Account,
                            getTitle: () => localize('API token'),
                        },
                        {
                            path: routes.connected_apps,
                            component: Account,
                            getTitle: () => localize('Connected apps'),
                        },
                        {
                            path: routes.two_factor_authentication,
                            component: Account,
                            getTitle: () => localize('Two-factor authentication'),
                        },
                        {
                            path: routes.closing_account,
                            component: Account,
                            getTitle: () => localize('Close your account'),
                        },
                    ],
                },
            ],
        },
        {
            path: routes.trade,
            component: Trader,
            getTitle: () => localize('Trader'),
        },
        {
            path: routes.contract,
            component: Trader,
            getTitle: () => localize('Contract Details'),
            is_authenticated: true,
        },
        // Trader's Hub no longer exists, trade is now the root path
        // {
        //     path: routes.traders_hub,
        //     component: Trader,
        //     is_authenticated: false,
        //     getTitle: () => localize("Trader's Hub"),
        // },
        {
            path: routes.callback_page,
            component: CallbackPage,
            is_authenticated: false,
            getTitle: () => 'Callback',
        },
    ];

    return modules;
};

const lazyLoadComplaintsPolicy = makeLazyLoader(
    () => moduleLoader(() => import(/* webpackChunkName: "complaints-policy" */ 'Modules/ComplaintsPolicy')),
    () => <Loading />
);

// Order matters
// TODO: search tag: test-route-parent-info -> Enable test for getting route parent info when there are nested routes
const initRoutesConfig = () => [
    { path: routes.index, component: RouterRedirect, getTitle: () => '', to: routes.trade },
    { path: routes.endpoint, component: Endpoint, getTitle: () => 'Endpoint' }, // doesn't need localization as it's for internal use
    { path: routes.os_redirect, component: OSRedirect, getTitle: () => localize('Redirect') },
    { path: routes.redirect, component: Redirect, getTitle: () => localize('Redirect') },
    { path: routes.callback_page, component: CallbackPage, getTitle: () => 'Callback' },
    {
        path: routes.complaints_policy,
        component: lazyLoadComplaintsPolicy(),
        getTitle: () => localize('Complaints policy'),
        icon_component: 'IcComplaintsPolicy',
        is_authenticated: true,
    },
    ...getModules(),
];

let routesConfig;

// For default page route if page/path is not found, must be kept at the end of routes_config array
const route_default = { component: Page404, getTitle: () => localize('Error 404') };

const getRoutesConfig = () => {
    if (!routesConfig) {
        routesConfig = initRoutesConfig();
        routesConfig.push(route_default);
    }
    return routesConfig;
};

export default getRoutesConfig;
