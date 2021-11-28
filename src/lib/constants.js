export const SETTINGS_IDS = {
    PROXY_ENABLED: 'proxy.enabled',
    RATE_SHOW: 'rate.show',
    USER_SET_PROMO_SHOW: 'user.set.promo.show',
    EXCLUSIONS: 'exclusions.list',
    HANDLE_WEBRTC_ENABLED: 'webrtc.handle.enabled',
    SELECTED_DNS_SERVER: 'dns.handle.server',
    CONTEXT_MENU_ENABLED: 'context.menu.enabled',
    SELECTED_LOCATION_KEY: 'endpoints.selected.location',
    LOCATION_SELECTED_BY_USER_KEY: 'endpoints.location.selected.by.user',
    POLICY_AGREEMENT: 'policy.agreement',
    HELP_US_IMPROVE: 'help.us.improve',
    APPEARANCE_THEME: 'appearance.theme',
};

export const APPEARANCE_THEMES = {
    SYSTEM: 'SYSTEM',
    DARK: 'DARK',
    LIGHT: 'LIGHT',
};

export const APPEARANCE_THEME_DEFAULT = APPEARANCE_THEMES.SYSTEM;

export const MESSAGES_TYPES = {
    ADD_EVENT_LISTENER: 'add.event.listener',
    NOTIFY_LISTENERS: 'notify.listeners',
    REMOVE_EVENT_LISTENER: 'remove.event.listener',

    ADD_LONG_LIVED_CONNECTION: 'add.long.lived.connection',
    AUTHENTICATE_SOCIAL: 'authenticate.social',
    GET_POPUP_DATA: 'get.popup.data',
    GET_OPTIONS_DATA: 'get.options.data',
    GET_VPN_FAILURE_PAGE: 'get.vpn.failure.page',
    OPEN_OPTIONS_PAGE: 'open.options.page',
    SET_SELECTED_LOCATION: 'set.selected.location',
    DEAUTHENTICATE_USER: 'deauthenticate.user',
    AUTHENTICATE_USER: 'authenticate.user',
    UPDATE_AUTH_CACHE: 'update.auth.cache',
    GET_AUTH_CACHE: 'get.auth.cache',
    CLEAR_AUTH_CACHE: 'clear.auth.cache',
    GET_CAN_CONTROL_PROXY: 'get.can.control.proxy',
    ENABLE_PROXY: 'enable.proxy',
    DISABLE_PROXY: 'disable.proxy',
    ADD_URL_TO_EXCLUSIONS: 'add.to.exclusions',
    REMOVE_FROM_EXCLUSIONS: 'remove.from.exclusions',
    REMOVE_EXCLUSION: 'remove.exclusion',
    GET_IS_EXCLUDED: 'get.is.excluded',
    CHECK_EMAIL: 'check.email',
    DISABLE_OTHER_EXTENSIONS: 'disable.other.extensions',
    REGISTER_USER: 'register.user',
    IS_AUTHENTICATED: 'is.authenticated',
    START_SOCIAL_AUTH: 'start.social.auth',
    CLEAR_PERMISSIONS_ERROR: 'clear.permissions.error',
    CHECK_PERMISSIONS: 'check.permissions',
    GET_EXCLUSIONS_INVERTED: 'get.exclusions.inverted',
    GET_EXCLUSIONS: 'get.exclusions',
    GET_EXCLUSIONS_DATA: 'get.exclusions.data',
    SET_EXCLUSIONS_MODE: 'set.exclusions.mode',
    REMOVE_EXCLUSION_BY_MODE: 'remove.exclusion.by.mode',
    REMOVE_EXCLUSIONS_BY_MODE: 'remove.exclusions.by.mode',
    TOGGLE_EXCLUSION_BY_MODE: 'toggle.exclusion.by.mode',
    TOGGLE_EXCLUSION_STATE: 'toggle.exclusion.state',
    TOGGLE_SUBDOMAIN_STATE_IN_EXCLUSIONS_GROUP: 'toggle.subdomain.state.in.exclusions.group',
    ADD_SUBDOMAIN_TO_EXCLUSIONS_GROUP: 'add.subdomain.to.exclusions.group',
    REMOVE_EXCLUSIONS_GROUP_FROM_SERVICE: 'remove.exclusions.group.from.service',
    TOGGLE_EXCLUSIONS_GROUP_STATE_IN_SERVICE: 'toggle.exclusions.group.state.in.service',
    REMOVE_SUBDOMAIN_FROM_EXCLUSIONS_GROUP: 'remove.subdomain.from.exclusions.group',
    REMOVE_SUBDOMAIN_FROM_EXCLUSIONS_GROUP_IN_SERVICE: 'remove.subdomain.from.exclusions.group.in.service',
    TOGGLE_SUBDOMAIN_IN_EXCLUSIONS_GROUP_IN_SERVICE: 'toggle.subdomain.in.exclusions.group.in.service',
    ADD_SUBDOMAIN_TO_EXCLUSIONS_GROUP_IN_SERVICE: 'add.subdomain.to.exclusions.group.in.service',
    RENAME_EXCLUSION_BY_MODE: 'rename.exclusion.by.mode',
    RESET_SERVICE_DATA: 'reset.service.data',
    CLEAR_EXCLUSIONS_LIST: 'clear.exclusions.list',
    IMPORT_EXCLUSIONS_DATA: 'import.exclusions.data',
    ADD_SERVICE: 'add.service',
    ADD_EXCLUSION_BY_MODE: 'add.exclusion.by.mode',
    ADD_SELECTIVE_EXCLUSIONS: 'add.exclusions.selective',
    ADD_REGULAR_EXCLUSIONS: 'add.exclusions.regular',
    GET_SETTING_VALUE: 'get.setting.value',
    SET_SETTING_VALUE: 'set.setting.value',
    GET_APP_VERSION: 'get.app.version',
    GET_USERNAME: 'get.username',
    GET_SELECTED_LOCATION: 'get.selected.location',
    CHECK_IS_PREMIUM_TOKEN: 'check.is.premium.token',
    SET_NOTIFICATION_VIEWED: 'set.notification.viewed',
    OPEN_TAB: 'open.tab.action',
    REPORT_BUG: 'post.report.bug',
    SET_DESKTOP_VPN_ENABLED: 'set.desktop.vpn.enabled',
    OPEN_PREMIUM_PROMO_PAGE: 'open.premium.promo.page',
    GET_USER_SERVICE_DATA: 'get.user.state',
    SET_FLAG: 'set.flag',
    GET_IS_FIRST_RUN: 'get.is.first.run',
};

