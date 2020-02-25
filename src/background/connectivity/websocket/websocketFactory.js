import ReconnectingWebsocket from './ReconnectingWebsocket';
import NativeWebsocket from './NativeWebsocket';

const websocketFactory = (() => {
    let ws;

    /**
     * Creates new websocket and closes the old one if found
     * @param {string} url
     * @returns {ReconnectingWebsocket}
     */
    const getReconnectingWebsocket = async (url) => {
        if (!url) {
            throw new Error('Url expected to be provided');
        }
        if (ws) {
            await ws.close();
        }
        ws = new ReconnectingWebsocket(url);
        return ws;
    };

    /**
     * Creates new websocket whenever is called
     * @param {string} url
     * @returns {NativeWebsocket}
     */
    const getNativeWebsocket = async (url) => {
        if (!url) {
            throw new Error('No url was provided');
        }
        return new NativeWebsocket(url);
    };

    return {
        getNativeWebsocket,
        getReconnectingWebsocket,
    };
})();

export default websocketFactory;