module.exports.config = {
    name: 'ban',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Cấm người dùng dùng bot, trả lời tn ng muốn ban',
    tag: 'ADMIN',
    usage: '!ban [thời gian(phút)] [Lý do]'
    , countDown: 700, role: 1
};


module.exports.run = async function (api, event, args, client) {

    if (event.type != 'message_reply') return api.sendMessage('Vui lòng đính kèm tin nhắn người muốn ban', event.threadID, event.messageID)


    const userID = event.messageReply.senderID
    if (isNaN(args[1])) return api.sendMessage('Thời gian ban phải là 1 số', event.threadID, event.messageID)
    let find = await client.apis['database'].getUserThread(event.threadID, userID)
    let des = args.slice(2).join(" ")

    let timeBan = parseInt(args[1]) * 60 * 1000
    if (!find?.isQTV) {
        client.apis['database'].addUserThread({
            threadID: event.threadID,
            userID: userID,
            desBan: des,
            timeBan: parseInt(event.timestamp) + timeBan,
            nickName: "",
            isQTV: false,
        })
        return api.sendMessage(`Ban người dùng thành công ${args[1]} phút !`, event.threadID, event.messageID)
    }
    find.timeBan += timeBan
    find.desBan = des
    client.apis['database'].addUserThread(find)
    api.sendMessage(`Người dùng này đã bị cấm dùng bot thêm ${args[args.length - 1]} phút`, event.threadID, event.messageID)
}