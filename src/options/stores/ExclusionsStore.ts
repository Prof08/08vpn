import { action, computed, observable } from 'mobx';

import { EXCLUSIONS_MODES, TYPE } from '../../common/exclusionsConstants';
import messenger from '../../lib/messenger';

export enum AddExclusionMode {
    SERVICE = 'SERVICE',
    MANUAL = 'MANUAL',
}

const DEFAULT_ADD_EXCLUSION_MODE = AddExclusionMode.SERVICE;

export class ExclusionsStore {
    @observable exclusions = {
        [EXCLUSIONS_MODES.SELECTIVE]: {
            excludedIps: [],
            exclusionsGroups: [],
            excludedServices: [],
        },
        [EXCLUSIONS_MODES.REGULAR]: {
            excludedIps: [],
            exclusionsGroups: [],
            excludedServices: [],
        },
    };

    // FIXME remove ts-ignore
    // @ts-ignore
    @observable currentMode;

    // FIXME remove ts-ignore
    // @ts-ignore
    @observable servicesData;

    @observable addExclusionModalOpen = false;

    @observable addSubdomainModalOpen = false;

    @observable addExclusionMode = DEFAULT_ADD_EXCLUSION_MODE;

    @observable unfoldedServiceCategories: string[] = [];

    @observable exclusionIdToShowSettings: string | null = null;

    /**
     * Temp list used to keep state of services to be enabled or disabled
     */
    @observable servicesToToggle: string[] = [];

    // FIXME remove any
    @action
    setServicesData = (servicesData: any) => {
        // console.log(servicesData);
        this.servicesData = servicesData;
    }

    // FIXME remove any
    @action
    setExclusionsData = (exclusionsData: any) => {
        // console.log(exclusionsData);
        this.exclusions = exclusionsData;
        this.currentMode = exclusionsData.currentMode;
    }

    @action
    updateExclusionsData = async () => {
        const exclusionsData = await messenger.getExclusionsData();
        this.setExclusionsData(exclusionsData);
    }

    // FIXME remove ts-ignore
    @computed
    get preparedExclusions() {
        // FIXME what sorting should be?
        // @ts-ignore
        const currentModeExclusions = this.exclusions[this.currentMode];
        const services = currentModeExclusions.excludedServices
        // @ts-ignore
            .map((service) => {
                return {
                    id: service.serviceId,
                    name: service.serviceName,
                    iconUrl: service.iconUrl,
                    state: service.state,
                    type: TYPE.SERVICE,
                };
            });
        // @ts-ignore
        const groups = currentModeExclusions.exclusionsGroups.map((group) => {
            return {
                id: group.id,
                name: group.hostname,
                iconUrl: '/assets/images/ip-icon.svg',
                state: group.state,
                type: TYPE.GROUP,
            };
        });
        // @ts-ignore
        const excludedIps = currentModeExclusions.excludedIps.map((ip) => {
            return {
                id: ip.id,
                name: ip.hostname,
                iconUrl: '/assets/images/ip-icon.svg',
                state: ip.enabled,
                type: TYPE.IP,
            };
        });

        return [...services, ...groups, ...excludedIps];
    }

    // FIXME remove any
    @action
    toggleInverted = async (mode: any) => {
        this.currentMode = mode;
        await messenger.setExclusionsMode(mode);
    };

    @action
    openAddExclusionModal = () => {
        this.addExclusionModalOpen = true;
    };

    @action
    closeAddExclusionModal = () => {
        this.addExclusionModalOpen = false;
    };

    @action
    setAddExclusionMode = (mode: AddExclusionMode) => {
        this.addExclusionMode = mode;
    }

    @action
    openAddSubdomainModal = () => {
        this.addSubdomainModalOpen = true;
    };

    @action
    closeAddSubdomainModal = () => {
        this.addSubdomainModalOpen = false;
    };

    isExcludedService = (serviceId: string) => {
        return this.exclusions[this.currentMode].excludedServices
            .some((service) => service.serviceId === serviceId);
    }

