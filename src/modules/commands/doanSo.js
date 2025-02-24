module.exports.config = {
    name: "doan",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Đoán số",
    tag: 'game',
    usage: "!doan [số từ 1 đến 100] [so tien]"
, countDown: 700, role: 3};
  
  
module.exports.run = async function (api, event, args, client) {
   let r1 = Math.floor(Math.random() * 80) +1;
   let r2 = r1 + 20;

   if (args[1] == 'help' || args.length == 1) {
    let msg ='Cách chơi: bạn chọn 1 số từ 1 đến 100, nếu số bạn chọn nằm trong đoạn cho trước thì bạn thắng\n';
    msg+= 'Phần thưởng: Nếu thắng, số tiền bạn nhận bằng số tiến cược nhân với khoảng cách từ đoạn gần nhất đến số bạn chọn. Ví dụ bạn chọn 5 nằm trong đoạn 1 đến 6, số tiền bạn nhận sẽ bằng tiền cược *(6 - 1)\n Đặc biệt nếu bạn chọn số chính giữa đoạn thì tiền bạn nhận được sẽ nhân gap 10 lần. \n'
    msg += 'Phạt: Nếu thua, Số tiền bạn mất bằng số tiến cược nhân với khoảng cách từ đoạn gần nhất đến số bạn chọn.'
    api.sendMessage(msg, event.threadID, event.messageID);
    return;
    }
    if(args.length != 3 ) return api.sendMessage('cú pháp không hợp lệ', event.threadID, event.messageID);
   if (isNaN(args[1]) || isNaN(args[2])) {
    api.sendMessage('cú pháp không hợp lệ', event.threadID, event.messageID);
    return;
   }
   const id = await client.apis['database'].getBank(event.threadID, event.senderID)
   
   num = parseInt(args[1]);
   mn = parseInt(args[2]);
   if (mn < 100) {
    api.sendMessage('Tối thiểu cần 100$', event.threadID, event.messageID);
    return;
   }
   if (!id) return;

    if (id.money < mn) {
        api.sendMessage('Bạn quá nghèo để thực hiện hành động này!', event.threadID, event.messageID);
        return;
    }
   if (num>=r1 && num<=r2) {
        const h1 = num - r1;
        const h2 = r2 - num;
        let b = 0;
        if (h1== 0 ||h2 == 0) {
            b = 10;
        }else if (h1>h2) {
            b = h2;
        }else if (h2>h1) {
            b = h1;
        }else {
            b=h1;
        }

        id.money += mn*b;
        api.sendMessage(`Số bạn chọn: ${num} nằm trong đoạn ${r1} đến ${r2}\nBạn nhận được ${(mn*b).toLocaleString('en-US')}$`, event.threadID, event.messageID);


   }else{
        
        let b = 0;
        if (num< r1 && num<r2) {
            b= (r1 - num);
        }else{
            b= (num-r2);
        }
        const mnN = mn * b;
        if (id.money < mnN) {
            
            id.moneyV += (mnN - id.money);
            id.money =0;
            api.sendMessage(`Số bạn chọn: ${num} nằm ngoài đoạn ${r1} đến ${r2}\nBạn mất ${(mn*b).toLocaleString('en-US')}$\nSố tiền còn thiếu sẽ được tính vào nợ!\nSố nợ hiện tại ${id.moneyV.toLocaleString('en-US')}$`, event.threadID, event.messageID);
        }else{
            id.money -= mnN;
            api.sendMessage(`Số bạn chọn: ${num} nằm ngoài đoạn ${r1} đến ${r2}\nBạn mất ${(mnN).toLocaleString('en-US')}$`, event.threadID, event.messageID);

        }
        client.apis['database'].addBank(id)
   }
}
