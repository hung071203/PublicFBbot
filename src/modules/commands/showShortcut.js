
module.exports.config = {
    name: 'short',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Hiện tất cả shortcut',
    tag: 'shortcut',
    usage: '!short'
, countDown: 700, role: 3};
 
module.exports.run = async function (api, event, args, client) {
   if(args.length == 1) {
    let msgs = `Tất cả shortcut của nhóm:\n`;
    let i=1;
    const find = await client.apis['database'].getShortcut(event.threadID)
    find.forEach(e => {
        msgs+= `[${i}] ${e.name}\n`;
        i++;
    });
    api.sendMessage(msgs, event.threadID, event.messageID);
    return;
   }
   
    
}
