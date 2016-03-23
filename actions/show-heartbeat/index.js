import {Action, registerAction, weightedChoose} from '../utils';

const VERSION = 52; // Increase when changed.
const LAST_SHOWN_DELAY = 1000 * 60 * 60 * 24 * 7; // 7 days

export default class ShowHeartbeatAction extends Action {
    constructor(normandy, recipe) {
        super(normandy, recipe);
        this.storage = normandy.createStorage(recipe.id);
    }

    async execute() {
        let {surveys, defaults} = this.recipe.arguments;

        let lastShown = await this.getLastShownDate();
        let shouldShowSurvey = (
            this.normandy.testing
            || lastShown === null
            || Date.now() - lastShown > LAST_SHOWN_DELAY
        );
        if (!shouldShowSurvey) {
            return;
        }

        let survey = this.chooseSurvey(surveys, defaults);
        let flowId = this.normandy.uuid();

        // A bit redundant but the action argument names shouldn't necessarily rely
        // on the argument names showHeartbeat takes.
        await this.normandy.showHeartbeat({
            message: survey.message,
            thanksMessage: survey.thanksMessage,
            flowId: flowId,
            postAnswerUrl: await this.annotatePostAnswerUrl(survey.postAnswerUrl),
            learnMoreMessage: survey.learnMoreMessage,
            learnMoreUrl: survey.learnMoreUrl,
        });

        this.setLastShownDate();
        this.normandy.log('Heartbeat happened!');
    }

    setLastShownDate() {
        // Returns a promise, but there's nothing to do if it fails.
        this.storage.setItem('lastShown', Date.now());
    }

    async getLastShownDate() {
        let lastShown = Number.parseInt(await this.storage.getItem('lastShown'), 10);
        return Number.isNaN(lastShown) ? null : lastShown;
    }

    async annotatePostAnswerUrl(url) {
        let appInfo = await this.normandy.getAppInfo();
        let args = [
            ['source', 'heartbeat'],
            ['surveyversion', VERSION],
            ['updateChannel', appInfo.defaultUpdateChannel],
            ['fxVersion', appInfo.version],
        ];
        let params = args.map(([a, b]) => `${a}=${b}`).join('&');

        if (url.indexOf('?') !== -1) {
            url += '&' + params;
        } else {
            url += '?' + params;
        }

        return url;
    }

    /**
     * From the given list of surveys, choose one based on their relative
     * weights and return it.
     *
     * @param  {array}  surveys  Array of weighted surveys from the arguments
     *                           object.
     * @param  {object} defaults Default values for survey attributes if they aren't
     *                           specified.
     * @return {object}          The chosen survey, with the defaults applied.
     */
    chooseSurvey(surveys, defaults) {
        let finalSurvey = Object.assign({}, weightedChoose(surveys));
        for (let prop in defaults) {
            if (!finalSurvey[prop]) {
                finalSurvey[prop] = defaults[prop];
            }
        }

        return finalSurvey;
    }
}

registerAction('show-heartbeat', ShowHeartbeatAction);
