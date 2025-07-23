export const routes = {
    // Essential routes
    callback_page: '/callback',
    error404: '/404',
    index: '/index',
    redirect: '/redirect',
    endpoint: '/endpoint',

    // Trading routes
    trade: '/',
    trader_positions: '/positions',
    contract: '/contract/:contract_id',

    // Reports routes
    reports: '/reports',
    positions: '/reports/positions',
    profit: '/reports/profit',
    statement: '/reports/statement',

    // Utility routes
    os_redirect: '/os-redirect',
};

export const DISABLE_LANDSCAPE_BLOCKER_ROUTES = [
    routes.trade,
    routes.reports,
    routes.endpoint,
    /** because contract route has dynamic id */
    '/contract',
];

export const isDisabledLandscapeBlockerRoute = (path: string) => {
    // Root path is now the trade page
    if (path === '/') return true;
    return DISABLE_LANDSCAPE_BLOCKER_ROUTES.some(route => path.startsWith(route));
};
