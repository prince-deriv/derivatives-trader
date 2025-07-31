import useInvalidateQuery from '../useInvalidateQuery';
import useMutation from '../useMutation';
import useQuery from '../useQuery';
import { useStore } from '@deriv/stores';

type TSetSettingsPayload = NonNullable<
    NonNullable<NonNullable<Parameters<ReturnType<typeof useMutation<'set_settings'>>['mutate']>>[0]>['payload']
>;

/** A custom hook to get and update the user settings. */
const useSettings = () => {
    const {
        client: { is_authorize },
    } = useStore();
    const { data, ...rest } = useQuery('get_settings', { options: { enabled: is_authorize } });
    const { mutate, ...mutate_rest } = useMutation('set_settings', { onSuccess: () => invalidate('get_settings') });
    const invalidate = useInvalidateQuery();

    const update = (payload: TSetSettingsPayload) => mutate({ payload });

    return {
        /** The settings response. */
        data: data?.get_settings,
        /** Function to update user settings */
        update,
        invalidate,
        /** The mutation related information */
        mutation: mutate_rest,
        ...rest,
    };
};

export default useSettings;
