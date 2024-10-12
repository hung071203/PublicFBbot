
module.exports.config = {
    name: 'prefix',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Hiện prefix của nhóm và hệ thống',
    tag: 'system',
    usage: '!prefix'
, countDown: 700, role: 3};
 
module.exports.run = async function (api, event, args, client) {
    let find = await client.apis['database'].getThreadConfig(event.threadID)
    let msg = `→Prefix nhóm: ${find.prefix}\n→Prefix hệ thống: ${global.gConfig.PREFIX}`
    api.sendMessage(msg, event.threadID, event.messageID)
    
}
module.exports.noprefix = async function (api, event, args, client) {
    let find = await client.apis['database'].getThreadConfig(event.threadID)
    let msg = `→Prefix nhóm: ${find.prefix}\n→Prefix hệ thống: ${global.gConfig.PREFIX}`
    api.sendMessage(msg, event.threadID, event.messageID)
}
