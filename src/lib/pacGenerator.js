function proxyPacScript(proxy, exclusionsList, inverted, defaultExclusions) {
    return `function FindProxyForURL(url, host) {
                const DIRECT = "DIRECT";
                const PROXY = "HTTPS ${proxy}";

                const areHostnamesEqual = (hostnameA, hostnameB) => {
                    const wwwRegex = /^www\\./;
                    const oldHostnameWithoutWww = hostnameA.replace(wwwRegex, '');
                    const newHostnameWithoutWww = hostnameB.replace(wwwRegex, '');
                    return oldHostnameWithoutWww === newHostnameWithoutWww;
                };

                if (isPlainHostName(host)
                    || shExpMatch(host, 'localhost')) {
                    return DIRECT;
                }

                const defaultExclusions = [${defaultExclusions.map(l => `"${l}"`).join(', ')}];
                if (defaultExclusions.some(el => (areHostnamesEqual(host, el) || shExpMatch(host, el)))) {
                    return DIRECT;
                }

                const inverted = ${inverted};
                const list = [${exclusionsList.map(l => `"${l}"`).join(', ')}];

                if (list.some(el => (areHostnamesEqual(host, el) || shExpMatch(host, el)))) {
                    if (inverted) {
                        return PROXY;
                    } else {
                        return DIRECT;
                    }
                }

                return inverted ? DIRECT : PROXY;
            }`;
}

function directPacScript() {
    return `function FindProxyForURL() {
        return 'DIRECT';
    }`;
}

const generate = (proxy, exclusionsList = [], inverted = false, defaultExclusions = []) => {
    if (!proxy) {
        return directPacScript();
    }

    return proxyPacScript(proxy, exclusionsList, inverted, defaultExclusions);
};

export default { generate };
