import React, { ReactElement } from 'react';
import moment from 'moment';

import { CONTRACT_TYPES, TRADE_TYPES } from '@deriv/shared';
import { mockStore } from '@deriv/stores';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getProposalInfo } from 'Stores/Modules/Trading/Helpers/proposal';

import {
    addUnit,
    focusAndOpenKeyboard,
    getDatePickerStartDate,
    getOptionPerUnit,
    getPayoutInfo,
    getProposalRequestObject,
    getSmallestDuration,
    getSnackBarText,
    getTradeParams,
    getTradeTypeTabsList,
    isDigitContractWinning,
    isSmallScreen,
} from '../trade-params-utils';

describe('getTradeParams', () => {
    it('should return correct object with keys for Rise/Fall', () => {
        expect(getTradeParams()[TRADE_TYPES.RISE_FALL]).toEqual({
            duration: true,
            stake: true,
            allow_equals: true,
        });
    });

    it('should return correct object with keys for Multipliers if symbol does not start with "cry"', () => {
        expect(getTradeParams()[TRADE_TYPES.MULTIPLIER]).toEqual({
            multiplier: true,
            stake: true,
            risk_management: true,
        });
    });

    it('should return correct object with keys for Multipliers if symbol starts with "cry"', () => {
        expect(getTradeParams('crypto')[TRADE_TYPES.MULTIPLIER]).toEqual({
            multiplier: true,
            stake: true,
            risk_management: true,
            expiration: true,
        });
    });
});

describe('isDigitContractWinning', () => {
    it('should return false if contract_type is not defined', () => {
        expect(isDigitContractWinning(undefined, null, null)).toBeFalsy();
    });

    it('should return false if contract_type is not digit type', () => {
        expect(isDigitContractWinning(CONTRACT_TYPES.TURBOS.LONG, null, null)).toBeFalsy();
    });

    it('should return true for Matches if current_digit === selected_digit and false if they are not equal', () => {
        expect(isDigitContractWinning(CONTRACT_TYPES.MATCH_DIFF.MATCH, 1, 1)).toBeTruthy();
        expect(isDigitContractWinning(CONTRACT_TYPES.MATCH_DIFF.MATCH, 1, 2)).toBeFalsy();
    });

    it('should return true for Differs if current_digit !== selected_digit and false if they are equal', () => {
        expect(isDigitContractWinning(CONTRACT_TYPES.MATCH_DIFF.DIFF, 1, 1)).toBeFalsy();
        expect(isDigitContractWinning(CONTRACT_TYPES.MATCH_DIFF.DIFF, 1, 2)).toBeTruthy();
    });

    it('should return true for Over if current_digit and selected_digit are not null and current_digit > selected_digit. In the rest cases should return false', () => {
        expect(isDigitContractWinning(CONTRACT_TYPES.OVER_UNDER.OVER, 1, 2)).toBeTruthy();
        expect(isDigitContractWinning(CONTRACT_TYPES.OVER_UNDER.OVER, null, null)).toBeFalsy();
        expect(isDigitContractWinning(CONTRACT_TYPES.OVER_UNDER.OVER, 0, 0)).toBeFalsy();
        expect(isDigitContractWinning(CONTRACT_TYPES.OVER_UNDER.OVER, 2, 1)).toBeFalsy();
        expect(isDigitContractWinning(CONTRACT_TYPES.OVER_UNDER.OVER, 2, 2)).toBeFalsy();
    });

    it('should return true for Under if current_digit and selected_digit are not null and current_digit < selected_digit. In the rest cases should return false', () => {
        expect(isDigitContractWinning(CONTRACT_TYPES.OVER_UNDER.UNDER, 2, 1)).toBeTruthy();
        expect(isDigitContractWinning(CONTRACT_TYPES.OVER_UNDER.UNDER, null, null)).toBeFalsy();
        expect(isDigitContractWinning(CONTRACT_TYPES.OVER_UNDER.UNDER, 0, 0)).toBeFalsy();
        expect(isDigitContractWinning(CONTRACT_TYPES.OVER_UNDER.UNDER, 1, 2)).toBeFalsy();
        expect(isDigitContractWinning(CONTRACT_TYPES.OVER_UNDER.UNDER, 2, 2)).toBeFalsy();
    });

    it('should return true for Odd if current_digit is not null and it has an odd value', () => {
        expect(isDigitContractWinning(CONTRACT_TYPES.EVEN_ODD.ODD, null, 1)).toBeTruthy();
        expect(isDigitContractWinning(CONTRACT_TYPES.EVEN_ODD.ODD, null, null)).toBeFalsy();
        expect(isDigitContractWinning(CONTRACT_TYPES.EVEN_ODD.ODD, null, 2)).toBeFalsy();
        expect(isDigitContractWinning(CONTRACT_TYPES.EVEN_ODD.ODD, null, 0)).toBeFalsy();
    });

    it('should return true for Even if current_digit is not null and it has an even value or 0', () => {
        expect(isDigitContractWinning(CONTRACT_TYPES.EVEN_ODD.EVEN, null, 2)).toBeTruthy();
        expect(isDigitContractWinning(CONTRACT_TYPES.EVEN_ODD.EVEN, null, 0)).toBeTruthy();
        expect(isDigitContractWinning(CONTRACT_TYPES.EVEN_ODD.EVEN, null, null)).toBeFalsy();
        expect(isDigitContractWinning(CONTRACT_TYPES.EVEN_ODD.EVEN, null, 1)).toBeFalsy();
    });
});

