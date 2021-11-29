import React from 'react';

import { ExclusionStates, ExclusionsTypes } from '../../../../common/exclusionsConstants';

import './statecheckbox.pcss';

interface StateCheckboxProps {
    id: string,
    type: ExclusionsTypes,
    state: ExclusionStates | boolean,
    toggleHandler: (id: string, type: ExclusionsTypes) => React.MouseEventHandler<HTMLButtonElement>,
}

export var StateCheckbox = function ({
    id,
    type,
    state,
    toggleHandler,
}: StateCheckboxProps) {
    const getStateIcon = () => {
        if (state === ExclusionStates.Enabled || state === true) {
            return '#enabled';
        }
        if (state === ExclusionStates.PartlyEnabled) {
            return '#partly-enabled';
        }
        return '#disabled';
    };

    return (
        <button
            className="state-checkbox"
            type="button"
            onClick={toggleHandler(id, type)}
        >
            <svg className="state-checkbox__icon">
                <use xlinkHref={getStateIcon()} />
            </svg>
        </button>
    );
};
