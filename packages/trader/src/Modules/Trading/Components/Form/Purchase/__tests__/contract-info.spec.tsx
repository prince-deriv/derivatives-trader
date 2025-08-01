import React from 'react';

import { getLocalizedBasis, TRADE_TYPES } from '@deriv/shared';
import { useDevice } from '@deriv-com/ui';
import { render, screen } from '@testing-library/react';

import ContractInfo from '../contract-info';

const test_message = 'Some test message';
const value_movement = 'ValueMovement';
const cancel_deal_info = 'CancelDealInfo';
const test_id = 'dt_purchase_test_contract_type_price';
const localized_basis = getLocalizedBasis();
const default_mock_props: React.ComponentProps<typeof ContractInfo> = {
    basis: 'stake',
    currency: 'USD',
    growth_rate: 0.03,
    is_loading: false,
    is_accumulator: false,
    is_multiplier: false,
    is_turbos: false,
    is_vanilla: false,
    should_fade: true,
    proposal_info: {
        id: '129106862',
        cancellation: { ask_price: 1023, date_expiry: 1907128726 },
        has_error: false,
        obj_contract_basis: { text: 'payout', value: 10 },
        message: test_message,
        stake: '10',
        growth_rate: 0,
        spot_time: 0,
        commission: 0.44,
        has_error_details: false,
        error_code: '',
        error_field: '',
        limit_order: undefined,
        payout: 0,
        profit: '',
        returns: '',
        spot: 0,
        validation_params: undefined,
    },
    type: 'test_contract_type',
};

jest.mock('../value-movement', () => jest.fn(() => <div>{value_movement}</div>));
jest.mock('../cancel-deal-info', () => jest.fn(() => <div>{cancel_deal_info}</div>));
jest.mock('@deriv/components', () => ({
    ...jest.requireActual('@deriv/components'),
    Popover: jest.fn(props => <div>{props.message}</div>),
}));
jest.mock('@deriv-com/ui', () => ({
    useDevice: jest.fn(() => ({ isMobile: false })),
}));

describe('<ContractInfo />', () => {
    it('should render component with children', () => {
        render(<ContractInfo {...default_mock_props} />);

        expect(screen.getByText(test_message)).toBeInTheDocument();
    });
    it('should render specific components if is_multiplier === true', () => {
        (useDevice as jest.Mock).mockReturnValueOnce({ isMobile: true });
        render(<ContractInfo {...default_mock_props} is_multiplier />);

        expect(screen.getByText(/10.00 USD/i)).toBeInTheDocument();
        expect(screen.queryByText(value_movement)).not.toBeInTheDocument();
        expect(screen.queryByText(test_message)).not.toBeInTheDocument();
    });
    it('should render specific components if is_accumulator === true', () => {
        (useDevice as jest.Mock).mockReturnValueOnce({ isMobile: true });
        render(<ContractInfo {...default_mock_props} is_accumulator />);

        expect(screen.getByText(/3%/i)).toBeInTheDocument();
        expect(screen.queryByText(cancel_deal_info)).not.toBeInTheDocument();
        expect(screen.queryByText(value_movement)).not.toBeInTheDocument();
        expect(screen.queryByText(test_message)).not.toBeInTheDocument();
    });
    it('should apply a proper className if proposal_info.has_error or !proposal_info.id is true', () => {
        default_mock_props.proposal_info.has_error = true;
        render(<ContractInfo {...default_mock_props} />);

        expect(screen.getByTestId(test_id)).toHaveClass(
            'trade-container__price-info trade-container__price-info--disabled'
        );
    });
    it('should apply a proper className if is_loading && !should_fade is true', () => {
        default_mock_props.proposal_info.has_error = false;
        render(<ContractInfo {...default_mock_props} is_loading should_fade={false} />);

        expect(screen.getByTestId(test_id)).toHaveClass(
            'trade-container__price-info trade-container__price-info--slide'
        );
    });
    it('should apply a proper className if is_loading && should_fade is true', () => {
        render(<ContractInfo {...default_mock_props} is_loading />);

        expect(screen.getByTestId(test_id)).toHaveClass(
            'trade-container__price-info trade-container__price-info--fade'
        );
    });

    it('should render specific tooltip message if is_vanilla is true', () => {
        render(<ContractInfo {...default_mock_props} is_vanilla />);

        expect(screen.getByText(/The payout at expiry is equal to the payout/i)).toBeInTheDocument();
    });

    it('should render specific basis text if proposal_info has error and basis is equal to "payout"', () => {
        render(<ContractInfo {...default_mock_props} basis='payout' />);

        expect(screen.getByText('payout')).toBeInTheDocument();
    });
    it('should render specific basis text if proposal_info has error and basis is not equal to "payout" or "stake"', () => {
        render(<ContractInfo {...default_mock_props} basis='test_basis' />);

        expect(screen.getByText('payout')).toBeInTheDocument();
    });
});
