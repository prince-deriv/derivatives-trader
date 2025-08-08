import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { CFD_PLATFORMS, ContentFlag } from '@deriv/shared';
import BaseStore from './base-store';
import { isEuCountry } from '_common/utility';

export default class TradersHubStore extends BaseStore {
    available_platforms = [];
    combined_cfd_mt5_accounts = [];
    selected_account_type;
    selected_region;
    is_onboarding_visited = false;
    is_first_time_visit = true;
    is_verification_docs_list_modal_visible = false;
    is_regulators_compare_modal_visible = false;
    account_type_card = '';
    selected_platform_type = 'options';
    modal_data = {
        active_modal: '',
        data: {},
    };
    selected_jurisdiction_kyc_status = {};
    selected_account = {};
    is_real_wallets_upgrade_on = false;
    is_wallet_migration_failed = false;
    active_modal_tab;
    active_modal_wallet_id;
    is_cfd_restricted_country = false;
    is_financial_restricted_country = false;

    constructor(root_store) {
        const local_storage_properties = [
            'available_platforms',
            'selected_region',
            'is_cfd_restricted_country',
            'is_financial_restricted_country',
        ];
        const store_name = 'traders_hub_store';
        super({ root_store, local_storage_properties, store_name });

        makeObservable(this, {
            account_type_card: observable,
            available_platforms: observable,
            combined_cfd_mt5_accounts: observable,
            is_regulators_compare_modal_visible: observable,
            is_verification_docs_list_modal_visible: observable,
            modal_data: observable,
            is_onboarding_visited: observable,
            is_first_time_visit: observable,
            selected_account: observable,
            selected_jurisdiction_kyc_status: observable,
            selected_account_type: observable,
            selected_platform_type: observable,
            active_modal_tab: observable,
            active_modal_wallet_id: observable,
            selected_region: observable,
            is_real_wallets_upgrade_on: observable,
            is_wallet_migration_failed: observable,
            is_cfd_restricted_country: observable,
            is_financial_restricted_country: observable,
            closeModal: action.bound,
            content_flag: computed,
            getAccount: action.bound,
            setWalletModalActiveTab: action.bound,
            setWalletModalActiveWalletID: action.bound,
            has_any_real_account: computed,
            is_demo_low_risk: computed,
            is_demo: computed,
            is_eu_selected: computed,
            is_real: computed,
            is_low_risk_cr_eu_real: computed,
            openDemoCFDAccount: action.bound,
            openModal: action.bound,
            openRealAccount: action.bound,
            selectAccountType: action.bound,
            selectAccountTypeCard: action.bound,
            selectRegion: action.bound,
            setSelectedAccount: action.bound,
            setTogglePlatformType: action.bound,
            should_show_exit_traders_modal: computed,
            show_eu_related_content: computed,
            startTrade: action.bound,
            setIsOnboardingVisited: action.bound,
            setVerificationModalOpen: action.bound,
            cleanup: action.bound,
            setIsCFDRestrictedCountry: action.bound,
            setIsFinancialRestrictedCountry: action.bound,
        });

        reaction(
            () => [this.root_store.client.loginid, this.root_store.client.residence],
            () => {
                const residence = this.root_store.client.residence;
                const active_demo = /^VRT|VRW/.test(this.root_store.client.loginid);
                const active_real_mf = /^MF|MFW/.test(this.root_store.client.loginid);
                const default_region = () => {
                    if (((active_demo || active_real_mf) && isEuCountry(residence)) || active_real_mf) {
                        return 'EU';
                    }
                    return 'Non-EU';
                };
                this.selected_account_type = !/^VRT|VRW/.test(this.root_store.client.loginid) ? 'real' : 'demo';
                this.selected_region = default_region();
            }
        );
    }

    setWalletModalActiveTab(tab) {
        this.active_modal_tab = tab;
    }

    setWalletModalActiveWalletID(wallet_id) {
        this.active_modal_wallet_id = wallet_id;
    }

