module.exports.config = {
    name: 'arm',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'Tự động gửi lại tin nhắn đã thu hồi ',
    tag: 'QTV',
    usage: '!arm'
, countDown: 700, role: 2};

module.exports.run = async function (api, event, args, client) {
    let checkQTV= await client.apis['database'].getThreadConfig(event.threadID)
    if (checkQTV.remess == 0) {
        checkQTV.remess = 1;
        api.sendMessage('Tự động gửi lại tin nhắn thu hồi đã bật!', event.threadID, event.messageID);
        
    } else if (checkQTV.remess == 1) {
        checkQTV.remess = 0;
        api.sendMessage('Tự động gửi lại tin nhắn thu hồi đã tắt!', event.threadID, event.messageID);
    }
    client.apis['database'].addThreadConfig(checkQTV)
}