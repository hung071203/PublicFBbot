module.exports.config = {
    name: 'lixi',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'chia tiền cho mọi người trong nhóm',
    tag: 'Money',
    usage: '!lixi [Số tiền muốn lì xì]'
, countDown: 700, role: 3};

module.exports.run = async function (api, event, args, client) {
    if (args.length != 2 || isNaN(args[1])) {
        api.sendMessage('Cú pháp không hợp lệ', event.threadID, event.messageID);
        return;
    }

    let mn = parseInt(args[1]);
    const senderID = event.senderID;
    const threadID = event.threadID;
    
    const senderAccount = await client.apis['database'].getBank(threadID, senderID)

    if (!senderAccount || senderAccount.money < mn|| mn < 0) {
        api.sendMessage('Bạn không đủ tiền để thực hiện hành động này', threadID, event.messageID);
        return;
    }

    senderAccount.money -= mn;
    let recipients = await client.apis['database'].getBank(threadID)
    recipients = recipients.filter(item => item.ID != senderID)
    let msg = `Tổng: ${mn.toLocaleString('en-US')}$\n`;
    let mnp = mn/recipients.length
    recipients.forEach((recipient, index) => {
        recipient.money += mnp
        client.apis['database'].addBank(recipient)
    });
    msg += `Mỗi người được chia ${mnp.toLocaleString('en-US')}$`
    client.apis['database'].addBank(senderAccount)
    api.sendMessage(msg, threadID, event.messageID);
};


