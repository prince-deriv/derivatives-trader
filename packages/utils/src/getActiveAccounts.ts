import Cookies from 'js-cookie';

import { requestSessionActive } from '@deriv-com/auth-client';

import Chat from './chat';
import isTmbEnabled from './isTmbEnabled';

const domains = ['deriv.com', 'deriv.dev', 'binary.sx', 'pages.dev', 'localhost', 'deriv.be', 'deriv.me'];
function endChat() {
    window.LC_API?.close_chat?.();
    window.LiveChatWidget?.call('hide');
    window.fcWidget?.close();
    Chat.clear();
}
const currentDomain = window.location.hostname.split('.').slice(-2).join('.');

const handleLogout = async () => {
    localStorage.removeItem('closed_toast_notifications');
    localStorage.removeItem('is_wallet_migration_modal_closed');
    localStorage.removeItem('active_wallet_loginid');
    localStorage.removeItem('config.account1');
    localStorage.removeItem('config.tokens');
    localStorage.removeItem('verification_code.system_email_change');
    localStorage.removeItem('verification_code.request_email');
    localStorage.removeItem('new_email.system_email_change');
    localStorage.removeItem('active_loginid');
    localStorage.removeItem('clientAccounts');
    Object.keys(sessionStorage)
        .filter(key => key !== 'trade_store')
        .forEach(key => sessionStorage.removeItem(key));
    endChat();
    if (domains.includes(currentDomain)) {
        Cookies.set('logged_state', 'false', {
            domain: currentDomain,
            expires: 30,
            path: '/',
            secure: true,
        });
    }
    // window.open(oauthUrl, '_self');
};

// Helper function to set account in session storage
const setAccountInSessionStorage = (loginid?: string, isWallet = false) => {
    if (!loginid) return;

    const key = isWallet ? 'active_wallet_loginid' : 'active_loginid';
    sessionStorage.setItem(key, loginid);
};

const getActiveSessions = async () => {
    try {
        const data = await requestSessionActive();

        return data;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to get active sessions', error);
    }
};

const getActiveAccounts = async () => {
    const is_tmb_enabled = await isTmbEnabled();

    if (!is_tmb_enabled) {
        return undefined;
    }

    const activeSessions = await getActiveSessions();

    if (!activeSessions?.active) {
        handleLogout();
        return undefined;
    }

    if (activeSessions?.active) {
        const localStorageClientAccounts = localStorage.getItem('clientAccounts');
        const activeSessionTokens = JSON.stringify(activeSessions?.tokens);
        const shouldReinitializeClientStore = localStorageClientAccounts !== activeSessionTokens;

        if (shouldReinitializeClientStore) {
            localStorage.removeItem('client.accounts');
        }

        localStorage.setItem('clientAccounts', activeSessionTokens);

        // COMMENTED OUT: Multi-account selection logic for single account model
        // For single account model, just use the first/primary account
        const tokens = Array.isArray(activeSessions.tokens)
            ? activeSessions.tokens
            : activeSessions.tokens
              ? [activeSessions.tokens]
              : [];
        const primaryAccount = tokens.length > 0 ? tokens[0] : null;

        if (primaryAccount) {
            // Set single account in session storage
            const isWallet =
                primaryAccount.loginid.startsWith('CRW') ||
                primaryAccount.loginid.startsWith('MFW') ||
                primaryAccount.loginid.startsWith('VRW');
            setAccountInSessionStorage(primaryAccount.loginid, isWallet);

            // Update URL params to reflect the selected account
            const params = new URLSearchParams(location.search);
            const account = primaryAccount.loginid.startsWith('VR') ? 'demo' : primaryAccount.cur;
            params.set('account', account ?? '');
            const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
            window.history.replaceState({}, '', newUrl);
        }

        // Simplified result for single account model
        const convertedResult: Record<string, string> = {};
        if (primaryAccount) {
            convertedResult.acct1 = primaryAccount.loginid;
            convertedResult.token1 = primaryAccount.token;
            convertedResult.cur1 = primaryAccount.cur;
        }

        return shouldReinitializeClientStore ? convertedResult : undefined;
    }
};

export default getActiveAccounts;
