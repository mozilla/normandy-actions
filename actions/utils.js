export class Action {
    constructor(normandy, recipe) {
        this.normandy = normandy;
        this.recipe = recipe;
    }
}

/**
 * From the given list of objects, choose one based on their relative
 * weights and return it. Choices are assumed to be objects with a `weight`
 * property that is an integer.
 *
 * Weights define the probability a choices will be shown relative to other
 * weighted choices. If two choices have weights 10 and 20, the second one will
 * appear twice as often as the first.
 *
 * @param  {array}  choices  Array of weighted choices.
 * @return {object}          The chosen choice.
 */
export function weightedChoose(choices) {
    // Rolling sums of weights; each weight is the choice's weight plus
    // the weight of all previous choices.
    let weights = [choices[0].weight];
    for (let choice of choices.slice(1)) {
        weights.push(choice.weight + weights[weights.length - 1]);
    }

    let choice = Math.random() * weights[weights.length - 1];
    let chosen = choices[choices.length - 1];
    for (let k = 0; k < weights.length - 1; k++) {
        if (choice < weights[k]) {
            chosen = choices[k];
            break;
        }
    }

    return chosen;
}

// Attempt to find the global registerAction, and fall back to a noop if it's
// not available.
export let registerAction = null;

try {
    registerAction = global.registerAction;
} catch (err) {
    // Not running in Node.
}

if (!registerAction) {
    try {
        registerAction = window.registerAction;
    } catch (err) {
        // Not running in a browser.
    }
}

// If it still isn't found, just shim it.
if (!registerAction) {
    registerAction = function() { };
}
