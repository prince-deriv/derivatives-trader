import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import classNames from 'classnames';

import { useRemoteConfig, useAccountSettingsRedirect, useIsHubRedirectionEnabled, useOauth2 } from '@deriv/api';
import { Div100vhContainer, Icon, MobileDrawer, ToggleSwitch } from '@deriv/components';
import { getDomainUrl, getOSNameWithUAParser, getStaticUrl, routes } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { localize } from '@deriv/translations';
import { Analytics } from '@deriv-com/analytics';

import LiveChat from 'App/Components/Elements/LiveChat';
import WhatsApp from 'App/Components/Elements/WhatsApp';
import NetworkStatus from 'App/Components/Layout/Footer';
import getRoutesConfig from 'App/Constants/routes-config';
import ServerTime from 'App/Containers/server-time.jsx';

import { MenuTitle, MobileLanguageMenu } from './Components/ToggleMenu';
import MenuLink from './menu-link';

const ToggleMenuDrawer = observer(() => {
    const { ui, client, traders_hub } = useStore();
    const {
        disableApp,
        enableApp,
        is_mobile,
        is_mobile_language_menu_open,
        is_dark_mode_on: is_dark_mode,
        setDarkMode: toggleTheme,
        setMobileLanguageMenuOpen,
        setIsForcedToExitPnv,
    } = ui;
    const {
        account_status,
        has_wallet,
        is_logged_in,
        is_virtual,
        logout: logoutClient,
        setIsLoggingOut,
        should_allow_authentication,
        should_allow_poinc_authentication,
        landing_company_shortcode: active_account_landing_company,
        is_proof_of_ownership_enabled,
        is_eu,
        is_passkey_supported,
    } = client;
    const { show_eu_related_content } = traders_hub;
    const { mobile_redirect_url } = useAccountSettingsRedirect();

    const { pathname: route } = useLocation();

    const is_trading_hub_category = route === routes.trade || route.startsWith(routes.account);

    const should_show_regulatory_information = is_eu && show_eu_related_content && !is_virtual;
    const is_traders_hub_route = route === routes.trade;

    const is_wallet_route = route.startsWith(routes.wallets) || route.startsWith(routes.wallets_compare_accounts);

    const { data } = useRemoteConfig(true);
    const { cs_chat_livechat, cs_chat_whatsapp } = data;

    const [is_open, setIsOpen] = React.useState(false);
    const [transitionExit, setTransitionExit] = React.useState(false);
    const [primary_routes_config, setPrimaryRoutesConfig] = React.useState([]);
    const [, expandSubMenu] = React.useState(false);

    const timeout = React.useRef();
    const history = useHistory();
    const { isHubRedirectionEnabled } = useIsHubRedirectionEnabled();

    // Cleanup timeout on unmount or route change
    React.useEffect(() => {
        return () => {
            if (timeout.current) {
                clearTimeout(timeout.current);
                setTransitionExit(false);
                setIsOpen(false);
            }
        };
    }, [route]);

    React.useEffect(() => {
        const processRoutes = () => {
            const routes_config = getRoutesConfig();
            let primary_routes = [];

            if (is_trading_hub_category) {
                primary_routes = has_wallet ? [routes.reports, routes.account] : [routes.account];
            }
            setPrimaryRoutesConfig(getFilteredRoutesConfig(routes_config, primary_routes));
        };

        if (account_status || should_allow_authentication) {
            processRoutes();
        }

        return () => clearTimeout(timeout.current);
    }, [
        account_status,
        should_allow_authentication,
        has_wallet,
        is_trading_hub_category,
        is_mobile,
        is_passkey_supported,
    ]);

    const toggleDrawer = React.useCallback(() => {
        if (is_mobile_language_menu_open) setMobileLanguageMenuOpen(false);
        if (!is_open) setIsOpen(!is_open);
        else {
            setTransitionExit(true);
            timeout.current = setTimeout(() => {
                setIsOpen(false);
                setTransitionExit(false);
            }, 400);
        }
        expandSubMenu(false);
    }, [expandSubMenu, is_open, is_mobile_language_menu_open, setMobileLanguageMenuOpen]);

    const handleLogout = React.useCallback(async () => {
        setIsLoggingOut(true);
        toggleDrawer();
        if (window.location.pathname.startsWith(routes.phone_verification)) {
            setIsForcedToExitPnv(true);
            // Add a small delay to ensure state is updated before navigation because adding await doesn't work here
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        history.push(routes.trade);
        await logoutClient();
    }, [history, logoutClient, toggleDrawer]);

    const { oAuthLogout } = useOauth2({ handleLogout });

    const passkeysMenuOpenActionEventTrack = React.useCallback(() => {
        Analytics.trackEvent('ce_passkey_account_settings_form', {
            action: 'open',
            form_name: 'ce_passkey_account_settings_form',
            operating_system: getOSNameWithUAParser(),
        });
    }, []);

    const getFilteredRoutesConfig = (all_routes_config, routes_to_filter) => {
        const subroutes_config = all_routes_config.flatMap(i => i.routes || []);

        return routes_to_filter
            .map(path => all_routes_config.find(r => r.path === path) || subroutes_config.find(r => r.path === path))
            .filter(route => route);
    };

    const getRoutesWithSubMenu = (route_config, idx) => {
        const has_access = route_config.is_authenticated ? is_logged_in : true;
        if (!has_access) return null;

        if (route_config.path === routes.account && mobile_redirect_url !== routes.account) {
            return (
                <MobileDrawer.Item key={idx}>
                    <MenuLink
                        link_to={mobile_redirect_url}
                        icon={route_config.icon_component}
                        text={route_config.getTitle()}
                        onClickLink={toggleDrawer}
                    />
                </MobileDrawer.Item>
            );
        }

        if (!route_config.routes) {
            return (
                <MobileDrawer.Item key={idx}>
                    <MenuLink
                        link_to={route_config.path}
                        icon={route_config.icon_component}
                        text={route_config.getTitle()}
                        onClickLink={toggleDrawer}
                    />
                </MobileDrawer.Item>
            );
        }

        const has_subroutes = route_config.routes.some(route => route.subroutes);
        const should_hide_passkeys_route = !is_mobile || !is_passkey_supported;

        const disableRoute = route_path => {
            if (/financial-assessment/.test(route_path)) {
                return is_virtual;
            } else if (/trading-assessment/.test(route_path)) {
                return is_virtual || active_account_landing_company !== 'maltainvest';
            } else if (/proof-of-address/.test(route_path) || /proof-of-identity/.test(route_path)) {
                return !should_allow_authentication;
            } else if (/proof-of-income/.test(route_path)) {
                return !should_allow_poinc_authentication;
            } else if (/proof-of-ownership/.test(route_path)) {
                return is_virtual || !is_proof_of_ownership_enabled;
            }
            return false;
        };

        const hideRoute = route_path => {
            if (/passkeys/.test(route_path)) {
                return should_hide_passkeys_route;
            } else if (/languages/.test(route_path)) {
                return has_wallet;
            }
            return false;
        };

        return (
            <MobileDrawer.SubMenu
                key={idx}
                has_subheader
                submenu_icon={route_config.icon_component}
                submenu_title={route_config.getTitle()}
                submenu_suffix_icon='IcChevronRight'
                onToggle={expandSubMenu}
                route_config_path={route_config.path}
            >
                {has_subroutes &&
                    route_config.routes.map((route, index) => {
                        return route.subroutes ? (
                            <MobileDrawer.SubMenuSection
                                key={index}
                                section_icon={route.icon}
                                section_title={route.getTitle()}
                            >
                                {route.subroutes.map((subroute, subindex) => (
                                    <MenuLink
                                        key={subindex}
                                        is_disabled={disableRoute(subroute.path) || subroute.is_disabled}
                                        link_to={subroute.path}
                                        text={subroute.getTitle()}
                                        onClickLink={() => {
                                            toggleDrawer();
                                            if (subroute.path === routes.passkeys) {
                                                passkeysMenuOpenActionEventTrack();
                                            }
                                        }}
                                        is_hidden={hideRoute(subroute.path)}
                                    />
                                ))}
                            </MobileDrawer.SubMenuSection>
                        ) : (
                            <MobileDrawer.Item key={index}>
                                <MenuLink
                                    link_to={route.path}
                                    icon={route.icon_component}
                                    text={route.getTitle()}
                                    onClickLink={toggleDrawer}
                                />
                            </MobileDrawer.Item>
                        );
                    })}
            </MobileDrawer.SubMenu>
        );
    };

    const HelpCentreRoute = has_border_bottom => {
        return (
            <MobileDrawer.Item className={classNames({ 'header__menu-mobile-theme': has_border_bottom })}>
                <MenuLink
                    link_to={getStaticUrl('/help-centre')}
                    icon='IcHelpCentre'
                    text={localize('Help centre')}
                    onClickLink={toggleDrawer}
                />
            </MobileDrawer.Item>
        );
    };

    const handleTradershubRedirect = () => {
        if (isHubRedirectionEnabled && has_wallet) {
            const PRODUCTION_REDIRECT_URL = `https://hub.${getDomainUrl()}/tradershub`;
            const STAGING_REDIRECT_URL = `https://staging-hub.${getDomainUrl()}/tradershub`;
            const redirectUrl = process.env.NODE_ENV === 'production' ? PRODUCTION_REDIRECT_URL : STAGING_REDIRECT_URL;

            const url_query_string = window.location.search;
            const url_params = new URLSearchParams(url_query_string);
            const account_currency = url_params.get('account') || window.sessionStorage.getItem('account');

            return `${redirectUrl}/redirect?action=redirect_to&redirect_to=home${account_currency ? `&account=${account_currency}` : ''}`;
        }
        return routes.trade;
    };

    return (
        <React.Fragment>
            <a id='dt_mobile_drawer_toggle' onClick={toggleDrawer} className='header__mobile-drawer-toggle'>
                <Icon icon='IcHamburger' width='16px' height='16px' className='header__mobile-drawer-icon' />
            </a>
            <MobileDrawer
                alignment='left'
                icon_class='header__menu-toggle'
                is_open={is_open}
                transitionExit={transitionExit}
                toggle={toggleDrawer}
                id='dt_mobile_drawer'
                enableApp={enableApp}
                disableApp={disableApp}
                title={<MenuTitle />}
                height='100vh'
                width='295px'
                className='pre-appstore'
            >
                <Div100vhContainer height_offset='40px'>
                    <div className='header__menu-mobile-body-wrapper'>
                        <React.Fragment>
                            <MobileDrawer.Body className={is_traders_hub_route || is_wallet_route ? 'no-padding' : ''}>
                                <MobileDrawer.Item>
                                    <MenuLink
                                        link_to={getStaticUrl('/')}
                                        icon='IcBrandShortLogo'
                                        text='Deriv.com'
                                        onClickLink={toggleDrawer}
                                    />
                                </MobileDrawer.Item>
                                <MobileDrawer.Item>
                                    <MenuLink
                                        link_to={handleTradershubRedirect()}
                                        icon={'IcAppstoreTradersHubHome'}
                                        text={localize("Trader's Hub")}
                                        onClickLink={toggleDrawer}
                                        is_active={route === routes.trade}
                                    />
                                </MobileDrawer.Item>
                                {route !== routes.trade && (
                                    <MobileDrawer.Item>
                                        <MenuLink
                                            link_to={routes.trade}
                                            icon='IcTrade'
                                            text={localize('Trade')}
                                            onClickLink={toggleDrawer}
                                            is_active={route === routes.trade}
                                        />
                                    </MobileDrawer.Item>
                                )}
                                {primary_routes_config.map((route_config, idx) =>
                                    getRoutesWithSubMenu(route_config, idx)
                                )}
                                {!has_wallet && (
                                    <MobileDrawer.Item
                                        className='header__menu-mobile-theme'
                                        onClick={e => {
                                            e.preventDefault();
                                            toggleTheme(!is_dark_mode);
                                        }}
                                    >
                                        <div className={classNames('header__menu-mobile-link')}>
                                            <Icon className='header__menu-mobile-link-icon' icon={'IcTheme'} />
                                            <span className='header__menu-mobile-link-text'>
                                                {localize('Dark theme')}
                                            </span>
                                            <ToggleSwitch
                                                id='dt_mobile_drawer_theme_toggler'
                                                handleToggle={() => toggleTheme(!is_dark_mode)}
                                                is_enabled={is_dark_mode}
                                            />
                                        </div>
                                    </MobileDrawer.Item>
                                )}
                                {HelpCentreRoute()}
                                {is_logged_in ? (
                                    <React.Fragment>
                                        <MobileDrawer.Item
                                            className={
                                                should_show_regulatory_information
                                                    ? ''
                                                    : 'header__menu-mobile-theme--trader-hub'
                                            }
                                        >
                                            <MenuLink
                                                link_to={getStaticUrl('/responsible')}
                                                icon='IcVerification'
                                                text={localize('Responsible trading')}
                                                onClickLink={toggleDrawer}
                                            />
                                        </MobileDrawer.Item>
                                        {should_show_regulatory_information && (
                                            <MobileDrawer.Item className='header__menu-mobile-theme--trader-hub'>
                                                <MenuLink
                                                    link_to={getStaticUrl('/regulatory')}
                                                    icon='IcRegulatoryInformation'
                                                    text={localize('Regulatory information')}
                                                    onClickLink={toggleDrawer}
                                                />
                                            </MobileDrawer.Item>
                                        )}
                                    </React.Fragment>
                                ) : (
                                    <MobileDrawer.Item className='header__menu-mobile-theme--trader-hub'>
                                        <MenuLink
                                            link_to={getStaticUrl('/responsible')}
                                            icon='IcVerification'
                                            text={localize('Responsible trading')}
                                            onClickLink={toggleDrawer}
                                        />
                                    </MobileDrawer.Item>
                                )}
                                {cs_chat_whatsapp && (
                                    <MobileDrawer.Item className='header__menu-mobile-whatsapp'>
                                        <WhatsApp onClick={toggleDrawer} />
                                    </MobileDrawer.Item>
                                )}
                                {cs_chat_livechat && (
                                    <MobileDrawer.Item className='header__menu-mobile-livechat'>
                                        <LiveChat />
                                    </MobileDrawer.Item>
                                )}
                                {is_logged_in && (
                                    <MobileDrawer.Item onClick={oAuthLogout} className='dc-mobile-drawer__item'>
                                        <MenuLink icon='IcLogout' text={localize('Log out')} />
                                    </MobileDrawer.Item>
                                )}
                            </MobileDrawer.Body>
                            <MobileDrawer.Footer className={is_logged_in ? 'dc-mobile-drawer__footer--servertime' : ''}>
                                <ServerTime is_mobile />
                                <NetworkStatus is_mobile />
                            </MobileDrawer.Footer>
                            {is_mobile_language_menu_open && (
                                <MobileLanguageMenu expandSubMenu={expandSubMenu} toggleDrawer={toggleDrawer} />
                            )}
                        </React.Fragment>
                    </div>
                </Div100vhContainer>
            </MobileDrawer>
        </React.Fragment>
    );
});

ToggleMenuDrawer.displayName = 'ToggleMenuDrawer';

export default ToggleMenuDrawer;
