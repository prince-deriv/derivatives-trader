import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import APIProvider from '../../APIProvider';
import useNotificationEvent from '../useNotificationEvent';
import useMutation from '../../useMutation';

type TNotificationPayload = Parameters<ReturnType<typeof useNotificationEvent>['send']>[0];

jest.mock('../../useMutation', () => jest.fn());

const mockUseMutation = useMutation as jest.MockedFunction<any>;

describe('useNotificationEvent', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return the notification event', async () => {
        mockUseMutation.mockReturnValueOnce({
            data: {
                notification_event: 1,
            },
            mutate: jest.fn(),
        });
        const payload: TNotificationPayload = {
            category: 'authentication',
            event: 'poi_documents_uploaded',
            args: {
                documents: ['123', 'abc'],
            },
        };

        const wrapper = ({ children }: { children: JSX.Element }) => <APIProvider>{children}</APIProvider>;
        const { result, waitFor } = renderHook(() => useNotificationEvent(), { wrapper });

        result.current.send(payload);

        await waitFor(() => result.current.isSuccess, { timeout: 10000 });

        expect(result.current.notification_event).toEqual(1);
    });
});
