import React from 'react';
import { Redirect as RouterRedirect } from 'react-router-dom';

import { routes } from '@deriv/shared';
import { localize } from '@deriv/translations';

import Redirect from 'App/Containers/Redirect';
import Endpoint from 'Modules/Endpoint';

import OSRedirect from '../Containers/OSRedirect';
import CallbackPage from '../../Modules/Callback/CallbackPage.tsx';

// Error Routes
const Page404 = React.lazy(() => import(/* webpackChunkName: "404" */ 'Modules/Page404'));

const Trader = React.lazy(() => import(/* webpackChunkName: "trader" */ '@deriv/trader'));

const Reports = React.lazy(() => import(/* webpackChunkName: "reports" */ '@deriv/reports'));

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
        {
            path: routes.callback_page,
            component: CallbackPage,
            is_authenticated: false,
            getTitle: () => 'Callback',
        },
    ];

    return modules;
};

// Order matters
// TODO: search tag: test-route-parent-info -> Enable test for getting route parent info when there are nested routes
const initRoutesConfig = () => [
    { path: routes.index, component: RouterRedirect, getTitle: () => '', to: routes.trade },
    { path: routes.endpoint, component: Endpoint, getTitle: () => 'Endpoint' }, // doesn't need localization as it's for internal use
    { path: routes.os_redirect, component: OSRedirect, getTitle: () => localize('Redirect') },
    { path: routes.redirect, component: Redirect, getTitle: () => localize('Redirect') },
    { path: routes.callback_page, component: CallbackPage, getTitle: () => 'Callback' },
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
