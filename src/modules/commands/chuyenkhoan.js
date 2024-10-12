module.exports.config = {
    name: "ck",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Chuyển tiền",
    tag: 'Money',
    usage: "!ck [số tài khoản người nhận] [Số tiền]"
  , countDown: 700, role: 3};
  
  
module.exports.run = async function (api, event, args, client) {
    if (args.length == 1) {
        api.sendMessage('Vui lòng nhập số tài khoản người nhận!', event.threadID, event.messageID);
    }else if(args.length == 3){
        const check = await client.apis['database'].getBank(event.threadID, event.senderID)
        const idC = await client.apis['database'].getBank(event.threadID, args[1])
        console.log(check);
        console.log(idC);
        if (check) {
            if (!idC) {
                api.sendMessage('Số tài khoản không tồn tại, thử lại', event.threadID, event.messageID);
            }else{
                if (check.money<parseInt(args[2]) + parseInt(args[2]) * 0.1 || parseInt(args[2]) < 0 ) {
                    api.sendMessage('Không đủ tiền để thực hiện hành động này!', event.threadID, event.messageID);
                }else{
                    check.money -= (parseInt(args[2]) + parseInt(args[2]) * 0.1);
                    idC.money += parseInt(args[2]);
                    console.log(idC);
                    api.sendMessage(`Giao dịch thành công đến chủ tk: ${idC.name}\nPhí dịch vụ 10% Số tiền giao dịch`, event.threadID, event.messageID);
                    client.apis['database'].addBank(idC)
                    client.apis['database'].addBank(check)
                    
                }
            }
            
        }
    }else{
        api.sendMessage('cú pháp không hợp lệ!', event.threadID, event.messageID);
    }
}