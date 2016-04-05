import {mockNormandy} from './utils';
import ShowHeartbeatAction from '../actions/show-heartbeat/index';


function surveyFactory(props={}) {
    return Object.assign({
        message: 'test message',
        thanksMessage: 'thanks!',
        postAnswerUrl: 'http://example.com',
        learnMoreMessage: 'Learn More',
        learnMoreUrl: 'http://example.com',
        weight: 100,
    }, props);
}


function recipeFactory(props={}) {
    return Object.assign({
        id: 1,
        arguments: {
            defaults: {},
            surveys: [surveyFactory()],
        },
    }, props);
}


describe('ShowHeartbeatAction', function() {
    beforeEach(function() {
        this.normandy = mockNormandy();
    });

    it('should run without errors', async function() {
        let action = new ShowHeartbeatAction(this.normandy, recipeFactory());
        await action.execute();
    });

    it('should not show heartbeat if it has shown within the past 7 days', async function() {
        let recipe = recipeFactory();
        let action = new ShowHeartbeatAction(this.normandy, recipe);

        this.normandy.mock.storage.data['lastShown'] = '100';
        spyOn(Date, 'now').and.returnValue(10);

        await action.execute();
        expect(this.normandy.showHeartbeat).not.toHaveBeenCalled();
    });

    it('should show heartbeat in testing mode regardless of when it was last shown', async function() {
        let recipe = recipeFactory();
        let action = new ShowHeartbeatAction(this.normandy, recipe);

        this.normandy.testing = true;
        this.normandy.mock.storage.data['lastShown'] = '100';
        spyOn(Date, 'now').and.returnValue(10);

        await action.execute();
        expect(this.normandy.showHeartbeat).toHaveBeenCalled();
    });

    it("should show heartbeat if it hasn't shown within the past 7 days", async function() {
        let recipe = recipeFactory();
        let action = new ShowHeartbeatAction(this.normandy, recipe);

        this.normandy.mock.storage.data['lastShown'] = '100';
        spyOn(Date, 'now').and.returnValue(9999999999);

        await action.execute();
        expect(this.normandy.showHeartbeat).toHaveBeenCalled();
    });

    it('should show heartbeat if the last-shown date cannot be parsed', async function() {
        let recipe = recipeFactory();
        let action = new ShowHeartbeatAction(this.normandy, recipe);

        this.normandy.mock.storage.data['lastShown'] = 'bigo310s0baba';
        spyOn(Date, 'now').and.returnValue(10);

        await action.execute();
        expect(this.normandy.showHeartbeat).toHaveBeenCalled();
    });

    it('should generate a UUID and pass it to showHeartbeat', async function() {
        let recipe = recipeFactory();
        let action = new ShowHeartbeatAction(this.normandy, recipe);

        this.normandy.uuid.and.returnValue('fake-uuid');

        await action.execute();
        expect(this.normandy.showHeartbeat).toHaveBeenCalledWith(jasmine.objectContaining({
            flowId: 'fake-uuid',
        }));
    });

    it('should annotate the post-answer URL with extra query args', async function() {
        let url = 'https://example.com';
        let recipe = recipeFactory();
        recipe.arguments.surveys[0].postAnswerUrl = url;
        let action = new ShowHeartbeatAction(this.normandy, recipe);

        this.normandy.mock.client.version = '42.0.1';
        this.normandy.mock.client.channel = 'nightly';

        await action.execute();
        expect(this.normandy.showHeartbeat).toHaveBeenCalledWith(jasmine.objectContaining({
            postAnswerUrl: (url + '?source=heartbeat&surveyversion=52' +
                            '&updateChannel=nightly&fxVersion=42.0.1'),
        }));
    });

    it('should annotate the post-answer URL if it has an existing query string', async function() {
        let url = 'https://example.com?foo=bar';
        let recipe = recipeFactory();
        recipe.arguments.surveys[0].postAnswerUrl = url;
        let action = new ShowHeartbeatAction(this.normandy, recipe);

        this.normandy.mock.client.version = '42.0.1';
        this.normandy.mock.client.channel = 'nightly';

        await action.execute();
        expect(this.normandy.showHeartbeat).toHaveBeenCalledWith(jasmine.objectContaining({
            postAnswerUrl: (url + '&source=heartbeat&surveyversion=52' +
                            '&updateChannel=nightly&fxVersion=42.0.1'),
        }));
    });

    it('should annotate the post-answer URL with a testing param in testing mode', async function() {
        let url = 'https://example.com';
        let recipe = recipeFactory();
        recipe.arguments.surveys[0].postAnswerUrl = url;
        let action = new ShowHeartbeatAction(this.normandy, recipe);

        this.normandy.testing = true;
        this.normandy.mock.client.version = '42.0.1';
        this.normandy.mock.client.channel = 'nightly';

        await action.execute();
        expect(this.normandy.showHeartbeat).toHaveBeenCalledWith(jasmine.objectContaining({
            postAnswerUrl: (url + '?source=heartbeat&surveyversion=52' +
                            '&updateChannel=nightly&fxVersion=42.0.1&testing=1'),
        }));
    });

    it('should set the last-shown date', async function() {
        let action = new ShowHeartbeatAction(this.normandy, recipeFactory());

        spyOn(Date, 'now').and.returnValue(10);

        expect(this.normandy.mock.storage.data['lastShown']).toBeUndefined();
        await action.execute();
        expect(this.normandy.mock.storage.data['lastShown']).toEqual('10');
    });

    it('should choose a random survey based on the weights', async function() {
        // This test relies on the order of surveys passed in, which sucks.
        let survey20 = surveyFactory({message: 'survey20', weight: 20});
        let survey30 = surveyFactory({message: 'survey30', weight: 30});
        let survey50 = surveyFactory({message: 'survey50', weight: 50});
        let recipe = recipeFactory({arguments: {surveys: [survey20, survey30, survey50]}});

        spyOn(Math, 'random').and.returnValues(0.1, 0.4);

        let action = new ShowHeartbeatAction(this.normandy, recipe);
        await action.execute();
        expect(this.normandy.showHeartbeat).toHaveBeenCalledWith(jasmine.objectContaining({
            message: survey20.message,
        }));

        // If the random number changes, return a different survey.
        this.normandy = mockNormandy();
        action = new ShowHeartbeatAction(this.normandy, recipe);
        await action.execute();
        expect(this.normandy.showHeartbeat).toHaveBeenCalledWith(jasmine.objectContaining({
            message: survey30.message,
        }));
    });
});
