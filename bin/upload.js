/**
 * Script to upload actions to the recipe server.
 */
import 'babel-polyfill';

import fs from 'fs';

import {argv} from 'yargs';

import {NormandyApi} from '../lib/api';
import {Action} from '../lib/models';
import {localPath} from '../lib/utils';


// Load config.json and figure out which environment we're using.
let config = null;
let config_env = argv.env || 'default';
try {
    config = JSON.parse(fs.readFileSync(localPath('config.json')));
    if (!(config_env in config)) {
        console.error(`No environment ${config_env} found in config.json.`);
        process.exit();
    } else {
        config = config[config_env];
    }
} catch (err) {
    if (err.code === 'ENOENT') {
        console.error(
            'No config.json file found (copy config.json-dist to config.json and fill it in).'
        );
    } else {
        console.error(`Could not load config.json: ${err}`);
    }
    process.exit();
}


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
actions = actions.filter(action => {
    try {
        fs.accessSync(action.buildPath, fs.R_OK);
        return true;
    } catch (e) {
        console.error(`Cannot find build file for action ${action.name}, skipping.`);
        return false;
    }
});

// Validate that we have an API token.
if (!config.api_token) {
    console.error(
        `No token in ${config_env} config; cannot upload actions without an API token.`
    );
    process.exit();
}

// Create the actions, or update them if they already exist on the server.
let api = new NormandyApi(config.api_token, config.normandy_url, config.verify);
for (let action of actions) {
    api.createOrUpdateAction(action)
        .then(() => {
            console.log(`Created/updated action ${action.name} successfully.`);
        })
        .catch(err => {
            console.error(`Failed to create/update action ${action.name}: ${err}`);
        });
}
