import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import rootStore from '../../stores';
import './endpoints.pcss';

const Endpoints = observer(() => {
    const { vpnStore, uiStore, settingsStore } = useContext(rootStore);

    const handleEndpointSelect = id => async (e) => {
        e.preventDefault();
        const prevId = vpnStore.selectedEndpoint.id;
        await vpnStore.selectEndpoint(id);
        uiStore.closeEndpointsSearch();
        if (settingsStore.proxyEnabled && prevId !== vpnStore.selectedEndpoint.id) {
            await settingsStore.reconnectProxy();
            return;
        }
        if (!settingsStore.proxyEnabled) {
            await settingsStore.setProxyState(true);
        }
    };

    const handleCloseEndpoints = () => {
        uiStore.closeEndpointsSearch();
        vpnStore.setSearchValue('');
    };

    const getEndpointIcon = (premiumOnly, selected) => {
        if (premiumOnly) {
            return 'lock';
        }

        if (selected) {
            return 'bullet_on';
        }

        return 'bullet_off';
    };

    const renderEndpoints = endpoints => endpoints.map((endpoint) => {
        const {
            countryName,
            id,
            selected,
            premiumOnly,
            cityName,
        } = endpoint;
        const endpointClassNames = classnames({
            'endpoints__item--selected': selected,
            'endpoints__item--lock': premiumOnly,
        });
        return (
            <button
                type="button"
                key={id}
                className={`endpoints__item ${endpointClassNames}`}
                onClick={handleEndpointSelect(id)}
            >
                <svg className="endpoints__item-ico">
                    <use xlinkHref={`#${getEndpointIcon(premiumOnly, selected)}`} />
                </svg>
                <div className="endpoints__city">
                    {`${countryName}, ${cityName}`}
                </div>
            </button>
        );
    });

    const handleSearchInput = (e) => {
        const { value } = e.target;
        vpnStore.setSearchValue(value);
    };

    const endpoints = vpnStore.filteredEndpoints;
    const endpointsCrossClassNames = classnames({
        'endpoints__cross--active': vpnStore.searchValue.length > 0,
    });

    return (
        <div className="endpoints">
            <div className="endpoints__header">
                <button
                    type="button"
                    className="button endpoints__back"
                    onClick={handleCloseEndpoints}
                />
                <div className="endpoints__search">
                    <input
                        className="endpoints__search-in"
                        type="text"
                        placeholder="search the country"
                        value={vpnStore.searchValue}
                        onChange={handleSearchInput}
                    />
                    <button
                        onClick={() => {
                            vpnStore.setSearchValue('');
                        }}
                        type="button"
                        className={`button endpoints__cross ${endpointsCrossClassNames}`}
                    />
                </div>
            </div>
            <div className="endpoints__list">
                {renderEndpoints(endpoints)}
            </div>
        </div>
    );
});

export default Endpoints;
