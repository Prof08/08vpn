import { nanoid } from 'nanoid';
import { getDomain } from 'tldts';
import ipaddr from 'ipaddr.js';
import { ExclusionsGroup } from './ExclusionsGroup';
import {
    ExclusionsData,
    ExclusionsModes,
    ExclusionStates,
    ExclusionsTypes,
} from '../../../common/exclusionsConstants';
import { Exclusion } from './Exclusion';
import { Service } from '../services/Service';
import { getHostname, prepareUrl } from '../../../lib/helpers';
import { areHostnamesEqual, shExpMatch } from '../../../lib/string-utils';
import { ExclusionInterface, IndexedExclusionsInterface } from './ExclusionsManager';

/**
 * Here eTld means eTLD + 1
 */
export const getETld = (hostname: string) => {
    const SEPARATOR = '.';

    if (ipaddr.isValid(hostname)) {
        return hostname;
    }

    const parts = hostname.split(SEPARATOR);
    let domainParts = parts.splice(parts.length - 2, 2);
    const domain = getDomain(domainParts.join(SEPARATOR));
    if (domain) {
        return domain;
    }

    while (parts.length > 0) {
        const nextPart = parts.pop();
        if (nextPart) {
            domainParts = [nextPart, ...domainParts];
        }

        const domain = getDomain(domainParts.join(SEPARATOR));
        if (domain) {
            return domain;
        }
    }

    return null;
};

interface ExclusionsManagerInterface {
    // methods for services
    addService(serviceId: string): void;
    removeService(serviceId: string): void;
    toggleServiceState(serviceId: string): void;
    toggleExclusionsGroupStateInService(serviceId: string, exclusionsGroupId: string): void;
    removeExclusionsGroupFromService(serviceId: string, exclusionsGroupId: string): void;
    addSubdomainToExclusionsGroupInService(
        serviceId: string,
        exclusionsGroupId: string,
        subdomain: string,
    ): void;
    removeSubdomainFromExclusionsGroupInService(
        serviceId: string,
        exclusionsGroupId: string,
        subdomainId: string,
    ): void;
    toggleSubdomainStateInExclusionsGroupInService(
        serviceId: string,
        exclusionsGroupId: string,
        subdomainId: string,
    ): void;
    resetServiceData(serviceId: string): void;

    // methods for groups
    addExclusionsGroup(hostname: string): void;
    removeExclusionsGroup(id: string): void;
    addSubdomainToExclusionsGroup(id: string, subdomain: string): void;
    removeSubdomainFromExclusionsGroup(exclusionsGroupId: string, subdomainId: string): void;
    toggleExclusionsGroupState(id: string): void;
    toggleSubdomainStateInExclusionsGroup(exclusionsGroupId: string, subdomainId: string): void;

    // methods for ips
    addIp(ip: string): void;
    removeIp(id: string): void;
    toggleIpState(id: string): void;

    // common methods
    getExclusions(): ExclusionsData;
    addUrlToExclusions(url: string): void;
    disableExclusionByUrl(url: string): void;
    isExcluded(url: string): boolean | undefined;
    removeExclusion(id: string, type: ExclusionsTypes): void;
    toggleExclusionState(id: string, type: ExclusionsTypes): void;
    clearExclusionsData(): void;
}

interface UpdateHandler {
    (): void;
}

export class ExclusionsHandler {
    exclusions: ExclusionInterface[];

    exclusionsIndex: IndexedExclusionsInterface;

    updateHandler: () => void;

    public mode: ExclusionsModes;

    constructor(
        updateHandler: UpdateHandler,
        exclusions: ExclusionInterface[],
        mode: ExclusionsModes,
    ) {
        this.updateHandler = updateHandler;
        this.exclusions = exclusions;
        this.exclusionsIndex = this.getExclusionsIndex(exclusions);
        this.mode = mode;
    }

    getExclusions(): ExclusionInterface[] {
        return this.exclusions;
    }

    getIndexedExclusions(): IndexedExclusionsInterface {
        return this.exclusionsIndex;
    }

    getExclusionsIndex(exclusions: ExclusionInterface[]) {
        const indexedExclusions = exclusions.reduce((
            acc: IndexedExclusionsInterface,
            exclusion,
        ) => {
            let domain = getETld(exclusion.hostname);

            if (!domain) {
                domain = exclusion.hostname;
            }

            if (acc[domain]) {
                acc[domain].push(exclusion.id);
            } else {
                acc[domain] = [exclusion.id];
            }
            return acc;
        }, {});

        return indexedExclusions;
    }