    setIsCFDRestrictedCountry(value) {
        this.is_cfd_restricted_country = value;
    }
    setIsFinancialRestrictedCountry(value) {
        this.is_financial_restricted_country = value;
    }

    setSelectedAccount(account) {
        this.selected_account = account;
    }

    async selectAccountType(account_type) {
        const { account_list, switchAccount, prev_real_account_loginid, has_active_real_account } =
            this.root_store.client;

        if (account_type === 'demo') {
            await switchAccount(account_list.find(acc => acc.is_virtual && !acc.is_disabled)?.loginid);
        } else if (account_type === 'real') {
            if (!has_active_real_account && this.content_flag === ContentFlag.EU_DEMO) {
                if (this.root_store.client.real_account_creation_unlock_date) {
                    this.root_store.ui.setShouldShowCooldownModal(true);
                } else {
                    this.root_store.ui.openRealAccountSignup('maltainvest');
                }
            } else if (!has_active_real_account) {
                this.root_store.ui.openRealAccountSignup('svg');
            }

            if (prev_real_account_loginid) {
                await switchAccount(prev_real_account_loginid);
            } else {
                await switchAccount(account_list.find(acc => !acc.is_virtual && !acc.is_disabled)?.loginid);
            }
        }
        this.selected_account_type = !has_active_real_account ? 'demo' : account_type;
    }

    selectAccountTypeCard(account_type_card) {
        this.account_type_card = account_type_card;
    }

    selectRegion(region) {
        this.selected_region = region;
    }

    get is_demo_low_risk() {
        const { is_landing_company_loaded } = this.root_store.client;
        if (is_landing_company_loaded) {
            const { financial_company, gaming_company } = this.root_store.client.landing_companies;
            return (
                this.content_flag === ContentFlag.CR_DEMO &&
                financial_company?.shortcode === 'maltainvest' &&
                gaming_company?.shortcode === 'svg'
            );
        }
        return false;
    }

    get content_flag() {
        const { is_logged_in, landing_companies, residence, is_landing_company_loaded } = this.root_store.client;
        if (is_landing_company_loaded) {
            const { financial_company, gaming_company } = landing_companies;

            //this is a conditional check for countries like Australia/Norway which fulfills one of these following conditions
            const restricted_countries = financial_company?.shortcode === 'svg' || gaming_company?.shortcode === 'svg';

            if (!is_logged_in) return '';
            if (!gaming_company?.shortcode && financial_company?.shortcode === 'maltainvest') {
                if (this.is_demo) return ContentFlag.EU_DEMO;
                return ContentFlag.EU_REAL;
            } else if (
                financial_company?.shortcode === 'maltainvest' &&
                gaming_company?.shortcode === 'svg' &&
                this.is_real
            ) {
                if (this.is_eu_user) return ContentFlag.LOW_RISK_CR_EU;
                return ContentFlag.LOW_RISK_CR_NON_EU;
            } else if (
                ((financial_company?.shortcode === 'svg' && gaming_company?.shortcode === 'svg') ||
                    restricted_countries) &&
                this.is_real
            ) {
                return ContentFlag.HIGH_RISK_CR;
            }

            // Default Check
            if (isEuCountry(residence)) {
                if (this.is_demo) return ContentFlag.EU_DEMO;
                return ContentFlag.EU_REAL;
            }
            if (this.is_demo) return ContentFlag.CR_DEMO;
        }
        return this.is_eu_user ? ContentFlag.LOW_RISK_CR_EU : ContentFlag.LOW_RISK_CR_NON_EU;
    }

    get show_eu_related_content() {
        const eu_related = [ContentFlag.EU_DEMO, ContentFlag.EU_REAL, ContentFlag.LOW_RISK_CR_EU];
        return eu_related.includes(this.content_flag);
    }

    get is_low_risk_cr_eu_real() {
        return [ContentFlag.LOW_RISK_CR_EU, ContentFlag.EU_REAL].includes(this.content_flag);
    }

