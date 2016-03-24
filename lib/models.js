import fs from 'fs';
import path from 'path';

import glob from 'glob';
import jsonschema from 'jsonschema';
import webpack from 'webpack';

import webpackConfig from '../webpack.config.babel.js';
import {localPath} from './utils';


const PACKAGE_SCHEMA = {
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    required: ['name', 'main', 'normandy'],
    properties: {
        name: {type: 'string'},
        main: {type: 'string'},
        normandy: {
            type: 'object',
            required: ['driverVersion', 'argumentsSchema'],
            properties: {
                driverVersion: {
                    'type': 'string',
                },
                argumentsSchema: {
                    'type': 'object',
                },
            },
        },
    },
};


export class Action {
    constructor(packagePath) {
        this.packagePath = packagePath;
        this.package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    }

    get name() {
        return this.package.name;
    }

    get entryPath() {
        return path.resolve(this.packagePath, '..', this.package.main);
    }

    get buildPath() {
        return localPath('build', `${this.name}.js`);
    }

    get implementation() {
        return fs.readFileSync(this.buildPath, 'utf8');
    }

    get schema() {
        return this.package.normandy.argumentsSchema;
    }

    get isValid() {
        let result = jsonschema.validate(this.package, PACKAGE_SCHEMA);
        if (result.valid) {
            try {
                fs.accessSync(this.entryPath);
                return true;
            } catch (err) {
                return false;
            }
        }

        return false;
    }

    build() {
        return new Promise((resolve, reject) => {
            let config = Object.assign({}, webpackConfig, {
                entry: {[this.name]: this.entryPath},
            });
            webpack(config, function(err, stats) {
                if (err) {
                    reject(err);
                } else {
                    resolve(stats);
                }
            });
        });
    }

    /**
     * Locate valid actions on the filesystem.
     */
    static *localActions() {
        for (let packagePath of glob.sync(localPath('actions', '**', 'package.json'))) {
            let action = null;
            try {
                action = new Action(packagePath);
            } catch (err) {
                continue;
            }

            if (action.isValid) {
                yield action;
            }
        }
    }
}
