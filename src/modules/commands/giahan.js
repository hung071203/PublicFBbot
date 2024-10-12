module.exports.config = {
    name: 'giahan',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Gia hạn thời gian dùng bot',
    tag: 'ADMIN',
    usage: '!giahan [mã nhóm(nếu cần)] [thời gian(ngày)]'
, countDown: 700, role: 1};


module.exports.run = async function (api, event, args, client) {
    
    let check = global.gConfig.ADMINBOT.find(item => item == event.senderID)
    if(!check) return api.sendMessage('Bạn không có quyền dùng chức năng này!', event.threadID, event.messageID)

    let threadID = ''
    let time = 0
    if(args.length == 2){
        threadID = event.threadID
        if(isNaN(args[1])) return api.sendMessage('Cú pháp không hợp lệ!', event.threadID, event.messageID)
        time = parseInt(args[1]) * 24 * 60 *60 * 1000
    }else{
        threadID = args[1]
        if(isNaN(args[2])) return api.sendMessage('Cú pháp không hợp lệ!', event.threadID, event.messageID)
        time = parseInt(args[2]) * 24 * 60 *60 * 1000
    }

    let find  = await client.apis['database'].getThreadConfig(threadID)
    if(!find) return api.sendMessage('Nhóm không tồn tại!', event.threadID, event.messageID)
    find.time = parseInt(event.timestamp) + time
    client.apis['database'].addThreadConfig(find)
    api.sendMessage('Gia hạn cho nhóm thành công!', event.threadID, event.messageID)
}