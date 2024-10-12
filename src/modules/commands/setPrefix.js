module.exports.config = {
    name: 'setpf',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Set prefix của nhóm',
    tag: 'system',
    usage: '!setpf [dấu lệnh mới]'
, countDown: 700, role: 3};
 
module.exports.run = async function (api, event, args, client) {
    if (args.length != 2 ) return api.sendMessage(`Lỗi khi đặt prefix nhóm, thử lại!`, event.threadID, event.messageID)
    let find = await client.apis['database'].getThreadConfig(event.threadID)
    find.prefix = args[1]
    client.apis['database'].addThreadConfig(find)
    api.sendMessage(`Dấu lệnh nhóm đã được đổi sang ${args[1]}`, event.threadID, event.messageID)
    
}
