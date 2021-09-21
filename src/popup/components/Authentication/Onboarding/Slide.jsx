import React, { useContext } from 'react';
import { rootStore } from '../../../stores';
import './onboarding.pcss';
import { reactTranslator } from '../../../../common/reactTranslator';
import { DotsNavigator } from '../../ui/DotsNavigator';

export const Slide = (props) => {
    const { settingsStore } = useContext(rootStore);

    const {
        title,
        image,
        info,
        dots,
        active,
    } = props;

    const handleClickNext = () => () => {
        const nextSlide = active === dots ? null : active + 1;
        settingsStore.handleNextSlide(nextSlide);
    };

    return (
        <div className={`slide slide-${active}`}>
            <img
                src={`../../../../assets/images/${image}`}
                className="slide__image"
                alt="slide"
            />
            <div className="slide__title">
                {title}
            </div>
            <div className="slide__info">
                {info}
            </div>
            <DotsNavigator
                num={dots}
                active={active - 1}
            />
            <button
                key="subscribe"
                type="button"
                onClick={handleClickNext()}
                className="button button--medium button--green slide__button-next"
            >
                {reactTranslator.getMessage('popup_onboarding_next')}
            </button>
        </div>
    );
};
