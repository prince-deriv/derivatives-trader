import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DurationToggle from '../duration-toggle';

jest.mock('@deriv/components', () => {
    return {
        ...jest.requireActual('@deriv/components'),
        Icon: jest.fn(() => <div>MockedIcon</div>),
    };
});
describe('<DurationToggle />', () => {
    let mocked_props: React.ComponentProps<typeof DurationToggle>;
    beforeEach(() => {
        mocked_props = {
            name: 'test_input',
            onChange: jest.fn(),
            value: false,
        };
    });

    it('Should render toggle button', () => {
        render(<DurationToggle {...mocked_props} />);
        const toggle_button = screen.getByLabelText('Toggle between advanced and simple duration settings');
        expect(toggle_button).toBeInTheDocument();
        expect(toggle_button).toHaveClass('advanced-simple-toggle');
        expect(screen.getByText('MockedIcon')).toBeInTheDocument();
    });
    it('Should call onChange when button is clicked', async () => {
        render(<DurationToggle {...mocked_props} />);
        await userEvent.click(screen.getByLabelText('Toggle between advanced and simple duration settings'));
        expect(mocked_props.onChange).toHaveBeenCalledWith({ target: { name: 'test_input', value: true } });
    });
});