    async addUrlToExclusions(url: string) {
        const hostname = getHostname(url);

        if (!hostname) {
            return;
        }

        this.exclusions.push({ id: nanoid(), hostname, state: ExclusionStates.Enabled });
        this.exclusionsIndex = this.getExclusionsIndex(this.exclusions);

        await this.updateHandler();
    }

    /**
     * Removes exclusions
     * @param id
     */
    async removeExclusion(id: string) {
        this.exclusions = this.exclusions.filter((exclusion) => exclusion.id !== id);

        // FIXME build new index
        await this.updateHandler();
    }

    async removeExclusions(ids: string[]) {
        console.log(ids);
        this.exclusions = this.exclusions.filter((exclusion) => {
            return !ids.includes(exclusion.id);
        });

        this.exclusionsIndex = this.getExclusionsIndex(this.exclusions);
        await this.updateHandler();
    }

    async setExclusionsState(ids: string[], state: ExclusionStates) {
        console.log(ids);
        this.exclusions = this.exclusions.map((ex) => {
            if (ids.includes(ex.id)) {
                return {
                    ...ex,
                    state,
                };
            }
            return ex;
        });

        this.exclusionsIndex = this.getExclusionsIndex(this.exclusions);
        await this.updateHandler();
    }

    /**
     * Disables exclusion by url
     * @param url
     */
    async disableExclusionByUrl(url: string) {
        const hostname = getHostname(url);

        if (!hostname) {
            return;
        }

        // this.exclusionsGroups.forEach((group) => {
        //     if (group.hostname === hostname) {
        //         group.disableExclusionsGroup();
        //     }
        // });
        //
        // this.excludedServices.forEach((service) => {
        //     service.exclusionsGroups.forEach((group) => {
        //         if (group.hostname === hostname) {
        //             service.toggleExclusionsGroupState(group.id);
        //         }
        //     });
        // });

        await this.updateHandler();
    }

    /**
     * Toggles top-level exclusion state
     * @param id
     * @param type
     */
    async toggleExclusionState(id: string, type: ExclusionsTypes) {
        switch (type) {
            case ExclusionsTypes.Service: {
                await this.toggleServiceState(id);
                break;
            }
            case ExclusionsTypes.Group: {
                await this.toggleExclusionsGroupState(id);
                break;
            }
            case ExclusionsTypes.Ip: {
                await this.toggleIpState(id);
                break;
            }
            default:
                throw new Error(`Unknown exclusion type: ${type}`);
        }
    }

    async addService(serviceId: string) {
        if (this.excludedServices.some((service) => service.serviceId === serviceId)) {
            return;
        }
        const serviceData = services.getService(serviceId);
        if (serviceData) {
            const service = new Service(serviceData);
            this.excludedServices.push(service);
            await this.updateHandler();
        }
    }

    /**
     * Removes services from list if they were added otherwise adds them
     * @param ids
     */
    async toggleServices(ids: string[]) {
        ids.forEach((id) => {
            const serviceAdded = this.excludedServices.find((service) => {
                return service.serviceId === id;
            });

            if (serviceAdded) {
                this.removeService(id);
            } else {
                this.addService(id);
            }
        });
    }

    async removeService(serviceId: string) {
        this.excludedServices = this.excludedServices
            .filter((excludedService: Service) => excludedService.serviceId !== serviceId);
        await this.updateHandler();
    }

    async toggleServiceState(serviceId: string) {
        this.excludedServices.forEach((service: Service) => {
            if (service.serviceId === serviceId) {
                service.toggleServiceState();
            }
        });
        await this.updateHandler();
    }

    async resetServiceData(serviceId: string) {
        this.excludedServices.forEach((service) => {
            if (service.serviceId === serviceId) {
                const defaultServiceData = services.getService(serviceId);
                if (!defaultServiceData) {
                    return;
                }
                const defaultService = new Service(defaultServiceData);

                service.exclusionsGroups.forEach((group) => {
                    service.enableDomainInExclusionsGroupByHostname(group.id, group.hostname);
                    const allSubdomainsHostname = `*.${group.hostname}`;
                    const allSubdomainsExclusion = group.exclusions
                        .find(({ hostname }) => hostname === allSubdomainsHostname);
                    if (allSubdomainsExclusion) {
                        service.enableDomainInExclusionsGroupByHostname(
                            group.id,
                            allSubdomainsHostname,
                        );
                    } else {
                        service.addSubdomainToExclusionsGroup(
                            group.id,
                            allSubdomainsHostname,
                        );
                    }
                });

                defaultService.exclusionsGroups.forEach((group) => {
                    if (!service.exclusionsGroups
                        .some(({ hostname }) => hostname === group.hostname)) {
                        service.exclusionsGroups.push(group);
                    }
                });

                service.exclusionsGroups.sort((a, b) => {
                    return a.hostname > b.hostname ? 1 : -1;
                });
            }
        });
        await this.updateHandler();
    }