describe('focusAndOpenKeyboard', () => {
    it('should apply focus to the passed ReactElement', async () => {
        jest.useFakeTimers();

        const MockComponent = () => {
            const input_ref = React.useRef<HTMLInputElement>(null);
            const focused_input_ref = React.useRef<HTMLInputElement>(null);

            return (
                <React.Fragment>
                    <input type='number' ref={input_ref} />
                    <button onClick={() => focusAndOpenKeyboard(focused_input_ref.current, input_ref.current)}>
                        Focus
                    </button>
                    <input ref={focused_input_ref} style={{ height: 0, opacity: 0, display: 'none' }} />
                </React.Fragment>
            );
        };

        render(<MockComponent />);

        const input = screen.getByRole('spinbutton');
        expect(input).not.toHaveFocus();

        await userEvent.click(screen.getByText('Focus'));

        jest.runAllTimers();

        expect(input).toHaveFocus();
    });
});

describe('getTradeTypeTabsList', () => {
    it('should return correct tabs list for Turbos', () => {
        expect(getTradeTypeTabsList(TRADE_TYPES.TURBOS.SHORT)).toEqual([
            {
                label: 'Up',
                value: TRADE_TYPES.TURBOS.LONG,
                contract_type: CONTRACT_TYPES.TURBOS.LONG,
                is_displayed: true,
            },
            {
                label: 'Down',
                value: TRADE_TYPES.TURBOS.SHORT,
                contract_type: CONTRACT_TYPES.TURBOS.SHORT,
                is_displayed: true,
            },
        ]);
    });

    it('should return correct tabs list for Vanillas', () => {
        expect(getTradeTypeTabsList(TRADE_TYPES.VANILLA.CALL)).toEqual([
            {
                label: 'Call',
                value: TRADE_TYPES.VANILLA.CALL,
                contract_type: CONTRACT_TYPES.VANILLA.CALL,
                is_displayed: true,
            },
            {
                label: 'Put',
                value: TRADE_TYPES.VANILLA.PUT,
                contract_type: CONTRACT_TYPES.VANILLA.PUT,
                is_displayed: true,
            },
        ]);
    });

    it('should return correct tabs list for Higher/Lower', () => {
        expect(getTradeTypeTabsList(TRADE_TYPES.HIGH_LOW)).toEqual([
            {
                label: 'Higher',
                value: TRADE_TYPES.HIGH_LOW,
                contract_type: CONTRACT_TYPES.CALL,
                is_displayed: true,
            },
            {
                label: 'Lower',
                value: TRADE_TYPES.HIGH_LOW,
                contract_type: CONTRACT_TYPES.PUT,
                is_displayed: true,
            },
        ]);
    });

    it('should return correct tabs list for Touch/No Touch', () => {
        expect(getTradeTypeTabsList(TRADE_TYPES.TOUCH)).toEqual([
            {
                label: 'Touch',
                value: TRADE_TYPES.TOUCH,
                contract_type: CONTRACT_TYPES.TOUCH.ONE_TOUCH,
                is_displayed: true,
            },
            {
                label: 'No Touch',
                value: TRADE_TYPES.TOUCH,
                contract_type: CONTRACT_TYPES.TOUCH.NO_TOUCH,
                is_displayed: true,
            },
        ]);
    });
});

