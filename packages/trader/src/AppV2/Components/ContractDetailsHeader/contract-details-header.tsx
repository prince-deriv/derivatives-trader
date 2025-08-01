import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { LabelPairedArrowLeftSmBoldIcon } from '@deriv/quill-icons';
import { isEmptyObject } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { Localize } from '@deriv/translations';
import { IconButton, Text } from '@deriv-com/quill-ui';

const ContractDetailsHeader = observer(() => {
    const { state } = useLocation();
    const history = useHistory();
    const { common } = useStore();
    const { routeBackInApp } = common;

    const handleBack = () => {
        const is_from_table_row = !isEmptyObject(state) ? state.from_table_row : false;
        return is_from_table_row
            ? history.goBack()
            : routeBackInApp(history as unknown as Parameters<typeof routeBackInApp>[0]);
    };

    return (
        <header className='header contract-details-header-v2'>
            <React.Suspense fallback={<div />}>
                <IconButton
                    variant='tertiary'
                    icon={<LabelPairedArrowLeftSmBoldIcon height='22px' width='13px' data-testid='arrow' key='arrow' />}
                    className='arrow'
                    color='black-white'
                    onClick={handleBack}
                />
                <Text size='md' bold color='quill-typography__color--prominent'>
                    <Localize i18n_default_text='Contract details' />
                </Text>
            </React.Suspense>
        </header>
    );
});

export default ContractDetailsHeader;
