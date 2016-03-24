/**
 * Script to watch for changes to actions and upload them to the recipe
 * server.
 */
import 'babel-polyfill';

import path from 'path';

import chokidar from 'chokidar';
import {argv} from 'yargs';

import {NormandyApi} from '../lib/api';
import {Action} from '../lib/models';
import {loadEnvConfig, localPath} from '../lib/utils';


let config = loadEnvConfig(argv.env);
if (config === null) {
    process.exit();
}

let api = new NormandyApi(config.api_token, config.normandy_url, config.verify);
let actionsDir = localPath('actions');
let watcher = chokidar.watch(actionsDir);
watcher.on('change', async function(changedPath) {
    // Search upwards for a valid package.json file until we hit the actions
    // directory.
    let action = null;
    let currentDir = path.dirname(changedPath);
    while (currentDir !== actionsDir) {
        try {
            action = new Action(path.resolve(currentDir, 'package.json'));
            if (action.isValid) {
                break;
            }
        } catch (err) {
            // Pass
        }

        action = null;
        currentDir = path.dirname(currentDir);
    }

    if (action !== null) {
        process.stdout.write(`Uploading action ${action.name}...`);
        try {
            await action.build();
            await api.createOrUpdateAction(action);
            console.log('Succeeded');
        } catch (err) {
            console.error(`Failed: ${err}`);
        }
    }
});

watcher.once('ready', function() {
    console.log('Watching actions directory for changes...');
});
