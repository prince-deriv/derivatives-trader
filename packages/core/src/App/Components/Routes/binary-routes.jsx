import React from 'react';
import { Switch, Prompt, useLocation, Redirect } from 'react-router-dom';
import { Loading } from '@deriv/components';
import getRoutesConfig from 'App/Constants/routes-config';
import RouteWithSubRoutes from './route-with-sub-routes.jsx';
import { observer, useStore } from '@deriv/stores';
import { getPositionsV2TabIndexFromURL, routes } from '@deriv/shared';
import { useDtraderV2Flag } from '@deriv/hooks';

// List of route patterns that have been removed
const REMOVED_ROUTE_PATTERNS = [
    /^\/account\/.*/,
    /^\/settings\/.*/,
    /^\/mt5\/.*/,
    /^\/derivx\/.*/,
    /^\/bot\/.*/,
    /^\/account-closed\/?$/,
    /^\/complaints-policy\/?$/,
    /^\/onboarding\/?$/,
    /^\/cfd-compare-accounts\/?$/,
];

// Component to handle redirects for removed routes
const RemovedRoutesRedirect = () => {
    const location = useLocation();

    // Check if current location matches any removed route pattern
    const is_removed_route = REMOVED_ROUTE_PATTERNS.some(pattern => pattern.test(location.pathname));

    // Redirect to trade page if accessing a removed route
    if (is_removed_route) {
        return <Redirect to={routes.trade} />;
    }

    return null;
};

const BinaryRoutes = observer(props => {
    const { ui, gtm } = useStore();
    const { promptFn, prompt_when } = ui;
    const { pushDataLayer } = gtm;
    const location = useLocation();
    const { dtrader_v2_enabled_mobile, dtrader_v2_enabled_desktop } = useDtraderV2Flag();

    React.useEffect(() => {
        pushDataLayer({ event: 'page_load' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    const getLoader = () => {
        if (dtrader_v2_enabled_mobile || dtrader_v2_enabled_desktop)
            return (
                <Loading.DTraderV2
                    initial_app_loading
                    is_contract_details={location.pathname.startsWith('/contract/')}
                    is_positions={location.pathname === routes.trader_positions}
                    is_closed_tab={getPositionsV2TabIndexFromURL() === 1}
                />
            );
        return <Loading />;
    };

    return (
        <React.Suspense fallback={getLoader()}>
            <Prompt when={prompt_when} message={promptFn} />
            <RemovedRoutesRedirect />
            <Switch>
                {getRoutesConfig().map((route, idx) => (
                    <RouteWithSubRoutes key={idx} {...route} {...props} />
                ))}
            </Switch>
        </React.Suspense>
    );
});

export default BinaryRoutes;
