import browser from 'webextension-polyfill';
import { MESSAGES_TYPES } from './constants';
import log from './logger';

class Messager {
    async sendMessage(type, data) {
        log.debug(`Request type: "${type}"`);
        if (data) {
            log.debug('Request data:', data);
        }

        const response = await browser.runtime.sendMessage({ type, data });

        if (response) {
            log.debug(`Response type: "${type}"`);
            log.debug('Response data:', response);
        }

        return response;
    }

    async getPopupData(url, numberOfTries) {
        const type = MESSAGES_TYPES.GET_POPUP_DATA;
        return this.sendMessage(type, { url, numberOfTries });
    }

    async getVpnFailurePage() {
        const type = MESSAGES_TYPES.GET_VPN_FAILURE_PAGE;
        return this.sendMessage(type);
    }

    async openOptionsPage() {
        const type = MESSAGES_TYPES.OPEN_OPTIONS_PAGE;
        return this.sendMessage(type);
    }

    async setCurrentEndpoint(endpoint) {
        const type = MESSAGES_TYPES.SET_CURRENT_ENDPOINT;
        return this.sendMessage(type, { endpoint });
    }

    async authenticateUser(credentials) {
        const type = MESSAGES_TYPES.AUTHENTICATE_USER;
        return this.sendMessage(type, { credentials });
    }

    async deauthenticateUser() {
        const type = MESSAGES_TYPES.DEAUTHENTICATE_USER;
        return this.sendMessage(type);
    }

    async updateAuthCache(field, value) {
        const type = MESSAGES_TYPES.UPDATE_AUTH_CACHE;
        return this.sendMessage(type, { field, value });
    }

    async getAuthCache() {
        const type = MESSAGES_TYPES.GET_AUTH_CACHE;
        return this.sendMessage(type);
    }

    async clearAuthCache() {
        const type = MESSAGES_TYPES.CLEAR_AUTH_CACHE;
        return this.sendMessage(type);
    }

    async getCurrentEndpointPing() {
        const type = MESSAGES_TYPES.GET_CURRENT_ENDPOINT_PING;
        return this.sendMessage(type);
    }

    async getCanControlProxy() {
        const type = MESSAGES_TYPES.GET_CAN_CONTROL_PROXY;
        return this.sendMessage(type);
    }

    async enableProxy(force, withCancel) {
        const type = MESSAGES_TYPES.ENABLE_PROXY;
        return this.sendMessage(type, { force, withCancel });
    }

    async disableProxy(force, withCancel) {
        const type = MESSAGES_TYPES.DISABLE_PROXY;
        return this.sendMessage(type, { force, withCancel });
    }

    async addToExclusions(url, enabled, options) {
        const type = MESSAGES_TYPES.ADD_TO_EXCLUSIONS;
        return this.sendMessage(type, { url, enabled, options });
    }

    async removeFromExclusions(url) {
        const type = MESSAGES_TYPES.REMOVE_FROM_EXCLUSIONS;
        return this.sendMessage(type, { url });
    }

    async getIsExcluded(url) {
        const type = MESSAGES_TYPES.GET_IS_EXCLUDED;
        return this.sendMessage(type, { url });
    }

    async checkEmail(email) {
        const type = MESSAGES_TYPES.CHECK_EMAIL;
        return this.sendMessage(type, { email });
    }

    async disableOtherExtensions() {
        const type = MESSAGES_TYPES.DISABLE_OTHER_EXTENSIONS;
        return this.sendMessage(type);
    }

    async registerUser(credentials) {
        const type = MESSAGES_TYPES.REGISTER_USER;
        return this.sendMessage(type, { credentials });
    }

    async isAuthenticated() {
        const type = MESSAGES_TYPES.IS_AUTHENTICATED;
        return this.sendMessage(type);
    }

    async startSocialAuth(social) {
        const type = MESSAGES_TYPES.START_SOCIAL_AUTH;
        return this.sendMessage(type, { social });
    }

    async clearPermissionsError() {
        const type = MESSAGES_TYPES.CLEAR_PERMISSIONS_ERROR;
        return this.sendMessage(type);
    }

    async checkPermissions() {
        const type = MESSAGES_TYPES.CHECK_PERMISSIONS;
        return this.sendMessage(type);
    }

    async getExclusionsInverted() {
        const type = MESSAGES_TYPES.GET_EXCLUSIONS_INVERTED;
        return this.sendMessage(type);
    }

    async getSetting(settingId) {
        const type = MESSAGES_TYPES.GET_SETTING_VALUE;
        return this.sendMessage(type, { settingId });
    }

    async setSetting(settingId, value) {
        const type = MESSAGES_TYPES.SET_SETTING_VALUE;
        return this.sendMessage(type, { settingId, value });
    }

    async getAppVersion() {
        const type = MESSAGES_TYPES.GET_APP_VERSION;
        return this.sendMessage(type);
    }

    async getUsername() {
        const type = MESSAGES_TYPES.GET_USERNAME;
        return this.sendMessage(type);
    }

    async getExclusionsData() {
        const type = MESSAGES_TYPES.GET_EXCLUSIONS;
        return this.sendMessage(type);
    }
}

export default new Messager();