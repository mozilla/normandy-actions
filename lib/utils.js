import fs from 'fs';
import path from 'path';

import glob from 'glob';


/**
 * Build a path relative to the project root directory.
 */
export function localPath(...parts) {
    parts = [__dirname, '..'].concat(parts);
    return path.resolve(...parts);
}


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
}


/**
 * Locate valid actions.
 */
export function* findActions() {
    for (let directoryName of fs.readdirSync(localPath('actions'))) {
        let action = new Action(directoryName);
        if (action.isValid) {
            yield action;
        }
    }
}
