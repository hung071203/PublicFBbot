
module.exports.config = {
    name: 'antiout',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'Bật, tắt anti out',
    tag: 'QTV',
    usage: '!antiout '
, countDown: 700, role: 3};
 
module.exports.run = async function (api, event, args, client) {
   
    let checkQTV = await client.apis['database'].getThreadConfig(event.threadID)

    let check = await client.apis['database'].getUserThread(event.threadID, api.getCurrentUserID());
    if(!check?.isQTV) return api.sendMessage('Vui lòng thêm bot làm QTV', event.threadID, event.messageID)
    if (checkQTV.antiOut == true) {
        checkQTV.antiOut = false
        api.sendMessage('AntiOut đã tắt!', event.threadID, event.messageID);
        client.apis['database'].addThreadConfig(checkQTV)
        return;
    }
    if (checkQTV.antiOut == false) {
        checkQTV.antiOut = true
        client.apis['database'].addThreadConfig(checkQTV)
        api.sendMessage('AntiOut đã bật!', event.threadID, event.messageID);
    }
    
}
