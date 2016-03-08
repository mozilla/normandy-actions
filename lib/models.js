import fs from 'fs';

import webpack from 'webpack';

import webpackConfig from '../webpack.config.babel.js';
import {localPath} from './utils';


export class Action {
    constructor(name) {
        this.name = name;
    }

    get entryPath() {
        return localPath('actions', this.name, 'index.js');
    }

    get schemaPath() {
        return localPath('actions', this.name, 'arguments.json');
    }

    get buildPath() {
        return localPath('build', `${this.name}.js`);
    }

    get implementation() {
        return fs.readFileSync(this.buildPath, 'utf8');
    }

    get schema() {
        return JSON.parse(fs.readFileSync(this.schemaPath, 'utf8'));
    }

    get isValid() {
        try {
            fs.accessSync(this.entryPath);
            fs.accessSync(this.schemaPath);
            return true;
        } catch (err) {
            return false;
        }
    }

    build() {
        return new Promise((resolve, reject) => {
            let config = Object.assign({}, webpackConfig, {
                entry: {[this.name]: this.entryPath}
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
        for (let directoryName of fs.readdirSync(localPath('actions'))) {
            let action = new Action(directoryName);
            if (action.isValid) {
                yield action;
            }
        }
    }
}
