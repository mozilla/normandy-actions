/**
 * Script to upload actions to the recipe server.
 */
import 'babel-polyfill';

import fs from 'fs';

import {argv} from 'yargs';

import {NormandyApi} from '../lib/api';
import {Action} from '../lib/models';


// Validate action names if any were given.
let actions = [];
if (argv._.length > 0) {
    for (let name of argv._) {
        let action = new Action(name);
        if (action.isValid) {
            actions.push(action);
        } else {
            console.error(`Cannot upload invalid action ${name}, skipping.`);
        }
    }
} else {
    actions = Array.from(Action.localActions());
}

// Validate that the actions we want to upload have been built.
actions = actions.filter((action) => {
    try {
        fs.accessSync(action.buildPath, fs.R_OK);
        return true;
    } catch (e) {
        console.error(`Cannot find build file for action ${action.name}, skipping.`);
        return false;
    }
});

// Validate that we have an API token.
let token = process.env.npm_package_config_api_token;
if (!token) {
    console.error('No token specified, cannot upload actions without an API token.');
    process.exit();
}

// Create the actions, or update them if they already exist on the server.
let baseUrl = process.env.npm_package_config_normandy_url;
let verify = process.env.npm_package_config_verify;
let api = new NormandyApi(token, baseUrl, verify);
for (let action of actions) {
    api.createOrUpdateAction(action)
        .then(() => {
            console.log(`Created/updated action ${action.name} successfully.`);
        })
        .catch((err) => {
            console.error(`Failed to create/update action ${action.name}: ${err}`);
        });
}
