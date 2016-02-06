import "babel-polyfill";

import {findActions, localPath} from './lib/utils';


let entries = {};
for (let action of findActions()) {
    entries[action.name] = action.entryPath;
}


export default {
    entry: entries,
    output: {
        path: localPath('build'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
        ]
    }
};