    async toggleExclusionsGroupStateInService(serviceId: string, exclusionsGroupId: string) {
        this.excludedServices.forEach((service: Service) => {
            if (service.serviceId === serviceId) {
                service.toggleExclusionsGroupState(exclusionsGroupId);
            }
        });
        await this.updateHandler();
    }

    async removeExclusionsGroupFromService(serviceId: string, exclusionsGroupId: string) {
        this.excludedServices.forEach((service: Service) => {
            if (service.serviceId === serviceId) {
                service.removeExclusionsGroup(exclusionsGroupId);
            }
        });
        await this.updateHandler();
    }

    async addSubdomainToExclusionsGroupInService(
        serviceId: string,
        exclusionsGroupId: string,
        subdomain: string,
    ) {
        this.excludedServices.forEach((service: Service) => {
            if (service.serviceId === serviceId) {
                service.addSubdomainToExclusionsGroup(exclusionsGroupId, subdomain);
            }
        });
        await this.updateHandler();
    }

    async removeSubdomainFromExclusionsGroupInService(
        serviceId: string,
        exclusionsGroupId: string,
        subdomainId: string,
    ) {
        this.excludedServices.forEach((service: Service) => {
            if (service.serviceId === serviceId) {
                service.removeDomainFromExclusionsGroup(exclusionsGroupId, subdomainId);
            }
        });
        await this.updateHandler();
    }

    async toggleSubdomainStateInExclusionsGroupInService(
        serviceId: string,
        exclusionsGroupId: string,
        subdomainId: string,
    ) {
        this.excludedServices.forEach((service: Service) => {
            if (service.serviceId === serviceId) {
                service.toggleDomainStateInExclusionsGroup(exclusionsGroupId, subdomainId);
            }
        });
        await this.updateHandler();
    }

    async addExclusionsGroup(dirtyUrl: string) {
        const url = prepareUrl(dirtyUrl);
        const hostname = getHostname(url);
        if (!hostname) {
            return;
        }

        const serviceId = services.getServiceIdByUrl(hostname);
        if (serviceId) {
            await this.addService(serviceId);
            // if service added manually as domain,
            // the only domain's exclusions group should be enabled
            await this.toggleServiceState(serviceId);
            this.excludedServices.forEach((service) => {
                if (service.serviceId === serviceId) {
                    service.exclusionsGroups.forEach((group) => {
                        if (group.hostname === hostname) {
                            service.toggleExclusionsGroupState(group.id);
                        }
                    });
                }
            });
            return;
        }

        if (this.exclusionsGroups.some((group: ExclusionsGroup) => group.hostname === hostname)) {
            this.exclusionsGroups.forEach((group: ExclusionsGroup) => {
                if (group.hostname === hostname) {
                    group.exclusions.forEach((exclusion) => {
                        group.setSubdomainStateById(exclusion.id, ExclusionStates.Enabled);
                    });
                }
            });
        } else {
            const newExclusionsGroup = new ExclusionsGroup(hostname);
            this.exclusionsGroups.push(newExclusionsGroup);
        }
        await this.updateHandler();
    }

    async removeExclusionsGroup(id: string) {
        this.exclusionsGroups = this.exclusionsGroups
            .filter((exclusionsGroup: ExclusionsGroup) => exclusionsGroup.id !== id);
        await this.updateHandler();
    }

    async addSubdomainToExclusionsGroup(id: string, subdomain: string) {
        this.exclusionsGroups.forEach((exclusionsGroup: ExclusionsGroup) => {
            if (exclusionsGroup.id === id) {
                exclusionsGroup.addSubdomain(subdomain);
            }
        });
        await this.updateHandler();
    }

    async removeSubdomainFromExclusionsGroup(exclusionsGroupId: string, subdomainId: string) {
        this.exclusionsGroups.forEach((exclusionsGroup: ExclusionsGroup) => {
            if (exclusionsGroup.id === exclusionsGroupId) {
                // remove group if main domain was removed
                if (exclusionsGroup.exclusions[0].id === subdomainId) {
                    this.removeExclusionsGroup(exclusionsGroup.id);
                }
                exclusionsGroup.removeSubdomain(subdomainId);
            }
        });
        await this.updateHandler();
    }