    setIsOnboardingVisited(is_visited) {
        this.is_onboarding_visited = is_visited;
    }

    get is_eu_selected() {
        return this.selected_region === 'EU';
    }

    get should_show_exit_traders_modal() {
        //  should display the modal when low risk cr client have atleast one mf account
        const is_low_risk_cr_client = [
            ContentFlag.LOW_RISK_CR_EU,
            ContentFlag.LOW_RISK_CR_NON_EU,
            ContentFlag.CR_DEMO,
        ].includes(this.content_flag);
        const { active_accounts } = this.root_store.client;
        return is_low_risk_cr_client && active_accounts.some(acc => acc.landing_company_shortcode === 'maltainvest');
    }

    get has_any_real_account() {
        return this.selected_account_type === 'real' && this.root_store.client.has_active_real_account;
    }

    setTogglePlatformType(platform_type) {
        this.selected_platform_type = platform_type;
    }

    startTrade(platform, account) {
        const { common, modules } = this.root_store;
        const { toggleMT5TradeModal, setMT5TradeAccount } = modules.cfd;
        const { setAppstorePlatform } = common;
        setAppstorePlatform(platform);
        toggleMT5TradeModal();
        setMT5TradeAccount(account);
    }

    get is_demo() {
        return this.selected_account_type === 'demo';
    }
    get is_real() {
        return this.selected_account_type === 'real';
    }
    get is_eu_user() {
        return this.selected_region === 'EU';
    }

    async openDemoCFDAccount(account_type, platform) {
        const { modules } = this.root_store;
        const { createCFDAccount, enableCFDPasswordModal } = modules.cfd;

        if (platform !== CFD_PLATFORMS.CTRADER) {
            enableCFDPasswordModal();
        } else {
            await createCFDAccount({ ...account_type, platform });
        }
    }

    async openRealAccount(account_type, platform) {
        const { client, modules } = this.root_store;
        const { has_active_real_account } = client;
        const { createCFDAccount, enableCFDPasswordModal } = modules.cfd;
        // await this.getMT5AccountKYCStatus();
        if (has_active_real_account && platform === CFD_PLATFORMS.MT5) {
            if (this.selected_jurisdiction_kyc_status && Object.keys(this.selected_jurisdiction_kyc_status)?.length) {
                this.setVerificationModalOpen(true);
            } else {
                //all kyc requirements satisfied
                enableCFDPasswordModal();
            }
        } else if (platform === CFD_PLATFORMS.DXTRADE) {
            enableCFDPasswordModal();
        } else {
            await createCFDAccount({ ...account_type, platform });
        }
    }

    openModal(modal_id, props = {}) {
        this.modal_data = {
            active_modal: modal_id,
            data: props,
        };
    }

    closeModal() {
        this.modal_data = {
            active_modal: '',
            data: {},
        };
    }

    getAccount() {
        const { modules, common } = this.root_store;
        const { account_type } = modules.cfd;
        const { platform } = common;
        if (this.is_demo) {
            this.openDemoCFDAccount(account_type, platform);
        } else {
            this.openRealAccount(account_type, platform);
        }
    }

    getServerName = account => {
        if (account) {
            const server_region = account.server_info?.geolocation?.region;
            if (server_region) {
                return `${server_region} ${
                    account?.server_info?.geolocation?.sequence === 1 ? '' : account?.server_info?.geolocation?.sequence
                }`;
            }
        }
        return '';
    };

    setVerificationModalOpen(value) {
        this.is_verification_docs_list_modal_visible = value;
    }

    cleanup() {
        if (
            !localStorage.getItem('active_loginid') ||
            (!this.root_store.client.is_logged_in && localStorage.getItem('active_loginid') === 'null')
        ) {
            localStorage.removeItem('traders_hub_store');
            this.setIsFinancialRestrictedCountry(false);
            this.setIsCFDRestrictedCountry(false);
            this.available_platforms = [];
        }
    }
}
