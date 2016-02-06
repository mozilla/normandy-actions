import {Agent} from 'https';

import fetch from 'node-fetch';


export class NormandyApi {
    constructor(token, baseUrl='https://normandy.mozilla.org/api/v1', verify=true) {
        this.token = token;
        this.baseUrl = baseUrl;
        this.verify = verify;
    }

    fetch(url, method='GET', body=null) {
        url = this.baseUrl + url;
        let options = {
            method: method,
            headers: {
                'Authorization': `Token ${this.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : '',
            agent: new Agent({rejectUnauthorized: this.verify}),
        };

        return fetch(url, options);
    }

    async getAction(name) {
        let response = await this.fetch(`/action/${name}`);
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`${response.status}: ${response.statusText}`);
        }
    }

    async createAction(action) {
        let response = await this.fetch('/action/', 'POST', {
            name: action.name,
            implementation: action.implementation,
            arguments_schema: action.schema,
        });
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }
    }

    async updateAction(name, action) {
        let response = await this.fetch(`/action/${name}/`, 'PATCH', {
            implementation: action.implementation,
            arguments_schema: action.schema,
        });
        if (!response.ok) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }
    }
}