describe('isSmallScreen', () => {
    const original_height = window.innerHeight;

    it('should return true if window.innerHeight is less or equal to 640', () => {
        window.innerHeight = 640;
        expect(isSmallScreen()).toBe(true);
    });

    it('should return false if window.innerHeight is more than 640', () => {
        window.innerHeight = 700;
        expect(isSmallScreen()).toBe(false);
    });

    window.innerHeight = original_height;
});

describe('addUnit', () => {
    it('should return correct string', () => {
        expect(addUnit({ value: 30 })).toBe('30 min');
        expect(addUnit({ value: '15' })).toBe('15 min');
        expect(addUnit({ value: '15', unit: 'minutes' })).toBe('15 minutes');
        expect(addUnit({ value: '15', unit: 'm', should_add_space: false })).toBe('15m');
    });
});

describe('getSnackBarText', () => {
    it('should return correct string if switching_cancellation, has_cancellation, has_take_profit and has_stop_loss are true', () => {
        render(
            <div>
                {getSnackBarText({
                    has_cancellation: true,
                    has_take_profit: true,
                    has_stop_loss: true,
                    switching_cancellation: true,
                })}
            </div>
        );

        expect(screen.getByText('TP and SL have been turned off.')).toBeInTheDocument();
    });

    it('should return correct string if switching_cancellation === true, has_cancellation === true, has_take_profit === true and has_stop_loss === false', () => {
        render(
            <div>
                {getSnackBarText({
                    has_cancellation: true,
                    has_take_profit: true,
                    has_stop_loss: false,
                    switching_cancellation: true,
                })}
            </div>
        );

        expect(screen.getByText('TP has been turned off.')).toBeInTheDocument();
    });

    it('should return correct string if switching_cancellation === true, has_cancellation === true, has_take_profit === false and has_stop_loss === true', () => {
        render(
            <div>
                {getSnackBarText({
                    has_cancellation: true,
                    has_take_profit: false,
                    has_stop_loss: true,
                    switching_cancellation: true,
                })}
            </div>
        );

        expect(screen.getByText('SL has been turned off.')).toBeInTheDocument();
    });

    it('should return correct string if switching_tp_sl === true, has_cancellation === true, has_take_profit === true and has_stop_loss === false', () => {
        render(
            <div>
                {getSnackBarText({
                    has_cancellation: true,
                    has_take_profit: true,
                    has_stop_loss: false,
                    switching_tp_sl: true,
                })}
            </div>
        );

        expect(screen.getByText('DC has been turned off.')).toBeInTheDocument();
    });

    it('should return correct string if switching_tp_sl === true, has_cancellation === true, has_take_profit === false and has_stop_loss === true', () => {
        render(
            <div>
                {getSnackBarText({
                    has_cancellation: true,
                    has_take_profit: false,
                    has_stop_loss: true,
                    switching_tp_sl: true,
                })}
            </div>
        );

        expect(screen.getByText('DC has been turned off.')).toBeInTheDocument();
    });
});

