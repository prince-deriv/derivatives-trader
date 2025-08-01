import React from 'react';
import { CSSTransition } from 'react-transition-group';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';

import { usePrevious } from '@deriv/components';
import { useMFAccountStatus } from '@deriv/api';
import { StandaloneStopwatchRegularIcon } from '@deriv/quill-icons';
import {
    getCardLabelsV2,
    getContractTypeDisplay,
    getIndicativePrice,
    hasContractEntered,
    isAccumulatorContract,
    isOpen,
    isValidToSell,
    MT5_ACCOUNT_STATUS,
} from '@deriv/shared';
import { useStore } from '@deriv/stores';
import { Button, useNotifications, useSnackbar } from '@deriv-com/quill-ui';
import { useDevice } from '@deriv-com/ui';

import { checkIsServiceModalError } from 'AppV2/Utils/layout-utils';
import { getTradeTypeTabsList } from 'AppV2/Utils/trade-params-utils';
import { getDisplayedContractTypes } from 'AppV2/Utils/trade-types-utils';
import { useTraderStore } from 'Stores/useTraderStores';

import { sendDtraderV2PurchaseToAnalytics } from '../../../Analytics';

import PurchaseButtonContent from './purchase-button-content';

const BASIS_STAKE = 'stake';
const BASIS_PAYOUT = 'payout';
const BASIS_NAME = 'basis';

