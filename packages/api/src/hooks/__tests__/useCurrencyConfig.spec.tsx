import { renderHook } from '@testing-library/react-hooks';
import useCurrencyConfig from '../useCurrencyConfig';
import { withMockAPIProvider } from '../mocks';
import useQuery from '../../useQuery';

jest.mock('../../useQuery', () => jest.fn());

const mockUseQuery = useQuery as jest.MockedFunction<any>;
describe('useCurrencyConfig', () => {
    test("should return undefined if the currency doesn't exist in currencies_config", () => {
        mockUseQuery.mockReturnValue({} as any);

        const wrapper = withMockAPIProvider();

        const { result } = renderHook(() => useCurrencyConfig(), { wrapper });

        expect(result.current.getConfig('USD')).toBe(undefined);
    });

    test('should return currency config object for the given currency', () => {
        mockUseQuery.mockReturnValue({
            data: {
                website_status: {
                    currencies_config: {
                        USD: {
                            type: 'fiat',
                            name: 'US Dollar',
                        },
                    },
                },
            },
        } as any);

        const wrapper = withMockAPIProvider();

        const { result } = renderHook(() => useCurrencyConfig(), { wrapper });

        expect(result.current.getConfig('USD')?.code).toBe('USD');
        expect(result.current.getConfig('USD')?.icon).toBe('IcCurrencyUsd');
        expect(result.current.getConfig('USD')?.is_fiat).toBe(true);
        expect(result.current.getConfig('USD')?.is_crypto).toBe(false);
        expect(result.current.getConfig('USD')?.is_USD).toBe(true);
    });
});
