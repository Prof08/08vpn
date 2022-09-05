import React, { useContext } from 'react';
import { observer } from 'mobx-react';

import { rootStore } from '../../../stores';
import { reactTranslator } from '../../../../common/reactTranslator';

import './status.pcss';

const Status = observer(() => {
    const { settingsStore } = useContext(rootStore);

    const {
        isConnected,
        isConnectingIdle,
        isConnectingRetrying,
        isExcluded,
        canBeExcluded,
    } = settingsStore;

    const renderVpnStatusTitle = () => {
        if (isConnectingIdle || isConnectingRetrying) {
            return reactTranslator.getMessage('settings_vpn_connecting');
        }

        if (isConnected && !isExcluded) {
            return reactTranslator.getMessage('settings_vpn_enabled');
        }

        if (isConnected && !canBeExcluded) {
            return reactTranslator.getMessage('settings_vpn_enabled');
        }

        return reactTranslator.getMessage('settings_vpn_disabled');
    };

    return (
        <div className="status">
            {renderVpnStatusTitle()}
        </div>
    );
});

export default Status;