const PurchaseButton = observer(() => {
    const [loading_button_index, setLoadingButtonIndex] = React.useState<number | null>(null);
    const [error_info, setErrorInfo] = React.useState<{ has_error: boolean; message: string | null }>({
        has_error: false,
        message: null,
    });
    const { isMobile } = useDevice();
    const { addBanner } = useNotifications();
    const { addSnackbar } = useSnackbar();
    const {
        portfolio: { all_positions, onClickSell, open_accu_contract, active_positions },
        client: { is_logged_in },
        common: { services_error },
        ui: { is_mf_verification_pending_modal_visible, setIsMFVericationPendingModal },
    } = useStore();
    const {
        basis,
        basis_list,
        contract_type,
        currency,
        has_open_accu_contract,
        is_accumulator,
        is_multiplier,
        is_purchase_enabled,
        is_touch,
        is_trade_enabled_v2,
        is_turbos,
        is_vanilla_fx,
        is_vanilla,
        proposal_info,
        purchase_info,
        onPurchaseV2,
        onChange,
        symbol,
        trade_type_tab,
        trade_types,
    } = useTraderStore();

    const [is_sell_button_visible, setIsSellButtonVisibile] = React.useState(is_accumulator && has_open_accu_contract);
    const [animation_duration, setAnimationDuration] = React.useState(450);
    const prev_has_open_accu_contract = usePrevious(
        !!open_accu_contract &&
            !!active_positions.find(
                ({ contract_info, type }) => isAccumulatorContract(type) && contract_info.underlying === symbol
            )
    );
    const mf_account_status = useMFAccountStatus();
    const basis_options = React.useMemo(
        () => (basis_list.length ? basis_list.map(item => item.value) : []),
        [basis_list]
    );

    const is_high_low = /^high_low$/.test(contract_type.toLowerCase());
    const purchase_button_content_props = {
        currency,
        has_open_accu_contract,
        is_multiplier,
        is_turbos,
        is_vanilla,
    };
    const has_no_button_content =
        is_vanilla ||
        is_vanilla_fx ||
        is_turbos ||
        is_high_low ||
        is_touch ||
        (is_accumulator && !has_open_accu_contract);
    const contract_types = getDisplayedContractTypes(trade_types, contract_type, trade_type_tab);
    const active_accu_contract = is_accumulator
        ? all_positions.find(
              ({ contract_info, type }) =>
                  isAccumulatorContract(type) && contract_info.underlying === symbol && !contract_info.is_sold
          )
        : undefined;
    const is_valid_to_sell = active_accu_contract?.contract_info
        ? hasContractEntered(active_accu_contract.contract_info) &&
          isOpen(active_accu_contract.contract_info) &&
          isValidToSell(active_accu_contract.contract_info)
        : false;
    const current_stake =
        (is_valid_to_sell && active_accu_contract && getIndicativePrice(active_accu_contract.contract_info)) || null;
    const cardLabels = getCardLabelsV2();
    const is_modal_error = checkIsServiceModalError({ services_error, is_mf_verification_pending_modal_visible });
    const is_accu_sell_disabled = !is_valid_to_sell || active_accu_contract?.is_sell_requested;

    const getButtonType = (index: number, trade_type: string) => {
        const tab_index = getTradeTypeTabsList(contract_type).findIndex(tab => tab.contract_type === trade_type);
        const button_index = tab_index < 0 ? index : tab_index;
        return button_index ? 'sell' : 'purchase';
    };

    const addNotificationBannerCallback = (params: Parameters<typeof addBanner>[0], contract_id: number) => {
        sendDtraderV2PurchaseToAnalytics(contract_type, symbol, contract_id);
        return addBanner({
            icon: (
                <StandaloneStopwatchRegularIcon
                    iconSize='sm'
                    className='trade-notification--purchase'
                    key='contract-opened'
                />
            ),
            ...params,
        });
    };

    React.useEffect(() => {
        if (is_purchase_enabled) setLoadingButtonIndex(null);
    }, [is_purchase_enabled]);

    React.useEffect(() => {
        const shouldSwitchToStake =
            basis === BASIS_PAYOUT && basis_options.length > 1 && basis_options.includes(BASIS_STAKE);
        if (shouldSwitchToStake) {
            onChange({ target: { value: BASIS_STAKE, name: BASIS_NAME } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [basis, basis_options]);

    React.useEffect(() => {
        const is_animated =
            (!prev_has_open_accu_contract && has_open_accu_contract) ||
            (prev_has_open_accu_contract && !has_open_accu_contract && is_accumulator);
        setAnimationDuration(is_animated ? 450 : 0);

        setIsSellButtonVisibile(is_accumulator ? has_open_accu_contract : false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [is_accumulator, has_open_accu_contract]);

    React.useEffect(() => {
        // Check each proposal info object directly for errors
        if (proposal_info && contract_types.length === Object.keys(proposal_info).length) {
            let message = '';
            // Using some() to break out of the loop once we find the first error
            const has_error = Object.values(proposal_info).some(info => {
                if (info.has_error && info.message) {
                    message = info.message || '';
                    return true; // This breaks out of the loop
                }
                return false;
            });
            setErrorInfo({ has_error, message: message || '' });
        }
    }, [proposal_info]);

    React.useEffect(() => {
        if (error_info.has_error && error_info.message) {
            addSnackbar({
                message: error_info.message,
                status: 'fail',
                hasCloseButton: true,
                hasFixedHeight: false,
                style: {
                    marginBottom: is_logged_in ? '48px' : '-8px',
                    width: 'calc(100% - var(--core-spacing-800)',
                },
            });

            // Clear the error state after showing the snackbar
            setErrorInfo({ has_error: false, message: null });
        }
    }, [error_info.has_error]);

    return (
        <React.Fragment>
            <CSSTransition
                in={!is_sell_button_visible}
                timeout={animation_duration}
                classNames='slide'
                key='purchase-button'
                unmountOnExit
                mountOnEnter
            >
                <div
                    className={clsx('purchase-button__wrapper', {
                        'purchase-button__wrapper__un-auth': !is_logged_in,
                    })}
                >
                    {contract_types.map((trade_type, index) => {
                        const info = proposal_info?.[trade_type] || {};
                        const is_single_button = contract_types.length === 1;
                        const is_loading = loading_button_index === index;
                        const is_disabled =
                            !is_trade_enabled_v2 || info.has_error || (!!purchase_info.error && !is_modal_error);

                        return (
                            <React.Fragment key={trade_type}>
                                <Button
                                    color={getButtonType(index, trade_type)}
                                    size='lg'
                                    label={getContractTypeDisplay(trade_type, {
                                        isHighLow: is_high_low,
                                        showButtonName: true,
                                    })}
                                    fullWidth
                                    className={clsx(
                                        'purchase-button',
                                        is_loading && 'purchase-button--loading',
                                        is_single_button && 'purchase-button--single'
                                    )}
                                    isLoading={is_loading}
                                    isOpaque
                                    disabled={is_disabled && !is_loading}
                                    onClick={() => {
                                        if (is_multiplier && mf_account_status === MT5_ACCOUNT_STATUS.PENDING) {
                                            setIsMFVericationPendingModal(true);
                                        } else {
                                            setLoadingButtonIndex(index);
                                            onPurchaseV2(trade_type, isMobile, addNotificationBannerCallback);
                                        }
                                    }}
                                >
                                    {!is_loading && (
                                        <PurchaseButtonContent
                                            {...purchase_button_content_props}
                                            has_no_button_content={has_no_button_content}
                                            info={info}
                                            is_reverse={!!index}
                                        />
                                    )}
                                </Button>
                            </React.Fragment>
                        );
                    })}
                </div>
            </CSSTransition>
            <CSSTransition
                in={is_sell_button_visible}
                timeout={animation_duration}
                classNames='slide'
                key='sell-button'
                unmountOnExit
                mountOnEnter
            >
                <div className='purchase-button__wrapper'>
                    <Button
                        color='black-white'
                        size='lg'
                        label={
                            is_accu_sell_disabled
                                ? `${cardLabels.CLOSE}`
                                : `${cardLabels.CLOSE} ${current_stake} ${currency}`
                        }
                        fullWidth
                        isOpaque
                        isLoading={active_accu_contract?.is_sell_requested}
                        className='purchase-button purchase-button--single'
                        disabled={!is_valid_to_sell}
                        onClick={() => onClickSell(active_accu_contract?.contract_info.contract_id)}
                    />
                </div>
            </CSSTransition>
        </React.Fragment>
    );
});

export default PurchaseButton;
