
module.exports.config = {
    name: 'qtv',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Chỉ qtv được dùng bot (bật/tắt)',
    tag: 'QTV',
    usage: '!qtv '
, countDown: 700, role: 2};
 
module.exports.run = async function (api, event, args, client) {
   
    let checkQTV = await client.apis['database'].getThreadConfig(event.threadID)
    if (checkQTV.checkid == 0) {
        let checkbot = await client.apis['database'].getUserThread(event.threadID, api.getCurrentUserID());
        if(!checkbot?.isQTV) return api.sendMessage('vui lòng cho bot làm QTV. Nếu đã cho, vui lòng đợi 1p rồi thử lại!', event.threadID)
        checkQTV.checkid = 1;
        api.sendMessage('Đã bật QTV dùng bot!', event.threadID, event.messageID);
        client.apis['database'].addThreadConfig(checkQTV)
        console.log(checkQTV);
        return;
    }
    if (checkQTV.checkid == 1) {
        
        checkQTV.checkid = 0;
        api.sendMessage('Đã tắt QTV dùng bot!', event.threadID, event.messageID); 
        console.log(checkQTV);
        client.apis['database'].addThreadConfig(checkQTV)
    }
    
}
