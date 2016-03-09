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
import {loadConfig, localPath} from '../lib/utils';


let config = loadConfig(argv.env);
if (config === null) {
    process.exit();
}

let api = new NormandyApi(config.api_token, config.normandy_url, config.verify);
let watcher = chokidar.watch(localPath('actions'));
watcher.on('change', async function(changedPath) {
    let actionName = path.relative(localPath('actions'), changedPath).split(path.sep)[0];
    let action = new Action(actionName);

    if (action.isValid) {
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
