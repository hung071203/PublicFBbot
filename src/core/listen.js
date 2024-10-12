

module.exports = (api, client) => {
    const { handleCommand, handleReaction, handleReply, handleEvent, anyEvent, onLoad } = require('./action/action')(api, client);
    onLoad()

    async function callBackListenMqtt(err, event){
        if (err) {
            console.error('listenMqtt', err.message);
        }
        if (!event) return

        console.log(event);

        if (event.type == 'message_reply' && !event.messageReply?.messageID) return
        anyEvent(event)
        switch (event.type) {
            case "message":
                handleCommand(event);
                break;
            case "message_reply":
                handleCommand(event);
                handleReply(event);
                break;
            case "message_reaction":
                handleReaction(event);
                break;
            case "message_unsend":
                break;
            case "event":
                handleEvent(event);
                break;
            case "typ":
                break;
            case "presence":
                break;
            case "read_receipt":
                break;
            default:
                break;
        }
    }
    let lsMQTT = api.listenMqtt(callBackListenMqtt);
    setInterval(async function() {
        console.log('Stop listen MQTT....');
        lsMQTT.stopListening()
        setTimeout(function () {
            console.log('Khởi động lại listen MQTT');
            client.handleReply = client.handleReaction = []
            return lsMQTT = api.listenMqtt(callBackListenMqtt);
        }, 500);
    }, 8 * 60 * 60000)
};