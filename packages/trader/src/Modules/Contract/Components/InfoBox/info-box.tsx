import React from 'react';

import { TContractInfo } from '@deriv/shared';

import { SlideIn } from 'App/Components/Animations';

import ContractError from '../contract-error';

import InfoBoxLongcode from './info-box-longcode';

type TInfoBox = {
    contract_info: TContractInfo;
    error_message?: string;
    removeError: () => void;
};

const InfoBox = ({ contract_info, error_message, removeError }: TInfoBox) => {
    const is_ready = !!contract_info.longcode;
    return (
        <SlideIn is_visible={is_ready} className='info-box-container' keyname='info-box-container'>
            {!!contract_info.contract_type && (
                <div className='info-box'>
                    <InfoBoxLongcode contract_info={contract_info} />
                </div>
            )}
            <ContractError message={error_message} onClickClose={removeError} />
        </SlideIn>
    );
};

export default InfoBox;
