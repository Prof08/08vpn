import Exclusions from '../src/background/exclusions/exclusions';

const proxy = {
    setBypassList: jest.fn(() => {
    }),
};

const storage = (() => {
    const exclusionsStorage = {};
    return {
        set: jest.fn((key, data) => {
            exclusionsStorage[key] = data;
        }),
        get: jest.fn((key) => {
            return exclusionsStorage[key];
        }),
    };
})();

const browser = {
    runtime: {
        sendMessage: () => {
        },
    },
};

const exclusions = new Exclusions(browser, proxy, storage);

beforeAll(async (done) => {
    await exclusions.init();
    done();
});

describe('modules bound with exclusions work as expected', () => {
    afterAll(async (done) => {
        await exclusions.clearExclusions();
        done();
    });

    it('should be called once after initialization', async () => {
        expect(proxy.setBypassList).toHaveBeenCalledTimes(1);
        expect(storage.get).toHaveBeenCalledTimes(1);
        expect(storage.set).toHaveBeenCalledTimes(1);
    });

    it('should be called once when adding to index', async () => {
        await exclusions.addToExclusions('http://example.org');
        expect(proxy.setBypassList).toHaveBeenCalledTimes(2);
        expect(storage.set).toHaveBeenCalledTimes(2);
        expect(storage.get).toHaveBeenCalledTimes(1);
    });

    it('should be called once when removing from index', async () => {
        const exclusionsList = exclusions.getExclusions();
        const exclusion = exclusionsList[0];
        await exclusions.removeFromExclusions(exclusion.id);
        expect(proxy.setBypassList).toHaveBeenCalledTimes(3);
        expect(storage.set).toHaveBeenCalledTimes(3);
        expect(storage.get).toHaveBeenCalledTimes(1);
    });
});

describe('exclusions', () => {
    afterEach(async (done) => {
        await exclusions.clearExclusions();
        done();
    });

    it('should be empty before initialization', () => {
        const exclusionsList = exclusions.getExclusions();
        expect(exclusionsList.length).toEqual(0);
    });

    it('should return false if hostname is NOT in exclusions', () => {
        expect(exclusions.isExcluded('http://example.org')).toEqual(false);
    });

    it('should return true if hostname is IN exclusions', async () => {
        await exclusions.addToExclusions('http://example.org');
        const exclusionsList = exclusions.getExclusions();
        expect(exclusionsList.length).toEqual(1);
        expect(exclusions.isExcluded('http://example.org')).toEqual(true);
    });

    it('should return false if hostname is IN exclusions and is not enabled', () => {
        let exclusionsList = exclusions.getExclusions();
        expect(exclusionsList.length).toEqual(0);
        const url1 = 'http://example.org';
        exclusions.addToExclusions(url1);
        exclusionsList = exclusions.getExclusions();
        expect(exclusionsList.length).toEqual(1);
        const exclusion = exclusionsList[0];
        expect(exclusions.isExcluded('http://example.org')).toEqual(true);
        exclusions.toggleExclusion(exclusion.id);
        exclusionsList = exclusions.getExclusions();
        expect(exclusionsList.length).toEqual(1);
        expect(exclusionsList[0].enabled).toBeFalsy();
        expect(exclusionsList[0].hostname).toEqual('example.org');
        expect(exclusions.isExcluded('http://example.org')).toEqual(false);
    });

    it('should toggle correctly', () => {
        exclusions.addToExclusions('http://example.org');
        const exclusionsList = exclusions.getExclusions();
        expect(exclusionsList.length).toEqual(1);
        expect(exclusions.isExcluded('http://example.org')).toBeTruthy();
        exclusions.toggleExclusion(exclusionsList[0].id);
        expect(exclusions.isExcluded('http://example.org')).toBeFalsy();
        exclusions.toggleExclusion(exclusionsList[0].id);
        expect(exclusions.isExcluded('http://example.org')).toBeTruthy();
    });

    it('should add more than one correctly', async () => {
        await exclusions.addToExclusions('http://example.org');
        await exclusions.addToExclusions('http://example1.org');
        let exclusionsList = exclusions.getExclusions();
        expect(exclusionsList.length).toEqual(2);
        const removedExclusion = exclusionsList[0];
        await exclusions.removeFromExclusions(removedExclusion.id);
        exclusionsList = exclusions.getExclusions();
        expect(exclusionsList.length).toEqual(1);
    });

    it('can rename exclusions', async () => {
        await exclusions.addToExclusions('http://example.org');
        let exclusionsList = exclusions.getExclusions();
        let exclusion = exclusionsList[0];
        await exclusions.renameExclusion(exclusion.id, 'http://new-example.org');
        exclusionsList = exclusions.getExclusions();
        // eslint-disable-next-line prefer-destructuring
        exclusion = exclusionsList[0];
        expect(exclusion.hostname).toEqual('new-example.org');
    });
});
