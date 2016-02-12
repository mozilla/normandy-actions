import {Agent} from 'https';

import fetch from 'node-fetch';


async function fetchError(response) {
    let msg = response.statusText;
    try {
        let json = await response.json();
        msg = json.detail || msg;
    } catch (e) {
        // pass
    }

    return new Error(`${response.status}: ${msg}`);
}


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
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : '',
            agent: new Agent({rejectUnauthorized: this.verify})
        };

        return fetch(url, options);
    }

    async getAction(name) {
        let response = await this.fetch(`/action/${name}/`);
        if (response.ok) {
            return await response.json();
        } else {
            throw await fetchError(response);
        }
    }

    async createAction(action) {
        let response = await this.fetch('/action/', 'POST', {
            name: action.name,
            implementation: action.implementation,
            arguments_schema: action.schema
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error(`API token is invalid.`);
            } else {
                throw await fetchError(response);
            }
        }
    }

    async updateAction(name, action) {
        let response = await this.fetch(`/action/${name}/`, 'PATCH', {
            implementation: action.implementation,
            arguments_schema: action.schema
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error(`API token is invalid or action is in use.`);
            } else {
                throw await fetchError(response);
            }
        }
    }
}
