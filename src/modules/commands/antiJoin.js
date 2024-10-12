
module.exports.config = {
    name: 'antijoin',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'Bật, tắt anti join',
    tag: 'QTV',
    usage: '!antijoin '
, countDown: 700, role: 2};
 
module.exports.run = async function (api, event, args, client) {
   
    let checkQTV = await client.apis['database'].getThreadConfig(event.threadID)

    let check = await client.apis['database'].getUserThread(event.threadID, api.getCurrentUserID());
    if(!check?.isQTV) return api.sendMessage('Vui lòng thêm bot làm QTV', event.threadID, event.messageID)
    if (checkQTV.antiJoin == true) {
        checkQTV.antiJoin = false
        api.sendMessage('AntiJoin đã tắt!', event.threadID, event.messageID);
        client.apis['database'].addThreadConfig(checkQTV)
        return;
    }
    if (checkQTV.antiJoin == false) {
        checkQTV.antiJoin = true
        client.apis['database'].addThreadConfig(checkQTV)
        api.sendMessage('AntiJoin đã bật!', event.threadID, event.messageID);
    }
    
}
