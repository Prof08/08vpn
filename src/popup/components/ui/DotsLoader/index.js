import React from 'react';

import './dots-loader.pcss';

const DotsLoader = function () {
    return (
        <div className="dots-loader">
            <span className="dots-loader__dot" />
            <span className="dots-loader__dot" />
            <span className="dots-loader__dot" />
        </div>
    );
};

export default DotsLoader;
