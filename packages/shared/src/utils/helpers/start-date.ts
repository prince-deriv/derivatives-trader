import moment from 'moment';
import { toMoment } from '../date';
import { ContractsFor } from '@deriv/api-types';

type TConfig = {
    text: string;
    value: number;
    sessions: {
        open: moment.Moment;
        close: moment.Moment;
    }[];
}[];

export const buildForwardStartingConfig = (
    contract: ContractsFor['available'][number],
    forward_starting_dates?: TConfig
) => {
    const forward_starting_config: TConfig = [];

    // forward_starting_options property has been removed from the API
    // This function now returns the fallback forward_starting_dates or empty config
    // since forward starting options are no longer provided by the API

    return forward_starting_dates || [];
};