    async toggleExclusionsGroupState(exclusionsGroupId: string) {
        this.exclusionsGroups.forEach((exclusionsGroup: ExclusionsGroup) => {
            if (exclusionsGroup.id === exclusionsGroupId) {
                exclusionsGroup.toggleExclusionsGroupState();
            }
        });
        await this.updateHandler();
    }

    async toggleSubdomainStateInExclusionsGroup(exclusionsGroupId: string, subdomainId: string) {
        this.exclusionsGroups.forEach((exclusionsGroup: ExclusionsGroup) => {
            if (exclusionsGroup.id === exclusionsGroupId) {
                exclusionsGroup.toggleSubdomainState(subdomainId);
            }
        });
        await this.updateHandler();
    }

    async addIp(ip: string) {
        if (this.excludedIps.some((excludedIp: Exclusion) => excludedIp.hostname === ip)) {
            this.excludedIps.forEach((excludedIp: Exclusion) => {
                if (excludedIp.hostname === ip) {
                    // eslint-disable-next-line no-param-reassign
                    excludedIp.enabled = ExclusionStates.Enabled;
                }
            });
        } else {
            const excludedIp = new Exclusion(ip);
            this.excludedIps.push(excludedIp);
        }
        await this.updateHandler();
    }

    async removeIp(id: string) {
        this.excludedIps = this.excludedIps.filter((excludedIp: Exclusion) => excludedIp.id !== id);
        await this.updateHandler();
    }

    async toggleIpState(id:string) {
        this.excludedIps.forEach((ip: Exclusion) => {
            if (ip.id === id) {
                // eslint-disable-next-line no-param-reassign
                ip.enabled = ip.enabled === ExclusionStates.Enabled
                    ? ExclusionStates.Disabled
                    : ExclusionStates.Enabled;
            }
        });
        await this.updateHandler();
    }

    /**
     * Checks if there are enabled exclusions for provided url
     * @param url
     * @param includeWildcards
     * @return boolean
     */
    checkEnabledExclusionsByUrl = (url: string, includeWildcards = true) => {
        const hostname = getHostname(url);
        if (!hostname) {
            return undefined;
        }

        const isExcludedIp = this.excludedIps.some((exclusion) => {
            return (areHostnamesEqual(hostname, exclusion.hostname)
                || (includeWildcards && shExpMatch(hostname, exclusion.hostname)))
                && exclusion.enabled;
        });

        const isExclusionsGroup = this.exclusionsGroups.some((group) => {
            return group.exclusions.some((exclusion) => {
                return (group.state === ExclusionStates.Enabled
                        || group.state === ExclusionStates.PartlyEnabled)
                    && (areHostnamesEqual(hostname, exclusion.hostname)
                        || (includeWildcards && shExpMatch(hostname, exclusion.hostname)))
                    && exclusion.enabled;
            });
        });

        const isExcludedService = this.excludedServices.some((service) => {
            return service.exclusionsGroups.some((group) => {
                return group.exclusions.some((exclusion) => {
                    return (service.state === ExclusionStates.Enabled
                        || service.state === ExclusionStates.PartlyEnabled)
                    && (group.state === ExclusionStates.Enabled
                        || group.state === ExclusionStates.PartlyEnabled)
                    && (areHostnamesEqual(hostname, exclusion.hostname)
                        || (includeWildcards && shExpMatch(hostname, exclusion.hostname)));
                });
            });
        });

        return isExcludedIp || isExclusionsGroup || isExcludedService;
    };

    // TODO add more tests
    isExcluded = (url: string) => {
        if (!url) {
            return false;
        }
        return this.checkEnabledExclusionsByUrl(url);
    };

    async importExclusionsData(exclusionsData: ExclusionsData | string[]) {
        if (exclusionsData.constructor === Array) {
            exclusionsData.forEach((exclusion) => {
                this.addExclusionsGroup(exclusion);
            });
            return;
        }
        if ('excludedServices' in exclusionsData) {
            exclusionsData.excludedServices.forEach((service) => {
                this.removeService(service.serviceId);
                this.excludedServices.push(new Service(service));
            });
        }

        if ('exclusionsGroups' in exclusionsData) {
            exclusionsData.exclusionsGroups.forEach((group) => {
                this.removeExclusionsGroup(group.id);
                this.exclusionsGroups.push(new ExclusionsGroup(group));
            });
        }

        if ('excludedIps' in exclusionsData) {
            exclusionsData.excludedIps.forEach((ip) => {
                this.removeIp(ip.id);
                this.excludedIps.push(new Exclusion(ip));
            });
        }
    }

    async clearExclusionsData() {
        this.exclusions = [];
        await this.updateHandler();
    }
}