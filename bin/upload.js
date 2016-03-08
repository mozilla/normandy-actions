/**
 * Script to upload actions to the recipe server.
 */
import 'babel-polyfill';

import {argv} from 'yargs';

import {NormandyApi} from '../lib/api';
import {Action} from '../lib/models';
import {loadConfig} from '../lib/utils';


let config = loadConfig(argv.env);
if (config === null) {
    process.exit();
}

let actions = [];
if (argv._.length > 0) {
    for (let name of argv._) {
        actions.push(new Action(name));
    }
} else {
    actions = Array.from(Action.localActions());
}

// Validate that we have an API token.
if (!config.api_token) {
    console.error(
        `No token in ${config.env} config; cannot upload actions without an API token.`
    );
    process.exit();
}

// Create the actions, or update them if they already exist on the server.
(async function() {
    /* eslint-disable babel/no-await-in-loop */

    let api = new NormandyApi(config.api_token, config.normandy_url, config.verify);
    for (let action of actions) {
        if (!action.isValid) {
            console.error(`Cannot upload invalid action ${name}, skipping.`);
            continue;
        }

        try {
            await action.build();
            await api.createOrUpdateAction(action);
            console.log(`Created/updated action ${action.name} successfully.`);
        } catch (err) {
            console.error(`Failed to build or create/update action ${action.name}: ${err}`);
        }
    }
})();
