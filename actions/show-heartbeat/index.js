import uuid from 'uuid';


Normandy.registerAction('show-heartbeat', function(_, args) {
    let flowId = uuid.v4();

    // A bit redundant but the action argument names shouldn't necessarily rely
    // on the argument names showHeartbeat takes.
    Normandy.showHeartbeat({
        message: args.message,
        thanksMessage: args.thanksMessage,
        flowId: flowId,
        postAnswerUrl: args.postAnswerUrl,
        learnMoreMessage: args.learnMoreMessage,
        learnMoreUrl: args.learnMoreUrl,
    }).then(() => {
        console.log('Heartbeat happened!');
    });
});
