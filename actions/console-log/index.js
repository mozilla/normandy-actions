import {Action, registerAction} from '../utils';

export default class ConsoleLogAction extends Action {
    async execute() {
        this.normandy.log(this.recipe.args.message, false);
    }
}

registerAction('console-log', ConsoleLogAction);