describe('getOptionPerUnit', () => {
    const renderOptions = (options: { value: number; label: React.ReactNode }[]) => {
        return options.map(option => {
            if (React.isValidElement(option.label)) {
                const { container } = render(option.label as ReactElement);
                return container.textContent;
            }
            return '';
        });
    };

    const duration_min_max = {
        intraday: { min: 900, max: 3600 },
        tick: { min: 5, max: 10 },
        daily: { min: 86400, max: 31536000 },
    };

    test('returns correct options for minutes (m)', () => {
        const result = getOptionPerUnit('m', duration_min_max);
        const view = renderOptions(result[0]);
        expect(result).toHaveLength(1);
        expect(view).toEqual([...Array(45)].map((_, i) => `${i + 15} min`));
    });

    test('returns correct options for days (d)', () => {
        const result = getOptionPerUnit('d', duration_min_max);
        const view = renderOptions(result[0]);
        expect(result).toHaveLength(1);
        expect(view).toEqual([...Array(365)].map((_, i) => `${i + 1} days`));
    });

    test('returns correct options for ticks (t)', () => {
        const result = getOptionPerUnit('t', duration_min_max);
        const view = renderOptions(result[0]);
        expect(result).toHaveLength(1);
        expect(view).toEqual([...Array(6)].map((_, i) => `${i + 5} ticks`));
    });

    test('returns correct options for ticks (t) when 5 ticks are required', () => {
        const modifiedDuration = { ...duration_min_max, tick: { min: 1, max: 10 } };
        const result = getOptionPerUnit('t', modifiedDuration);
        const view = renderOptions(result[0]);
        expect(result).toHaveLength(1);
        expect(view).toEqual([...Array(10)].map((_, i) => `${i + 1} ${i + 1 > 1 ? 'ticks' : 'tick'}`));
    });
});

describe('getSmallestDuration', () => {
    const durationUnits = [
        { value: 's', text: 'Seconds' },
        { value: 'm', text: 'Minutes' },
        { value: 'h', text: 'Hours' },
        { value: 'd', text: 'Days' },
        { value: 't', text: 'Ticks' },
    ];

    it('should return tick duration when "tick" exists in object', () => {
        const obj = { tick: { min: 5 } };
        const result = getSmallestDuration(obj, durationUnits);
        expect(result).toEqual({ value: 5, unit: 't' });
    });

    it('should return the smallest intraday duration in minutes', () => {
        const obj = { intraday: { min: 300 } };
        const result = getSmallestDuration(obj, durationUnits);
        expect(result).toEqual({ value: 5, unit: 'm' });
    });

    it('should return the smallest intraday duration in hours', () => {
        const obj = { intraday: { min: 7200 } };
        const result = getSmallestDuration(obj, durationUnits);
        expect(result).toEqual({ value: 2, unit: 'h' });
    });

    it('should return the smallest daily duration', () => {
        const obj = { daily: { min: 86400 } };
        const result = getSmallestDuration(obj, durationUnits);
        expect(result).toEqual({ value: 1, unit: 'd' });
    });

    it('should return null if no valid smallest unit is found', () => {
        const obj = {};
        const result = getSmallestDuration(obj, durationUnits);
        expect(result).toBeNull();
    });
});

describe('getDatePickerStartDate', () => {
    const duration_min_max = {
        daily: { min: 86400, max: 172800 },
    };

    const durationUnits = [
        { value: 'm', text: 'Minutes' },
        { value: 'h', text: 'Hours' },
        { value: 'd', text: 'Days' },
    ];

    beforeAll(() => {
        jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2024-10-08T08:00:00Z').getTime());
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should return the minimum date considering intraday duration', () => {
        const start_time = null;
        const result = getDatePickerStartDate(durationUnits, moment(), start_time, duration_min_max);
        expect(result).toBeInstanceOf(Date);
        expect(result.toISOString()).toContain('2024-10-08');
    });

    it('should set the correct time when a start time is provided', () => {
        const start_time = '12:30:00';
        const result = getDatePickerStartDate(durationUnits, moment(), start_time, duration_min_max);
        expect(result).toBeInstanceOf(Date);
        expect(result.getHours()).toBe(12);
        expect(result.getMinutes()).toBe(30);
    });

    it('should add min duration to the current time when no intraday duration exists', () => {
        const nonIntradayUnits = [{ value: 'd', text: 'Days' }];
        const result = getDatePickerStartDate(nonIntradayUnits, moment(), null, duration_min_max);
        expect(result).toBeInstanceOf(Date);
        expect(result.toISOString()).toContain('2024-10-09');
    });
});

