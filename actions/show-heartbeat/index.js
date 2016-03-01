/* global registerAction */
import {Action} from '../index.js';

const VERSION = 52; // Increase when changed.
const LAST_SHOWN_DELAY = 100 * 60 * 60 * 24 * 7; // 7 days

export default class ShowHeartbeatAction extends Action {
    constructor(normandy, recipe) {
        super(normandy, recipe);

        this.storage = normandy.createStorage(recipe.id);
    }

    async execute() {
        let {surveys, defaults} = this.recipe.args;

        let lastShown = await this.getLastShownDate();
        if (lastShown !== null && Date.now() - lastShown < LAST_SHOWN_DELAY) {
            return;
        }

        let survey = this.chooseSurvey(surveys, defaults);
        let flowId = this.normandy.uuid();

        // A bit redundant but the action argument names shouldn't necessarily rely
        // on the argument names showHeartbeat takes.
        await this.Normandy.showHeartbeat({
            message: survey.message,
            thanksMessage: survey.thanksMessage,
            flowId: flowId,
            postAnswerUrl: await this.annotatePostAnswerUrl(survey.postAnswerUrl),
            learnMoreMessage: survey.learnMoreMessage,
            learnMoreUrl: survey.learnMoreUrl,
        });

        this.setLastShownDate();
        this.log('Heartbeat happened!');
    }

    setLastShownDate() {
        // Returns a promise, but there's nothing to do if it fails.
        this.storage.setItem('lastShown', Date.now());
    }


    async getLastShownDate() {
        try {
            let lastShown = await this.storage.getItem('lastShown');
            return parseInt(lastShown, 10);
        } catch (err) {
            return null;
        }
    }

    async annotatePostAnswerUrl(url) {
        url = new URL(url);
        let qp = url.queryParams;

        let appInfo = await this.normandy.getAppInfo();
        qp.set('source', 'heartbeat');
        qp.set('surveyversion', VERSION);
        qp.set('updateChannel', appInfo.defaultUpdateChannel);
        qp.set('fxVersion', appInfo.version);

        return url.href;
    }

    /**
     * From the given list of surveys, choose one based on their relative
     * weights and return it.
     *
     * Weights define the probability a survey will be shown relative to other
     * weighted surveys. If two surveys have weights 10 and 20, the second one will
     * appear twice as often as the first.
     *
     * @param  {array}  surveys  Array of weighted surveys from the arguments
     *                           object.
     * @param  {object} defaults Default values for survey attributes if they aren't
     *                           specified.
     * @return {object}          The chosen survey, with the defaults applied.
     */
    chooseSurvey(surveys, defaults) {
        // Rolling sums of weights; each weight is the survey's weight plus
        // the weight of all previous surveys.
        let weights = [surveys[0].weight];
        for (let survey of surveys.slice(1)) {
            weights.push(survey.weight + weights[weights.length - 1]);
        }

        let choice = Math.random() * weights[weights.length - 1];
        let chosenSurvey = surveys[surveys.length];
        for (let k = 0; k < weights.length - 1; k++) {
            if (choice < weights[k]) {
                chosenSurvey = surveys[k];
                break;
            }
        }

        let finalSurvey = Object.assign({}, chosenSurvey);
        for (let prop in finalSurvey) {
            if (!finalSurvey[prop]) {
                finalSurvey[prop] = defaults[prop];
            }
        }

        return finalSurvey;
    }
}

registerAction('show-heartbeat', ShowHeartbeatAction);
