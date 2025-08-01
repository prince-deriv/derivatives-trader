import React from 'react';

import { isDesktop } from '@deriv/shared';
import { observer } from '@deriv/stores';
import { localize } from '@deriv/translations';

import Fieldset from 'App/Components/Form/fieldset';
import NumberSelector from 'App/Components/Form/number-selector';
import { useTraderStore } from 'Stores/useTraderStores';

type TLastDigit = {
    is_minimized?: boolean;
};

const LastDigit = observer(({ is_minimized }: TLastDigit) => {
    const { onChange, last_digit } = useTraderStore();
    if (is_minimized) {
        return <div className='fieldset-minimized'>{`${localize('Last Digit')}: ${last_digit}`}</div>;
    }
    const arr_five = [...Array(5).keys()];
    return (
        <Fieldset
            className='trade-container__fieldset'
            header={isDesktop() ? localize('Last Digit Prediction') : null}
            is_center
        >
            <NumberSelector
                arr_arr_numbers={[arr_five, arr_five.map(i => i + 5)]}
                name='last_digit'
                onChange={onChange}
                selected_number={+last_digit}
            />
        </Fieldset>
    );
});

export default LastDigit;
