module.exports.config = {
    name: "remoney",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Reset tiền tài khoản",
    tag: 'ADMIN',
    usage: "!remoney (stk)"
  , countDown: 700, role: 3};
  
  
module.exports.run = async function (api, event, args, client) {
    let argsAD = global.gConfig.ADMINBOT
    let checkAD = argsAD.find(item => item == event.senderID)
    if (!checkAD) {
        api.sendMessage('bạn không có quyền dùng chức năng này!', event.threadID, event.messageID);
        return;
    }
    const id = await client.apis['database'].getBank(event.threadID, args[1])
        if (id) {
          id.money = 0
          id.moneyL = 0
          id.moneyV = 0
          client.apis['database'].addBank(id)
          api.sendMessage('Reset thành công!', event.threadID,event.messageID);
          
        }else{
          if(args[1] == 'all'){
            client.apis['database'].delBank(event.threadID)
            
            return api.sendMessage('reset toàn bộ nhóm thành công!', event.threadID,event.messageID);
          }
            api.sendMessage('Số tài khoản không tồn tại', event.threadID,event.messageID);

        }
}