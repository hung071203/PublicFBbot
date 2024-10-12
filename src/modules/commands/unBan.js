module.exports.config = {
    name: 'unban',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'Hủy cấm người dùng dùng bot',
    tag: 'ADMIN',
    usage: '!unban [Người dùng]'
, countDown: 700, role: 1};


module.exports.run = async function (api, event, args, client) {
    if(event.type!= 'message_reply') return api.sendMessage('Vui lòng đính kèm tin nhắn người muốn hủy ban', event.threadID, event.messageID)

    const userID = event.messageReply.senderID

    let find  = await client.apis['database'].getUserThread(event.threadID, userID)
    if(!find){
        return api.sendMessage('Người dùng này chưa từng bị ban!', event.threadID, event.messageID)
    }
    if (find.timeBan < parseInt(event.timestamp)) {
        return api.sendMessage(`Người dùng này không bị ban!`, event.threadID, event.messageID)
    }
    find.timeBan = parseInt(event.timestamp)
    client.apis['database'].addUserThread(find)
    api.sendMessage(`Gỡ ban thành công!`, event.threadID, event.messageID)
}