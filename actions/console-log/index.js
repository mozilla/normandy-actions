/* global registerAction */
import {Action} from '../index.js';

class ConsoleLogAction extends Action {
    execute() {
        console.log(this.recipe.args.message);
    }
}

registerAction('console-log', ConsoleLogAction);
