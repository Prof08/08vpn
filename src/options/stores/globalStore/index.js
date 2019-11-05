import {
    action,
    computed,
    observable,
} from 'mobx';

import { REQUEST_STATUSES } from '../consts';

// TODO remove unused
class globalStore {
    @observable initStatus = REQUEST_STATUSES.PENDING;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action
    async getPopupData(retryNum = 1) {
        const { rootStore: { vpnStore, settingsStore } } = this;

        this.setInitStatus(REQUEST_STATUSES.PENDING);

        try {
            let popupData;

            if (retryNum > 1) {
                popupData = await adguard.popupData.getPopupDataRetry(retryNum);
            } else {
                popupData = await adguard.popupData.getPopupData();
            }

            const {
                vpnInfo,
                endpoints,
                selectedEndpoint,
                permissionsError,
            } = popupData;

            if (permissionsError) {
                settingsStore.setGlobalError(permissionsError);
            }

            vpnStore.setVpnInfo(vpnInfo);
            vpnStore.setEndpoints(endpoints);
            vpnStore.setSelectedEndpoint(selectedEndpoint);
            this.setInitStatus(REQUEST_STATUSES.DONE);
        } catch (e) {
            this.setInitStatus(REQUEST_STATUSES.ERROR);
        }
    }

    @action
    async init() {
        await this.getPopupData();
    }

    @action
    setInitStatus(status) {
        this.initStatus = status;
    }

    @computed
    get status() {
        return this.initStatus;
    }
}

export default globalStore;
