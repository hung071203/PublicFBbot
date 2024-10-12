module.exports.config = {
    name: "rut",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Thanh toan khoan vay",
    tag: 'Money',
    usage: "!rut [so tien]"
, countDown: 700, role: 3};
  
  
module.exports.run = async function (api, event, args, client) {
    const id = await client.apis['database'].getBank(event.threadID, event.senderID)
    if(id.moneyL <= 0){
        api.sendMessage('không đủ tiền để rút!', event.threadID, event.messageID);
        id.moneyL = 0;
        return;
    }
    if(args.length > 2) return api.sendMessage('Cú pháp không hợp lệ!', event.threadID, event.messageID);
    money = 0
    if (isNaN(args[1]) && args[1] == 'all') {
        money = id.moneyL
        id.money += id.moneyL;
        id.moneyL = 0;
    }else if (!isNaN(args[1])) {
        if(id.moneyL < parseInt(args[1]) || parseInt(args[1]) < 0) return api.sendMessage('không đủ tiền để rút!', event.threadID, event.messageID);
        money = parseInt(args[1])
        id.moneyL -= parseInt(args[1]);
        id.money += parseInt(args[1]);
    }else{
        api.sendMessage('Cú pháp không hợp lệ!', event.threadID, event.messageID);
        return;
    }
    client.apis['database'].addBank(id)
    api.sendMessage(`Bạn đã rút ${money.toLocaleString('en-US')}$`, event.threadID, event.messageID);
    
    
    
    
}