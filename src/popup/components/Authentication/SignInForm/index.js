import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';

import popupActions from '../../../actions/popupActions';
import rootStore from '../../../stores';
import { REQUEST_STATUSES } from '../../../stores/consts';

import PasswordField from '../PasswordField';
import Submit from '../Submit';

const SignInForm = observer(() => {
    const { authStore } = useContext(rootStore);

    useEffect(() => {
        (async () => {
            await authStore.getAuthCacheFromBackground();
        })();
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        await authStore.authenticate();
    };

    const inputChangeHandler = (e) => {
        const { target: { name, value } } = e;
        authStore.onCredentialsChange(name, value);
    };

    const { requestProcessState, credentials } = authStore;
    const { password } = credentials;

    return (
        <form
            className={`form form--login ${authStore.error && 'form--error'}`}
            onSubmit={submitHandler}
        >
            <div className="form__inputs">
                <PasswordField
                    label="Password"
                    id="password"
                    password={password}
                    inputChangeHandler={inputChangeHandler}
                />
                {authStore.error && (
                    <div className="form__error">
                        {authStore.error}
                    </div>
                )}
            </div>

            <div className="form__link-wrap">
                <button
                    type="button"
                    className="button button--inline form__link"
                    onClick={popupActions.openRecovery}
                >
                    Forgot it?
                </button>
            </div>

            <div className="form__btn-wrap">
                <Submit
                    text="Log in"
                    processing={requestProcessState === REQUEST_STATUSES.PENDING}
                    disabled={!password}
                />
            </div>
        </form>
    );
});

export default SignInForm;
