/**
 * This module manages promo notifications
 */
import browser from 'webextension-polyfill';

import { lazyGet } from '../lib/helpers';
import { getUrl } from './browserApi/runtime';
import browserApi from './browserApi';
import { Prefs } from './prefs';
import notifier from '../lib/notifier';

const VIEWED_NOTIFICATIONS = 'viewed-notifications';
const LAST_NOTIFICATION_TIME = 'viewed-notification-time';

const ny2022Notification = {
    id: 'ny2022',
    locales: {
        en: {
            btn: 'Unwrap your gift',
        },
        ru: {
            btn: 'Открыть подарок',
        },
        es: {
            btn: 'Abre tu regalo',
        },
        fr: {
            btn: 'Ouvrir mon cadeau',
        },
        it: {
            btn: 'Scarta il regalo',
        },
        de: {
            btn: 'Ihr Geschenk auspacken',
        },
        ja: {
            btn: 'プレゼントをもらう',
        },
        ko: {
            btn: '선물 받기',
        },
        zh_cn: {
            btn: '抓个礼物',
        },
        zh_tw: {
            btn: '享好禮',
        },
        uk: {
            btn: 'Отримайте подарунок',
        },
    },
    // will be selected for locale, see usage of getNotificationText
    text: '',
    url: 'https://adguard-vpn.com/forward.html?action=ny2022vpn&from=popup&app=vpn_extension',
    from: '24 December 2021 12:00:00',
    to: '01 January 2022 23:59:00',
    type: 'animated',
    get icons() {
        return lazyGet(ny2022Notification, 'icons', () => ({
            ENABLED: {
                19: getUrl('assets/images/icons/ny-enabled-19.png'),
                38: getUrl('assets/images/icons/ny-enabled-38.png'),
            },
            DISABLED: {
                19: getUrl('assets/images/icons/ny-disabled-19.png'),
                38: getUrl('assets/images/icons/ny-disabled-38.png'),
            },
        }));
    },
};

/**
 * @typedef Notification
 * @type object
 * @property {string} id
 * @property {object} locales
 * @property {string} url
 * @property {string} text
 * @property {string} from
 * @property {string} to
 * @property {string} bgColor;
 * @property {string} textColor;
 * @property {string} badgeBgColor;
 * @property {string} badgeText;
 * @property {string} type;
 */
const notifications = {
    ny2022: ny2022Notification,
};

/**
 * Gets the last time a notification was shown.
 * If it was not shown yet, initialized with the current time.
 */
const getLastNotificationTime = async () => {
    let lastTime = await browserApi.storage.get(LAST_NOTIFICATION_TIME) || 0;
    if (lastTime === 0) {
        lastTime = new Date().getTime();
        await browserApi.storage.set(LAST_NOTIFICATION_TIME, lastTime);
    }
    return lastTime;
};

const normalizeLanguage = (locale) => {
    if (!locale) {
        return null;
    }

    return locale.toLowerCase().replace('-', '_');
};

/**
 * Scans notification locales and returns the one matching navigator.language
 * @param {*} notification notification object
 * @returns {string} matching text or null
 */
const getNotificationText = (notification) => {
    const language = normalizeLanguage(browser.i18n.getUILanguage());

    if (!language) {
        return null;
    }

    const languageCode = language.split('_')[0];
    if (!languageCode) {
        return null;
    }

    return notification.locales[language] || notification.locales[languageCode];
};

/**
 * Scans notifications list and prepares them to be used (or removes expired)
 */
const initNotifications = () => {
    const notificationsKeys = Object.keys(notifications);

    for (let i = 0; i < notificationsKeys.length; i += 1) {
        const notificationKey = notificationsKeys[i];
        const notification = notifications[notificationKey];

        notification.text = getNotificationText(notification);

        const to = new Date(notification.to).getTime();
        const expired = new Date().getTime() > to;

        if (!notification.text || expired) {
            // Remove expired and invalid
            delete notifications[notificationKey];
        }
    }
};

// Prepare the notifications
initNotifications();

let currentNotification;
let notificationCheckTime;
const checkTimeoutMs = 10 * 60 * 1000; // 10 minutes
const minPeriod = 30 * 60 * 1000; // 30 minutes
const DELAY = 30 * 1000; // clear notification in 30 seconds
let timeoutId;

/**
 * Marks current notification as viewed
 * @param {boolean} withDelay if true, do this after a 30 sec delay
 */
const setNotificationViewed = async (withDelay) => {
    if (withDelay) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            setNotificationViewed(false);
        }, DELAY);
        return;
    }

    if (currentNotification) {
        const viewedNotifications = (await browserApi.storage.get(VIEWED_NOTIFICATIONS)) || [];
        const { id } = currentNotification;
        if (!viewedNotifications.includes(id)) {
            viewedNotifications.push(id);
            await browserApi.storage.set(VIEWED_NOTIFICATIONS, viewedNotifications);
            notifier.notifyListeners(notifier.types.UPDATE_BROWSER_ACTION_ICON);
            currentNotification = null;
        }
    }
};

/**
 * Finds out notification for current time and checks if notification wasn't shown yet
 *
 * @returns {null|Notification} - notification
 */
const getCurrentNotification = async () => {
    // Do not display notification on Firefox
    if (Prefs.browser === 'Firefox') {
        return null;
    }

    const currentTime = new Date().getTime();

    const timeSinceLastNotification = currentTime - (await getLastNotificationTime());
    if (timeSinceLastNotification < minPeriod) {
        // Just a check to not show the notification too often
        return null;
    }

    // Check not often than once in 10 minutes
    const timeSinceLastCheck = currentTime - notificationCheckTime;
    if (notificationCheckTime > 0 && timeSinceLastCheck <= checkTimeoutMs) {
        return currentNotification;
    }

    // Update the last notification check time
    notificationCheckTime = currentTime;

    const notificationsKeys = Object.keys(notifications);
    const viewedNotifications = (await browserApi.storage.get(VIEWED_NOTIFICATIONS)) || [];

    for (let i = 0; i < notificationsKeys.length; i += 1) {
        const notificationKey = notificationsKeys[i];
        const notification = notifications[notificationKey];
        const from = new Date(notification.from).getTime();
        const to = new Date(notification.to).getTime();
        if (from < currentTime
            && to > currentTime
            && !viewedNotifications.includes(notification.id)
        ) {
            currentNotification = notification;
            return currentNotification;
        }
    }
    currentNotification = null;
    return currentNotification;
};

export const promoNotifications = {
    getCurrentNotification,
    setNotificationViewed,
};
