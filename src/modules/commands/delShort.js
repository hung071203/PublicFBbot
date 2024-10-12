

module.exports.config = {
    name: 'delshort',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' xoa shortcut',
    tag: 'shortcut',
    usage: '!delshort [tên shortcut]'
, countDown: 700, role: 3};
 
module.exports.run = async function (api, event, args, client) {
   if(args.length == 1) return api.sendMessage('Tên short k được trống', event.threadID, event.messageID);
    let query = args.slice(1).join(" ");
    let find = await client.apis['database'].getShortcut(event.threadID, query)
    if(!find) return api.sendMessage('shortcut không tồn tại!', event.threadID, event.messageID);
    client.apis['database'].delShortcut(find.rowID)
    api.sendMessage('Xóa thành công', event.threadID, event.messageID);
}