describe('getProposalRequestObject', () => {
    const trade = mockStore({}).modules.trade;

    const trade_store = {
        ...trade,
        onChange: jest.fn(),
        duration: 30,
        duration_unit: 'm',
        expiry_type: 'duration',
        symbol: 'R_100',
    };

    const new_values = {
        duration: '10t',
        amount: 20,
    };

    it('should merge new values into trade_store and create a proposal request object', () => {
        const result = getProposalRequestObject({
            new_values,
            trade_store,
            trade_type: 'CALL',
        });
        expect(result).toEqual(
            expect.objectContaining({
                amount: 20,
                barrier: 5,
                basis: '',
                contract_type: 'CALL',
                currency: '',
                duration: 10,
                duration_unit: 'm',
                limit_order: undefined,
                proposal: 1,
                symbol: 'R_100',
            })
        );
    });

    it('should include subscribe field when should_subscribe is true', () => {
        const result = getProposalRequestObject({
            new_values,
            should_subscribe: true,
            trade_store,
            trade_type: 'CALL',
        });
        expect(result.subscribe).toBe(1);
    });

    it('should not include subscribe field when should_subscribe is false', () => {
        const result = getProposalRequestObject({
            new_values,
            should_subscribe: false,
            trade_store,
            trade_type: 'CALL',
        });
        expect(result.subscribe).toBeUndefined();
    });
});

describe('getProposalRequestObject', () => {
    let default_mock_store: ReturnType<typeof mockStore>, mocked_args: Parameters<typeof getProposalRequestObject>[0];

    beforeEach(() => {
        default_mock_store = mockStore({
            modules: {
                trade: {
                    ...mockStore({}).modules.trade,
                    amount: '10',
                    basis: 'stake',
                    currency: 'USD',
                    contract_type: TRADE_TYPES.TURBOS.LONG,
                    symbol: '1HZ100V',
                },
            },
        });
        mocked_args = {
            new_values: {
                has_take_profit: true,
                take_profit: '5',
            },
            trade_store: default_mock_store.modules.trade,
            trade_type: TRADE_TYPES.TURBOS.LONG,
        };
    });

    it('should return correct object for proposal for Turbos with TP', () => {
        expect(getProposalRequestObject(mocked_args)).toEqual({
            proposal: 1,
            amount: 10,
            basis: 'stake',
            contract_type: TRADE_TYPES.TURBOS.LONG,
            currency: 'USD',
            underlying_symbol: '1HZ100V',
            symbol: '1HZ100V',
            payout_per_point: 5,
            limit_order: { take_profit: 5 },
        });
    });

    it('should return correct object for proposal for Turbos without TP', () => {
        mocked_args.new_values.has_take_profit = false;
        mocked_args.new_values.take_profit = '';

        expect(getProposalRequestObject(mocked_args)).toEqual({
            proposal: 1,
            amount: 10,
            basis: 'stake',
            contract_type: TRADE_TYPES.TURBOS.LONG,
            currency: 'USD',
            underlying_symbol: '1HZ100V',
            symbol: '1HZ100V',
            payout_per_point: 5,
            limit_order: undefined,
        });
    });

    it('should return correct object for proposal for Multipliers with SL', () => {
        default_mock_store.modules.trade.contract_type = TRADE_TYPES.MULTIPLIER;
        mocked_args = {
            new_values: {
                has_stop_loss: true,
                stop_loss: '5',
            },
            trade_store: default_mock_store.modules.trade,
            trade_type: TRADE_TYPES.MULTIPLIER,
        };

        expect(getProposalRequestObject(mocked_args)).toEqual({
            proposal: 1,
            amount: 10,
            basis: 'stake',
            contract_type: 'multiplier',
            currency: 'USD',
            underlying_symbol: '1HZ100V',
            symbol: '1HZ100V',
            barrier: 5,
            limit_order: { stop_loss: 5 },
            multiplier: 0,
            cancellation: undefined,
        });
    });

    it('should return correct object for proposal for Multipliers with SL if user have not typed anything', () => {
        default_mock_store.modules.trade.contract_type = TRADE_TYPES.MULTIPLIER;
        mocked_args = {
            new_values: {
                has_stop_loss: true,
                stop_loss: '1',
            },
            trade_store: default_mock_store.modules.trade,
            trade_type: TRADE_TYPES.MULTIPLIER,
        };

        expect(getProposalRequestObject(mocked_args)).toEqual({
            proposal: 1,
            amount: 10,
            basis: 'stake',
            contract_type: 'multiplier',
            currency: 'USD',
            underlying_symbol: '1HZ100V',
            symbol: '1HZ100V',
            barrier: 5,
            limit_order: { stop_loss: 1 },
            multiplier: 0,
            cancellation: undefined,
        });
    });

    it('should return correct object for proposal for Multipliers with SL if should_subscribe === true', () => {
        default_mock_store.modules.trade.contract_type = TRADE_TYPES.MULTIPLIER;
        mocked_args = {
            new_values: {
                has_stop_loss: true,
                stop_loss: '5',
            },
            should_subscribe: true,
            trade_store: default_mock_store.modules.trade,
            trade_type: TRADE_TYPES.MULTIPLIER,
        };

        expect(getProposalRequestObject(mocked_args)).toEqual({
            proposal: 1,
            subscribe: 1,
            amount: 10,
            basis: 'stake',
            contract_type: 'multiplier',
            currency: 'USD',
            symbol: '1HZ100V',
            underlying_symbol: '1HZ100V',
            barrier: 5,
            limit_order: { stop_loss: 5 },
            multiplier: 0,
            cancellation: undefined,
        });
    });
});

