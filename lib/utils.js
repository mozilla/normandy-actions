import fs from 'fs';

import path from 'path';


/**
 * Build a path relative to the project root directory.
 */
export function localPath(...parts) {
    parts = [__dirname, '..'].concat(parts);
    return path.resolve(...parts);
}


export function loadConfig(configEnv) {
    let config = null;
    try {
        config = JSON.parse(fs.readFileSync(localPath('config.json')));
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error(
                'No config.json file found (copy config.json-dist to '
                + 'config.json and fill it in).'
            );
        } else {
            console.error(`Could not load config.json: ${err}`);
        }
    }

    configEnv = configEnv || config.defaultEnv;
    if (config !== null) {
        if (!(configEnv in config.envs)) {
            console.error(`No environment ${configEnv} found in config.json.`);
        } else {
            return Object.assign({env: configEnv}, config.envs[configEnv]);
        }
    }

    return null;
}
