import {
    action,
    computed,
    observable,
} from 'mobx';

import { REQUEST_STATUSES } from '../consts';
import log from '../../../lib/logger';
import tabs from '../../../background/tabs';

class globalStore {
    @observable initStatus = REQUEST_STATUSES.PENDING;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action
    async getPopupData(retryNum = 1) {
        const { rootStore: { vpnStore, settingsStore, authStore } } = this;

        this.setInitStatus(REQUEST_STATUSES.PENDING);

        // Used tab api because calling tab api from background returns wrong result
        const currentTab = await tabs.getCurrent();

        try {
            let popupData;

            if (retryNum > 1) {
                popupData = await adguard.popupData.getPopupDataRetry(currentTab.url, retryNum);
            } else {
                popupData = await adguard.popupData.getPopupData(currentTab.url);
            }

            const {
                vpnInfo,
                endpoints,
                selectedEndpoint,
                permissionsError,
                isAuthenticated,
                canControlProxy,
                isProxyEnabled,
                isRoutable,
            } = popupData;

            if (!isAuthenticated) {
                authStore.setIsAuthenticated(isAuthenticated);
                this.setInitStatus(REQUEST_STATUSES.DONE);
                return;
            }

            if (permissionsError) {
                settingsStore.setGlobalError(permissionsError);
            }

            authStore.setIsAuthenticated(isAuthenticated);
            vpnStore.setVpnInfo(vpnInfo);
            vpnStore.setEndpoints(endpoints);
            vpnStore.setSelectedEndpoint(selectedEndpoint);
            settingsStore.setProxyEnabledStatus(isProxyEnabled);
            settingsStore.setCanControlProxy(canControlProxy);
            settingsStore.setIsRoutable(isRoutable);
            await settingsStore.checkIsExcluded();
            this.setInitStatus(REQUEST_STATUSES.DONE);
        } catch (e) {
            log.error(e.message);
            this.setInitStatus(REQUEST_STATUSES.ERROR);
        }
    }

    @action
    async init() {
        await this.getPopupData(10);
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
