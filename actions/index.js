export class Action {
    constructor(normandy, recipe) {
        this.normandy = normandy;
        this.recipe = recipe;
    }

    log(message) {
        if (!this.normandy.testing) {
            console.log(message);
        }
    }
}
