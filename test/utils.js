import sinon from 'sinon';


export class MockStorage {
    constructor() {
        this.data = {};
    }

    getItem(key) {
        let value = this.data[key];
        return Promise.resolve(value !== undefined ? value : null);
    }

    setItem(key, value) {
        this.data[key] = String(value);
        return Promise.resolve();
    }

    removeItem(key) {
        delete this.data[key];
        return Promise.resolve();
    }
}


export function mockNormandy() {
    let mock = {
        storage: new MockStorage(),
        appInfo: {},
    };

    return {
        mock: mock,
        testing: false,
        log: sinon.spy(),
        createStorage: sinon.stub().returns(mock.storage),
        showHeartbeat: sinon.stub().returns(Promise.resolve()),
        getAppInfo: sinon.spy(() => mock.appInfo),
        uuid: sinon.stub().returns('fake-uuid'),
    };
}
