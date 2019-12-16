import {
    action,
    computed,
    observable,
    runInAction,
} from 'mobx';

import tabs from '../../../background/tabs';
import log from '../../../lib/logger';
import { getHostname, getProtocol, formatBytes } from '../../../lib/helpers';
import { SETTINGS_IDS } from '../../../lib/constants';
import { REQUEST_STATUSES } from '../consts';

class SettingsStore {
    @observable switcherEnabled = false;

    @observable proxyEnabled = false;

    @observable proxyEnablingStatus = REQUEST_STATUSES.DONE;

    @observable canControlProxy = false;

    @observable gettingEndpointsState;

    @observable isExcluded;

    @observable currentTabHostname;

    @observable proxyStats;

    @observable ping = 0;

    @observable isRoutable = true;

    @observable globalError;

    @observable canBeExcluded = true;

    @observable exclusionsInverted;

    @action
    prohibitExclusion = () => {
        this.canBeExcluded = false;
    };

    @observable checkPermissionsState = REQUEST_STATUSES.DONE;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action
    getProxyPing = () => {
        this.ping = adguard.connectivity.getPing();
    };

    @action
    async checkProxyControl() {
        const { canControlProxy } = await adguard.appStatus.canControlProxy();
        runInAction(() => {
            this.canControlProxy = canControlProxy;
        });
    }

    @action
    setCanControlProxy = ({ canControlProxy }) => {
        this.canControlProxy = canControlProxy;
    };

    @action
    enableSwitcher = () => {
        this.switcherEnabled = true;
    };

    @action
    disableSwitcher = () => {
        this.switcherEnabled = false;
    };

    toggleSwitcher = (value) => {
        if (this.switcherEnabled !== value) {
            if (value) {
                this.enableSwitcher();
            } else {
                this.disableSwitcher();
            }
            return true;
        }
        return false;
    };

    @action
    async getGlobalProxyEnabled() {
        const value = adguard.settings.getSetting(SETTINGS_IDS.PROXY_ENABLED);
        runInAction(() => {
            this.proxyEnabled = value;
            this.toggleSwitcher(value);
        });
    }

    @action
    setProxyEnabledStatus(isProxyEnabled) {
        this.proxyEnabled = isProxyEnabled;
        this.toggleSwitcher(isProxyEnabled);
    }

    @action
    enableProxy = async () => {
        const flag = true;
        this.proxyEnablingStatus = REQUEST_STATUSES.PENDING;
        const changed = await adguard.settings.setSetting(SETTINGS_IDS.PROXY_ENABLED, flag);
        runInAction(() => {
            this.proxyEnablingStatus = REQUEST_STATUSES.DONE;
        });
        if (changed) {
            this.getProxyPing();
            await this.getProxyStats();
            runInAction(() => {
                this.proxyEnabled = flag;
            });
        }
        return changed;
    };

    @action
    disableProxy = async () => {
        const flag = false;
        const changed = await adguard.settings.setSetting(SETTINGS_IDS.PROXY_ENABLED, flag);
        runInAction(() => {
            this.proxyEnabled = flag;
        });
        return changed;
    };

    @action
    setProxyEnabled = (value) => {
        this.proxyEnabled = value;
    };

    @action
    setProxyState = async (value) => {
        let changed;
        const switched = this.toggleSwitcher(value);
        try {
            if (value) {
                changed = await this.enableProxy();
            } else {
                changed = await this.disableProxy();
            }
        } catch (e) {
            log.error(e.message);
            if (switched) {
                this.toggleSwitcher(!value);
            }
            return;
        }
        if (!changed && switched) {
            this.toggleSwitcher(!value);
        }
    };

    @action
    addToExclusions = async () => {
        try {
            await adguard.exclusions.current.addToExclusions(this.currentTabHostname);
            runInAction(() => {
                this.isExcluded = true;
            });
        } catch (e) {
            log.error(e);
        }
    };

    @action
    removeFromExclusions = async () => {
        try {
            await adguard.exclusions.current.disableExclusionByHostname(this.currentTabHostname);
            runInAction(() => {
                this.isExcluded = false;
            });
        } catch (e) {
            log.error(e);
        }
    };

    @action
    checkIsExcluded = async () => {
        try {
            await this.getCurrentTabHostname();
            const result = adguard.exclusions.current.isExcluded(this.currentTabHostname);
            runInAction(() => {
                this.isExcluded = result;
            });
        } catch (e) {
            log.error(e);
        }
    };

    @action
    areExclusionsInverted = () => {
        this.exclusionsInverted = adguard.exclusions.isInverted();
        return this.exclusionsInverted;
    };

    @action
    getCurrentTabHostname = async () => {
        try {
            const result = await tabs.getCurrent();
            const { url } = result;
            runInAction(() => {
                const hostname = getHostname(url);
                const protocol = getProtocol(url);
                this.currentTabHostname = hostname;

                switch (protocol) {
                    case 'https:':
                        break;
                    case 'http:':
                        break;
                    default:
                        this.prohibitExclusion();
                }
            });
        } catch (e) {
            log.error(e);
        }
    };

    @action
    getProxyStats = async () => {
        const stats = await adguard.connectivity.getStats();
        runInAction(() => {
            this.proxyStats = stats;
        });
    };

    @action
    setIsRoutable = (value) => {
        this.isRoutable = value;
    };

    @computed
    get stats() {
        let { bytesDownloaded, bytesUploaded } = this.proxyEnabled ? this.proxyStats || {} : {};
        bytesDownloaded = formatBytes(bytesDownloaded);
        bytesUploaded = formatBytes(bytesUploaded);
        return { bytesDownloaded, bytesUploaded };
    }

    @action
    setGlobalError(data) {
        this.globalError = data;
    }

    @computed
    get proxyIsEnabling() {
        return this.proxyEnablingStatus === REQUEST_STATUSES.PENDING;
    }

    @action
    async checkPermissions() {
        this.checkPermissionsState = REQUEST_STATUSES.PENDING;
        try {
            await adguard.permissionsChecker.checkPermissions();
            await this.rootStore.globalStore.getPopupData(10);
        } catch (e) {
            log.info(e.message);
        }
        runInAction(() => {
            this.checkPermissionsState = REQUEST_STATUSES.DONE;
        });
    }

    @action clearPermissionError() {
        this.globalError = null;
        adguard.permissionsError.clearError();
    }

    @computed
    get displayNonRoutable() {
        return !this.isRoutable && !this.isExcluded;
    }

    @action
    async disableOtherProxyExtensions() {
        await adguard.management.turnOffProxyExtensions();
        await this.checkProxyControl();
    }

    @computed
    get hasGlobalError() {
        return !!this.globalError;
    }
}

export default SettingsStore;
