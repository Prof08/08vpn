import { networkConnectionObserver } from '../../src/background/networkConnectionObserver';
import permissionsChecker from '../../src/background/permissionsChecker';
import { connectivityService } from '../../src/background/connectivity/connectivityService/connectivityFSM';

jest.spyOn(permissionsChecker, 'checkPermissions');
const spyConnectivityService = jest.spyOn(connectivityService, 'send');

// jest.mock('../../src/background/connectivity');

describe('Network Connection Observer tests', () => {
    it('Get online status', async () => {
        dispatchEvent(new Event('online'));
        const isOnlineStatus = networkConnectionObserver.isOnline();
        expect(isOnlineStatus).toBeTruthy();

        expect(permissionsChecker.checkPermissions).toBeCalledTimes(1);
        const xxx = spyConnectivityService.mock;
        debugger
        const promise = spyConnectivityService.mock.results[0].value;
        await promise;  // <= await the Promise
        expect(connectivityService.send).toBeCalledTimes(1);
    });

    it('Get offline status', () => {
        dispatchEvent(new Event('offline'));
        const isOnlineStatus = networkConnectionObserver.isOnline();

        expect(isOnlineStatus).toBe(false);

        expect(permissionsChecker.checkPermissions).toBeCalledTimes(1);
        expect(connectivityService.send).toBeCalledTimes(0);
    });
});
