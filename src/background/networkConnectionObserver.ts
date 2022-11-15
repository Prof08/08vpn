import permissionsChecker from './permissionsChecker';
import { log } from '../lib/logger';
import { connectivityService } from './connectivity/connectivityService/connectivityFSM';
import { EVENT } from './connectivity/connectivityService/connectivityConstants';

interface NetworkConnectionObserver {
    isOnline: () => boolean;
}

/**
 * Module observes network state
 * When network connection becomes online it (module)
 * 1. Checks permissions
 * 2. Sends event to connectivity service FSM, to try to reconnect
 */
class NetworkConnectionObserver implements NetworkConnectionObserver {
    isOnlineStatus = false;

    constructor() {
        this.isOnlineStatus = false;
        window.addEventListener('online', this.connectionHandler);
        window.addEventListener('offline', this.connectionHandler);
    }

    connectionHandler = async (event: Event): Promise<void> => {
        const { type } = event;

        if (type === 'online') {
            this.isOnlineStatus = true;
            log.debug('Browser switched to online mode');
        }

        if (type === 'offline') {
            this.isOnlineStatus = false;
            log.debug('Browser switched to offline mode');
        }

        // always when connection is online we should check permissions
        await permissionsChecker.checkPermissions();

        // send event to WS connectivity service
        connectivityService.send(EVENT.NETWORK_ONLINE);
    };

    public isOnline = (): boolean => this.isOnlineStatus;
}

const networkConnectionObserver = new NetworkConnectionObserver();

export { networkConnectionObserver };
