module.exports.config = {
    name: "trano",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Thanh toan khoan vay",
    tag: 'Money',
    usage: "!trano"
, countDown: 700, role: 3};
  
  
module.exports.run = async function (api, event, args, client) {
    const id = await client.apis['database'].getBank(event.threadID, event.senderID)
    if(id.moneyV <= 0){
        api.sendMessage('Có nợ đâu mà trả!', event.threadID, event.messageID);
        return;
    }
    if (id.moneyV > id.money) {
        id.moneyV -= id.money;
        id.money = 0;
        client.apis['database'].addBank(id)
        api.sendMessage(`Bạn còn nợ ${id.moneyV.toLocaleString('en-US')}$`, event.threadID, event.messageID);
        return;
    }
    id.money -= id.moneyV;
    id.moneyV = 0;
    api.sendMessage(`Bạn còn nợ ${id.moneyV.toLocaleString('en-US')}$\nSố tiền hiện tại: ${id.money.toLocaleString('en-US')}$`, event.threadID, event.messageID);
    client.apis['database'].addBank(id)
}