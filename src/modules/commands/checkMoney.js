module.exports.config = {
    name: "ctk",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Kiểm tra số tiền hiện tại của bản thân",
    tag: 'Money',
    usage: "!ctk []"
  , countDown: 700, role: 3};
  
  
module.exports.run = async function (api, event, args, client) {
    let uid = event.senderID
    if (event.type == 'message_reply'){
        let arrADs = global.gConfig.ADMINBOT
        let find = arrADs.find(item => item = event.senderID)
        if(!find) return api.sendMessage('Chỉ quản trị viên mới có thể dùng chức năng này!', event.threadID,event.messageID)
        uid = event.messageReply.senderID
    }
    const id = await client.apis['database'].getBank(event.threadID, uid)
        if (id) {
            let msgs = `Tên người dùng: ${id.name} \n━━━━━━━━━━━━━━━━━━\nSố tài khoản: ${id.ID} \n━━━━━━━━━━━━━━━━━━\nsố tiền hiện tại: ${id.money.toLocaleString('en-US')}$\n━━━━━━━━━━━━━━━━━━\nsố tiền hiện tại trong lợn: ${id.moneyL.toLocaleString('en-US')}$(+7%/day, tối đa 999,999,999$)\n━━━━━━━━━━━━━━━━━━\nsố nợ hiện tại: ${id.moneyV.toLocaleString('en-US')}$(+10%/1day)\n━━━━━━━━━━━━━━━━━━\n`
            msgs += '\nThông tin các đồng crypto đang sở hữu!\n\n'
            const userCrypto = await client.apis["database"].getCrypto(event.threadID, uid);
            if(!userCrypto || userCrypto.length == 0) msgs += 'Trống!'
            userCrypto.forEach((data, index) => {
                msgs += `${index + 1}. ${data.name} - ${data.amount} - ${data.price.toFixed(2)}$\n`;
            })
            msgs += 'Định dạng: | name - amount - price$ |\n━━━━━━━━━━━━━━━━━━\n'
           api.sendMessage(msgs, event.threadID, event.messageID);
            
        }else{
            api.sendMessage('Người dùng không tồn tại!', event.threadID,event.messageID);
        }
}