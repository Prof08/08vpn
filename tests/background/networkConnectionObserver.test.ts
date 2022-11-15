import networkConnectionObserver from '../../src/background/actions';

jest.mock('../../src/background/networkConnectionObserver');

describe('Network Connection Observer tests', () => {
    it('Get online status', () => {
        dispatchEvent(new Event('online'));
        const isOnlineStatus = networkConnectionObserver.isOnline();

        expect(isOnlineStatus).toBeTruthy();
    });

    it('Get offline status', () => {
        dispatchEvent(new Event('offline'));
        const isOnlineStatus = networkConnectionObserver.isOnline();

        expect(isOnlineStatus).toBeFalsy();
    });
});
