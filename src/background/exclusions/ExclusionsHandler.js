import nanoid from 'nanoid';
import { getHostname } from '../../lib/helpers';
import { areHostnamesEqual } from '../../lib/string-utils';
import log from '../../lib/logger';

export default class ExclusionsHandler {
    constructor(updateHandler, exclusions, type) {
        this.updateHandler = updateHandler;
        this._exclusions = exclusions;
        this._type = type;
    }

    get type() {
        return this._type;
    }

    handleExclusionsUpdate = (exclusions) => {
        if (exclusions && exclusions.length > 0) {
            this.updateHandler(this._type, this._exclusions, exclusions);
        } else {
            this.updateHandler(this._type, this._exclusions);
        }
    };

    /**
     * Adds url to exclusions
     * @param {string} url
     * @param {boolean} enable - enable if was disabled by user
     * @returns {Promise<void>}
     */
    addToExclusions = async (url, enable = true, considerWildcard = true) => {
        const hostname = getHostname(url);

        if (!hostname) {
            return;
        }

        // check there are already exclusions for current url
        const exclusions = this.getExclusionsByUrl(url, considerWildcard);

        let shouldUpdate = false;

        let exclusion;

        // if it was disabled, enable, otherwise add the new one
        if (exclusions.length > 0) {
            [exclusion] = exclusions;
            if (!exclusion.enabled && enable) {
                this._exclusions[exclusion.id] = { ...exclusion, enabled: true };
                shouldUpdate = true;
            }
        } else {
            const id = nanoid();
            exclusion = { id, hostname, enabled: true };
            this._exclusions[id] = exclusion;
            log.info(`Added to exclusions: ${hostname}`);
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            await this.handleExclusionsUpdate(exclusion);
        }
    };

    removeFromExclusions = async (id) => {
        const exclusion = this._exclusions[id];
        if (!exclusion) {
            return;
        }
        delete this._exclusions[id];

        await this.handleExclusionsUpdate(exclusion);
    };

    disableExclusionByHostname = async (hostname) => {
        const exclusions = this.getExclusionsByUrl(hostname);

        exclusions.forEach((exclusion) => {
            this._exclusions[exclusion.id] = { ...exclusion, enabled: false };
        });

        await this.handleExclusionsUpdate(exclusions);
    };

    /**
     * Checks is wildcard pattern matches with url
     * @param url
     * @param pattern
     * @returns {boolean}
     */
    shExpMatch = (url, pattern) => {
        let regexpStr = pattern.replace(/\./g, '\\.');
        regexpStr = regexpStr.replace(/\*/g, '.*');
        const regexp = new RegExp(`^${regexpStr}$`);
        return regexp.test(url);
    };

    /**
     * Returns exclusion by id
     * @param url
     * @param includeWildcards
     * @returns {undefined,Exclusions[]}
     */
    getExclusionsByUrl = (url, includeWildcards = true) => {
        const hostname = getHostname(url);
        if (!hostname) {
            return undefined;
        }
        return Object.values(this._exclusions)
            .filter(exclusion => areHostnamesEqual(hostname, exclusion.hostname)
                || (includeWildcards && this.shExpMatch(url, exclusion.hostname)));
    };

    isExcluded = (url) => {
        const exclusions = this.getExclusionsByUrl(url);
        return exclusions.some(exclusion => exclusion.enabled);
    };

    toggleExclusion = async (id) => {
        let exclusion = this._exclusions[id];
        if (!exclusion) {
            return;
        }

        exclusion = { ...exclusion, enabled: !exclusion.enabled };
        this._exclusions[id] = exclusion;
        await this.handleExclusionsUpdate(exclusion);
    };

    renameExclusion = async (id, newUrl) => {
        const hostname = getHostname(newUrl);
        if (!hostname) {
            return;
        }
        const exclusion = this._exclusions[id];
        if (!exclusion) {
            return;
        }
        this._exclusions[id] = { ...exclusion, hostname };
        await this.handleExclusionsUpdate();
    };

    clearExclusions = async () => {
        this._exclusions = {};
        await this.handleExclusionsUpdate();
    };

    get exclusions() {
        return this._exclusions;
    }

    getExclusionsList = () => {
        return Object.values(this._exclusions);
    };
}