describe('getPayoutInfo', () => {
    it('returns contract payout, max payout and empty string instead of error if proposal does not contain error', () => {
        const proposal_info = {
            has_error: false,
            has_error_details: false,
            payout: 19.53,
            profit: '9.53',
            stake: '10.00',
            validation_params: {
                payout: {
                    max: '80000.00',
                },
                stake: {
                    min: '0.50',
                },
            },
        } as ReturnType<typeof getProposalInfo>;

        expect(getPayoutInfo(proposal_info)).toEqual({ contract_payout: 19.53, max_payout: '80000.00', error: '' });
    });

    it('returns contract payout, max payout equal to 0 if proposal_info was empty', () => {
        expect(getPayoutInfo({} as ReturnType<typeof getProposalInfo>)).toEqual({
            contract_payout: 0,
            max_payout: 0,
            error: '',
        });
    });

    it('returns contract payout, max payout equal to 0 if proposal_info was not defined', () => {
        expect(getPayoutInfo(undefined as unknown as ReturnType<typeof getProposalInfo>)).toEqual({
            contract_payout: 0,
            max_payout: 0,
            error: '',
        });
    });

    it('returns contract payout and max payout values, extracted from error text if it is in proposal_info and has amount field', () => {
        const proposal_info = {
            id: '',
            has_error: true,
            has_error_details: true,
            error_code: 'ContractBuyValidationError',
            error_field: 'amount',
            message: 'Minimum stake of 0.35 and maximum payout of 5000.00. Current payout is 31263.39.',
        };

        expect(getPayoutInfo(proposal_info as ReturnType<typeof getProposalInfo>)).toEqual({
            contract_payout: 31263.39,
            max_payout: 5000,
            error: 'Minimum stake of 0.35 and maximum payout of 5000.00. Current payout is 31263.39.',
        });
    });

    it('returns contract payout and max payout values, extracted from error text if it is in proposal_info and has stake field', () => {
        const proposal_info = {
            id: '',
            has_error: true,
            has_error_details: true,
            error_code: 'ContractBuyValidationError',
            error_field: 'stake',
            message: 'Minimum stake of 0.35 and maximum payout of 5000.00. Current payout is 31263.39.',
        };

        expect(getPayoutInfo(proposal_info as ReturnType<typeof getProposalInfo>)).toEqual({
            contract_payout: 31263.39,
            max_payout: 5000,
            error: 'Minimum stake of 0.35 and maximum payout of 5000.00. Current payout is 31263.39.',
        });
    });
});