    @computed
    get preparedServicesData() {
        // FIXME remove ts-ignore
        // @ts-ignore
        const categories = this.servicesData.reduce((acc, serviceData) => {
            const { categories, serviceId } = serviceData;
            // FIXME remove ts-ignore
            // @ts-ignore
            categories.forEach((category) => {
                const foundCategory = acc[category];
                if (!foundCategory) {
                    acc[category] = {
                        id: category,
                        title: category.replace('_', ' ').toLowerCase(),
                        services: [serviceId],
                    };
                } else {
                    foundCategory.services.push(serviceId);
                }
            });
            return acc;
        }, {});

        // FIXME remove ts-ignore
        // @ts-ignore
        const services = this.servicesData.reduce((acc, serviceData) => {
            const { serviceId } = serviceData;
            acc[serviceId] = {
                ...serviceData,
                excluded: this.isExcludedService(serviceId),
            };
            return acc;
        }, {});

        return {
            categories,
            services,
        };
    }

    @action
    toggleCategoryVisibility(id: string) {
        const isUnfolded = this.unfoldedServiceCategories
            .some((categoryId) => categoryId === id);

        if (isUnfolded) {
            this.unfoldedServiceCategories = this.unfoldedServiceCategories
                .filter((categoryId) => categoryId !== id);
        } else {
            this.unfoldedServiceCategories.push(id);
        }
    }

    @action
    addUrlToExclusions = async (url: string) => {
        // TODO Validation for url?..
        await messenger.addUrlToExclusions(url);
        await this.updateExclusionsData();
    };

    @action
    removeExclusion = async (id: string, type: TYPE) => {
        await messenger.removeExclusion(id, type);
        await this.updateExclusionsData();
    };

    @action
    toggleExclusionState = async (id: string, type: TYPE) => {
        await messenger.toggleExclusionState(id, type);
        await this.updateExclusionsData();
    }

    @action
    addService = async (id: string) => {
        await messenger.addService(id);
        await this.updateExclusionsData();
    }

    @action
    addToServicesToToggle = (id: string) => {
        if (this.servicesToToggle.includes(id)) {
            this.servicesToToggle = this.servicesToToggle.filter((serviceId) => serviceId !== id);
        } else {
            this.servicesToToggle.push(id);
        }
    };

    @action
    saveServicesToToggle = async () => {
        this.servicesToToggle.forEach((serviceId) => {
            this.addService(serviceId);
        });
        this.servicesToToggle = [];
        await this.updateExclusionsData();
    }

    @action
    setExclusionIdToShowSettings = (id: string|null) => {
        this.exclusionIdToShowSettings = id;
    }

    @action
    toggleSubdomainStateInExclusionsGroup = async (
        exclusionsGroupId: string,
        subdomainId: string,
    ) => {
        await messenger.toggleSubdomainStateInExclusionsGroup(exclusionsGroupId, subdomainId);
        await this.updateExclusionsData();
    }

    @action
    removeSubdomainFromExclusionsGroup = async (
        exclusionsGroupId: string,
        subdomainId: string,
    ) => {
        await messenger.removeSubdomainFromExclusionsGroup(exclusionsGroupId, subdomainId);
        await this.updateExclusionsData();
    }

    @action
    addSubdomainToExclusionsGroup = async (exclusionsGroupId: string, subdomain: string) => {
        await messenger.addSubdomainToExclusionsGroup(exclusionsGroupId, subdomain);
        await this.updateExclusionsData();
    }

    @computed
    get exclusionDataToShow() {
        if (!this.exclusionIdToShowSettings) {
            return null;
        }

        const serviceData = this.exclusions[this.currentMode].excludedServices
            .find(({ serviceId }) => serviceId === this.exclusionIdToShowSettings);

        const servicesGroupData = this.exclusions[this.currentMode].excludedServices
            .map(({ exclusionsGroups }) => exclusionsGroups)
            .flat()
            .find(({ id }) => id === this.exclusionIdToShowSettings);

        const groupData = this.exclusions[this.currentMode].exclusionsGroups
            .find(({ id }) => id === this.exclusionIdToShowSettings);

        return serviceData || servicesGroupData || groupData || null;
    }
}