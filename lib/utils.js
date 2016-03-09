import fs from 'fs';
import path from 'path';

import jsonschema from 'jsonschema';


/**
 * Build a path relative to the project root directory.
 */
export function localPath(...parts) {
    parts = [__dirname, '..'].concat(parts);
    return path.resolve(...parts);
}


const CONFIG_SCHEMA = {
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    required: ['defaultEnv', 'envs'],
    properties: {
        defaultEnv: {'type': 'string'},
        envs: {
            type: 'object',
            additionalProperties: {
                type: 'object',
                required: ['normandy_url', 'api_token', 'verify'],
                properties: {
                    normandy_url: {type: 'string', format: 'uri'},
                    api_token: {type: 'string'},
                    verify: {type: 'boolean'},
                },
            },
        },
    },
};


/**
 * Load configuration from the config.json file at the root of the repo.
 * Also validates the configuration and logs errors and returns null if
 * validation fails.
 *
 * @return {object|null} The config for the requested environment, or
 *                       null if loading it failed. Also contains an
 *                       additional "env" property with the name of the
 *                       environment used.
 */
export function loadConfig(configEnv) {
    // Read and parse the file.
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

        return null;
    }

    // Validate!
    let result = jsonschema.validate(config, CONFIG_SCHEMA);
    if (!result.valid) {
        console.error(`Config validation failed: ${result.errors}`);
        return null;
    }

    // Get the right config env.
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