export const ERROR_STATUSES = {
    NETWORK_ERROR: 'network.error',
    INVALID_TOKEN_ERROR: 'invalid.token.error',
};

export const PROMO_SCREEN_STATES = {
    // display if user clicks on connect button
    DISPLAY_AFTER_CONNECT_CLICK: 'display.after.connect.click',
    // display if user opens extension's popup window
    DISPLAY_ON_POPUP_OPEN: 'display.on.popup.open',
    // don't display
    DO_NOT_DISPLAY: 'do.not.display',
};

// Error text thrown when connection is canceled by user. See issue - AG-2291
export const FORCE_CANCELLED = 'Connection was cancelled by user';

export const UNINSTALL_URL = 'https://adguard-vpn.com/forward.html?action=adguard_uninstal_ext&from=background_page&app=vpn_extension';

export const AUTH_PROVIDERS = {
    ADGUARD: 'adguard',
    APPLE: 'apple',
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
};

export const FLAGS_FIELDS = {
    IS_NEW_USER: 'isNewUser',
    IS_SOCIAL_AUTH: 'isSocialAuth',
    SHOW_ONBOARDING: 'showOnboarding',
    SHOW_UPGRADE_SCREEN: 'showUpgradeScreen',
    SALE_SHOW: 'saleShow',
};
