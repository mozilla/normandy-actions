import 'babel-polyfill';

import {Action} from './lib/models';
import {localPath} from './lib/utils';


export default {
    // Use a getter to avoid circular import issues with lib/models.
    get entry() {
        let entries = {};
        for (let action of Action.localActions()) {
            entries[action.name] = action.entryPath;
        }
        return entries;
    },

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
