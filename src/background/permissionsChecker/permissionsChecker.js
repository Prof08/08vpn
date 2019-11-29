import throttle from 'lodash/throttle';
import credentials from '../credentials';
import log from '../../lib/logger';
import { ERROR_STATUSES } from '../../lib/constants';
import permissionsError from './permissionsError';

const CHECK_THROTTLE_TIMEOUT_MS = 60 * 1000;

const updatePermissionsErrorHandler = (error) => {
    log.error('Permissions were not updated due to:', error.message);
    // do not consider network error as a reason to set permission error
    if (error.status === ERROR_STATUSES.NETWORK_ERROR) {
        return;
    }
    permissionsError.setError(error);
};

const checkPermissions = async () => {
    try {
        await credentials.getVpnTokenRemote();
        await credentials.gainVpnCredentials(true);
        // if no error, clear permissionError
        permissionsError.clearError();
        log.info('Permissions were updated successfully');
    } catch (e) {
        updatePermissionsErrorHandler(e);
    }
};

const throttledCheckPermissions = throttle(checkPermissions, CHECK_THROTTLE_TIMEOUT_MS);

const scheduleCheck = () => {
    const TIME_CHECK_INTERVAL_MS = 5 * 1000; // 5 sec
    const RUN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

    let prevCheck = Date.now();

    setInterval(() => {
        const currTime = Date.now();
        if (currTime >= prevCheck + RUN_INTERVAL_MS) {
            throttledCheckPermissions();
            prevCheck += RUN_INTERVAL_MS;
        }
    }, TIME_CHECK_INTERVAL_MS);
};

/**
 * Listens to connection state change
 * When browser comes online, updates permissions
 */
const handleConnectionChange = () => {
    window.addEventListener('online', async () => {
        log.info('Browser connections is online...');
        throttledCheckPermissions();
    });
};

const init = () => {
    log.info('Permissions updater was initiated');
    scheduleCheck();
    handleConnectionChange();
};

const permissionsChecker = {
    init,
    checkPermissions,
};

export default permissionsChecker;
