import React, { useContext } from 'react';
import { observer } from 'mobx-react';

import rootStore from '../../../stores';
import { REQUEST_STATUSES } from '../../../stores/consts';

import Submit from '../Submit';
import InputField from '../InputField';

const TwoFactorForm = observer(() => {
    const { authStore } = useContext(rootStore);
    const submitHandler = async (e) => {
        e.preventDefault();
        await authStore.authenticate();
    };

    const inputChangeHandler = (e) => {
        const { target: { name, value } } = e;
        authStore.onCredentialsChange(name, value);
    };

    const { requestProcessState, credentials } = authStore;
    const { twoFactor } = credentials;

    return (
        <form
            className="form form--2fa"
            onSubmit={submitHandler}
        >
            <div className="form__inputs">
                <InputField
                    id="twoFactor"
                    type="text"
                    value={twoFactor}
                    label="Code from the authentication app"
                    inputChangeHandler={inputChangeHandler}
                    error={authStore.error}
                    className="form__input--big"
                />
                {authStore.error && (
                    <div className="form__error">
                        {authStore.error}
                    </div>
                )}
            </div>

            <div className="form__btn-wrap">
                <Submit
                    text="Confirm"
                    processing={requestProcessState === REQUEST_STATUSES.PENDING}
                    disabled={!twoFactor}
                />
            </div>
        </form>
    );
});

export default TwoFactorForm;
