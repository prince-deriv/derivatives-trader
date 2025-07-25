import React, { useEffect, useState } from 'react';

import { LabelPairedChevronDownMdRegularIcon } from '@deriv/quill-icons';
import { getMarketNamesMap, getSymbolDisplayName } from '@deriv/shared';
import { observer } from '@deriv/stores';
import { Localize } from '@deriv/translations';
import { CaptionText, Skeleton, Tag, Text, useSnackbar } from '@deriv-com/quill-ui';

import useActiveSymbols from 'AppV2/Hooks/useActiveSymbols';
import useContractsForCompany from 'AppV2/Hooks/useContractsForCompany';
import { TContractType } from 'Modules/Trading/Components/Form/ContractType/types';
import { useTraderStore } from 'Stores/useTraderStores';

import ActiveSymbolsList from '../ActiveSymbolsList';
import SymbolIconsMapper from '../SymbolIconsMapper/symbol-icons-mapper';

const MarketSelector = observer(() => {
    const [isOpen, setIsOpen] = useState(false);
    const { activeSymbols } = useActiveSymbols();
    const { symbol: storeSymbol, tick_data, is_market_closed, contract_type } = useTraderStore();
    const { addSnackbar } = useSnackbar();
    const { trade_types } = useContractsForCompany();

    const currentSymbol = activeSymbols.find(({ symbol }) => symbol === storeSymbol);

    const contract_name = trade_types?.find((item: TContractType) => item.value === contract_type)?.text;

    useEffect(() => {
        if (!currentSymbol) {
            const symbol_name = getMarketNamesMap()[storeSymbol as keyof typeof getMarketNamesMap] || storeSymbol;
            const message = contract_name ? (
                <Localize
                    i18n_default_text={`${symbol_name} is unavailable for ${contract_name}.`}
                    values={{
                        symbol_name,
                        contract_name,
                    }}
                />
            ) : (
                <Localize
                    i18n_default_text={`${symbol_name} is unavailable.`}
                    values={{
                        symbol_name,
                    }}
                />
            );

            symbol_name &&
                addSnackbar({
                    message,
                    status: 'neutral',
                    hasCloseButton: true,
                    hasFixedHeight: false,
                    style: {
                        marginBottom: '0',
                        width: 'calc(100% - var(--core-spacing-800)',
                    },
                });
        }
    }, [currentSymbol, storeSymbol, contract_name]);

    const { pip_size, quote } = tick_data ?? {};
    const current_spot = quote?.toFixed(pip_size);
    const current_spot_replacement = is_market_closed ? (
        <Text>-</Text>
    ) : (
        <Skeleton.Square height={18} width={64} rounded />
    );

    // For closed markets exchange_is_open === 0
    if (typeof currentSymbol?.exchange_is_open === 'undefined')
        return <Skeleton.Square height={42} width={240} rounded />;

    return (
        <React.Fragment>
            <div className='market-selector__container' onClick={() => setIsOpen(true)}>
                <div className='market-selector'>
                    <SymbolIconsMapper symbol={storeSymbol} />
                    <div className='market-selector-info'>
                        <div className='market-selector-info__label'>
                            <Text bold>
                                {getSymbolDisplayName(
                                    [],
                                    (currentSymbol as any)?.underlying_symbol || currentSymbol?.symbol || ''
                                )}
                            </Text>
                            {!currentSymbol?.exchange_is_open && (
                                <Tag
                                    label={<Localize key='closed' i18n_default_text='CLOSED' />}
                                    color='error'
                                    variant='fill'
                                    showIcon={false}
                                    size='sm'
                                />
                            )}
                            <LabelPairedChevronDownMdRegularIcon fill='var(--component-textIcon-normal-default' />
                        </div>
                        {/* {current_spot ? (
                            <CaptionText className='market-selector-info__price'>{current_spot}</CaptionText>
                        ) : (
                            current_spot_replacement
                        )} */}
                    </div>
                </div>
            </div>
            <ActiveSymbolsList isOpen={isOpen} setIsOpen={setIsOpen} />
        </React.Fragment>
    );
});

export default MarketSelector;
