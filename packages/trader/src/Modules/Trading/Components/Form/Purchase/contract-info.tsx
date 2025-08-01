import React from 'react';
import classNames from 'classnames';

import { Money, Popover, Text } from '@deriv/components';
import { getCurrencyDisplayCode, getGrowthRatePercentage, getLocalizedBasis } from '@deriv/shared';
import { Localize } from '@deriv/translations';
import { useDevice } from '@deriv-com/ui';

import { useTraderStore } from 'Stores/useTraderStores';
import { TProposalTypeInfo } from 'Types';

import CancelDealInfo from './cancel-deal-info';
import ValueMovement from './value-movement';

type TContractInfo = Pick<
    ReturnType<typeof useTraderStore>,
    'basis' | 'growth_rate' | 'is_accumulator' | 'is_turbos' | 'is_vanilla' | 'is_multiplier' | 'currency'
> & {
    is_loading: boolean;
    is_vanilla_fx?: boolean;
    proposal_info: TProposalTypeInfo;
    should_fade: boolean;
    type: string;
};

const ContractInfo = ({
    basis,
    currency,
    growth_rate,
    is_accumulator,
    is_loading,
    is_multiplier,
    is_turbos,
    is_vanilla_fx,
    is_vanilla,
    proposal_info,
    should_fade,
    type,
}: TContractInfo) => {
    const { isMobile } = useDevice();

    const localized_basis = getLocalizedBasis();
    const vanilla_payout_text = is_vanilla_fx ? localized_basis.payout_per_pip : localized_basis.payout_per_point;
    const turbos_payout_message = (
        <Localize i18n_default_text='This is the amount you’ll receive at expiry for every point of change in the underlying price, if the spot price never touches or breaches the barrier throughout the contract duration.' />
    );
    const vanilla_payout_message = is_vanilla_fx ? (
        <Localize
            i18n_default_text='The payout at expiry is equal to the payout per pip multiplied by the difference, <0>in pips</0>, between the final price and the strike price.'
            components={[<strong key={0} />]}
        />
    ) : (
        <Localize i18n_default_text='The payout at expiry is equal to the payout per point multiplied by the difference between the final price and the strike price.' />
    );

    const stakeOrPayout = () => {
        switch (basis) {
            case 'stake': {
                if (is_vanilla) {
                    return vanilla_payout_text;
                }
                return localized_basis.payout;
            }
            case 'payout': {
                return localized_basis.stake;
            }
            default:
                return basis;
        }
    };

    const getBasisText = () => {
        if (is_vanilla) {
            return vanilla_payout_text;
        }

        return has_error_or_not_loaded ? stakeOrPayout() : proposal_info?.obj_contract_basis?.text || '';
    };

    const has_error_or_not_loaded = proposal_info.has_error || !proposal_info.id;
    const basis_text = getBasisText();
    const { message, obj_contract_basis, stake } = proposal_info;

    const setHintMessage = () => {
        if (is_vanilla) return vanilla_payout_message;
        return message;
    };

    return (
        <div className='trade-container__price'>
            <div
                id={`dt_purchase_${type.toLowerCase()}_price`}
                data-testid={`dt_purchase_${type.toLowerCase()}_price`}
                className={classNames('trade-container__price-info', {
                    'trade-container__price-info--disabled': has_error_or_not_loaded,
                    'trade-container__price-info--slide': is_loading && !should_fade,
                    'trade-container__price-info--fade': is_loading && should_fade,
                })}
            >
                {is_multiplier || is_accumulator ? (
                    <React.Fragment>
                        {!is_accumulator && !isMobile && <CancelDealInfo proposal_info={proposal_info} />}
                        {isMobile && (
                            <div className='trade-container__price-info-wrapper'>
                                <div className='btn-purchase__text_wrapper'>
                                    <Text size='xs' weight='bold' color='colored-background'>
                                        {!is_accumulator ? (
                                            <Money amount={stake} currency={currency} show_currency />
                                        ) : (
                                            !is_loading && `${getGrowthRatePercentage(growth_rate)}%`
                                        )}
                                    </Text>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ) : (
                    !is_multiplier &&
                    !is_accumulator &&
                    !is_turbos &&
                    obj_contract_basis && (
                        <React.Fragment>
                            <div className='trade-container__price-info-basis'>{basis_text}</div>
                            {isMobile ? (
                                <div className='trade-container__price-info-wrapper'>
                                    <ValueMovement
                                        has_error_or_not_loaded={has_error_or_not_loaded}
                                        proposal_info={proposal_info}
                                        currency={getCurrencyDisplayCode(currency)}
                                        is_vanilla={is_vanilla}
                                    />
                                </div>
                            ) : (
                                <ValueMovement
                                    has_error_or_not_loaded={has_error_or_not_loaded}
                                    proposal_info={proposal_info}
                                    currency={getCurrencyDisplayCode(currency)}
                                    is_vanilla={is_vanilla}
                                />
                            )}
                        </React.Fragment>
                    )
                )}
            </div>
            {!is_multiplier && !is_accumulator && !isMobile && (
                <Popover
                    alignment='left'
                    icon='info'
                    id={`dt_purchase_${type.toLowerCase()}_info`}
                    is_bubble_hover_enabled
                    margin={216}
                    message={has_error_or_not_loaded ? '' : setHintMessage()}
                    relative_render
                />
            )}
        </div>
    );
};

export default ContractInfo;
