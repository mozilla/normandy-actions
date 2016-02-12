import 'babel-polyfill';

import {Action} from './lib/models';
import {localPath} from './lib/utils';


let entries = {};
for (let action of Action.localActions()) {
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
            {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    }
};
