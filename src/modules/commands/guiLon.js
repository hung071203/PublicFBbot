module.exports.config = {
    name: "gui",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Gửi lợn",
    tag: 'Money',
    usage: "!gui [so tien]", 
    countDown: 700, 
    role: 3};
  
  
module.exports.run = async function (api, event, args, client) {
    if (args.length == 1 || isNaN(args[1]) || args.length > 2) {
        api.sendMessage('cú pháp không hợp lệ', event.threadID, event.messageID);
        return;
    }
    mn = parseInt(args[1]);
    if(mn < 0) return api.sendMessage('cú pháp k hợp lệ, số tiền k được âm', event.threadID, event.messageID);
    const id = await client.apis['database'].getBank(event.threadID, event.senderID)
    if (mn>id.money) {
        api.sendMessage('Bạn không đủ tiền', event.threadID, event.messageID);
        return;
    }
    id.moneyL += mn;
    id.money -= mn;
    if (id.timeL == 0) {
        id.timeL = Date.now();
    }
    client.apis['database'].addBank(id)
    api.sendMessage(`Bạn đã gửi ${mn.toLocaleString('en-US')}$ với lãi suất 7%/day`, event.threadID, event.messageID);

}