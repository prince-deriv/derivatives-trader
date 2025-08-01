import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { mockStore } from '@deriv/stores';
import { useDevice } from '@deriv-com/ui';
import { render, screen } from '@testing-library/react';

import TraderProviders from '../../../../trader-providers';
import ContractReplay from '../contract-replay';

jest.mock('@deriv-com/ui', () => ({
    ...jest.requireActual('@deriv-com/ui'),
    useDevice: jest.fn(() => ({ isMobile: false })),
}));

jest.mock('@deriv/components', () => ({
    ...jest.requireActual('@deriv/components'),
    FadeWrapper: jest.fn(({ children }) => <div>{children}</div>),
    UnsupportedContractModal: jest.fn(() => <div>UnsupportedContractModal</div>),
    PageOverlay: jest.fn(({ children, id, header }) => (
        <div data-testid={id}>
            {header}
            {children}
        </div>
    )),
    Div100vhContainer: jest.fn(({ children }) => <div>{children}</div>),
    ContractDrawer: jest.fn(() => <div>ContractDrawer</div>),
}));

jest.mock('../contract-replay-widget', () => ({
    DigitsWidget: jest.fn(() => <div>DigitsWidget</div>),
    InfoBoxWidget: jest.fn(() => <div>InfoBoxWidget</div>),
}));

jest.mock('../replay-chart', () => jest.fn(() => <div>ReplayChart</div>));

jest.mock('@deriv/api', () => ({
    ...jest.requireActual('@deriv/api'),
    useFeatureFlags: jest.fn(() => ({})),
}));

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
}));

const MockContractReplay = ({ store }: { store?: any }) => {
    const history = createMemoryHistory();
    history.push('/contract/123');

    return (
        <TraderProviders store={store}>
            <Router history={history}>
                <ContractReplay contract_id={123} />
            </Router>
        </TraderProviders>
    );
};

describe('<ContractReplay>', () => {
    const mocked_store = mockStore({
        contract_replay: {
            contract_store: {
                contract_info: {
                    underlying: '1HZ100V',
                    contract_type: 'VANILLA',
                },
            },
            is_market_closed: false,
            is_sell_requested: false,
            onClickCancel: jest.fn(),
            onClickSell: jest.fn(),
            onMount: jest.fn(),
            onUnmount: jest.fn(),
            is_chart_loading: false,
            is_forward_starting: false,
        },
        ui: { notification_messages_ui: 'div' },
    });

    it('renders the ContractReplay component with basic structure', () => {
        render(<MockContractReplay store={mocked_store} />);

        expect(screen.getByText('Contract details')).toBeInTheDocument();
        expect(screen.getByTestId('dt_replay_chart_container')).toBeInTheDocument();
        expect(screen.getByTestId('dt_contract_replay_container')).toBeInTheDocument();
    });

    it('shows ChartLoader while chart is loading', () => {
        mocked_store.contract_replay.is_chart_loading = true;

        render(<MockContractReplay store={mocked_store} />);

        expect(screen.getByTestId('dt_barspinner')).toBeInTheDocument();
    });

    it('renders DigitsWidget and SwipeableWrapper on Mobile for Digits contracts', () => {
        (useDevice as jest.Mock).mockReturnValue({ isMobile: true });

        mocked_store.contract_replay.contract_store.contract_info.contract_type = 'DIGITODD';
        mocked_store.contract_replay.contract_store.is_digit_contract = true;
        mocked_store.contract_replay.is_chart_loading = false;

        render(<MockContractReplay store={mocked_store} />);

        expect(screen.getByText('DigitsWidget')).toBeInTheDocument();
        expect(screen.getByTestId('dt_replay_chart_swipeable_wrapper')).toBeInTheDocument();
    });
});
