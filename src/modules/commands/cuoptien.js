module.exports.config = {
    name: "cuop",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Cướp tiền của 1 người dùng bất kì",
    tag: 'Money',
    usage: "!cuop [stk(nếu cần)]"
  , countDown: 700, role: 3};
  
let checkArr =[];
module.exports.run = async function (api, event, args, client) {
    let arr = await client.apis['database'].getBank(event.threadID)
    const id = arr.find(item => item.ID == event.senderID)
    arr = arr.filter(item => item.ID != event.senderID)
    const rd = Math.floor(Math.random() * arr.length);
    
    if (!id) return api.sendMessage('Có lỗi xảy ra, thử lại', event.threadID, event.messageID)

    checkArr.push({
        ID: event.senderID,
        threadID: event.threadID,
        timeST: event.timestamp
    })
    let cArr =[]
    for (let i = 0; i < checkArr.length; i++) {
        if (checkArr[i].ID == event.senderID && checkArr[i].threadID == event.threadID) {
            cArr.push(checkArr[i]);
        }
        
    }
    if (cArr[cArr.length - 1].timeST - cArr[cArr.length - 1].timeST <= 15* 60 *1000) {
        if (cArr.length >= 10) {
            if (parseInt(event.timestamp) - parseInt(cArr[9].timeST) < 3*60*1000) {
                var date = new Date(parseInt(cArr[9].timeST) + 3*60*1000);
        
                var localeDate = date.toLocaleString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh'});
                api.sendMessage(`Spam ít thôi, bạn sẽ có thể sử dụng chức năng này lúc ${localeDate}`, event.threadID, event.messageID);
                return;
            }else{
                let sarr = [];
                sarr.push(checkArr[checkArr.length -1]);
                for (let i = 0; i < checkArr.length; i++) {
                    if (checkArr[i].ID == event.senderID && checkArr[i].threadID == event.threadID) {
                        
                    }else{
                        sarr.push(checkArr[i]);
                    }
                    
                }
                checkArr.length = 0;
                checkArr = sarr;
            }
            
            
        }
    }
    

    if (args.length < 2) {
        const c = Math.floor(Math.random() * 10);
        if(arr[rd].money == Infinity) return api.sendMessage(`Không thể cướp mục tiêu`, event.threadID, event.messageID);
        if (c == 2) {
            id.money += arr[rd].money * 0.1;
            arr[rd].money -= arr[rd].money * 0.1;
            client.apis['database'].addBank(arr[rd])
            api.sendMessage(`Bạn đã cướp ${(arr[rd].money * 0.1).toLocaleString('en-US')}$ từ ${arr[rd].name}`, event.threadID, event.messageID);
            
        }else{
            api.sendMessage('Số bạn đen như chó, thử lại', event.threadID, event.messageID);
            
        }
    }else{
        const c = Math.floor(Math.random() * 15);
        const cu = await client.apis['database'].getBank(event.threadID, args[1])
        if (!cu) {
            api.sendMessage('Người dùng không tồn tại', event.threadID, event.messageID);

        }else{
            if(cu.money == Infinity) return api.sendMessage(`Không thể cướp mục tiêu`, event.threadID, event.messageID);
            if (c == 2) {
                id.money += cu.money * 0.2;
                api.sendMessage(`Bạn đã cướp ${(cu.money * 0.2).toLocaleString('en-US')}$ từ ${cu.name}`, event.threadID, event.messageID);
                
                
                cu.money -= cu.money * 0.2;
                client.apis['database'].addBank(cu)
            }else{
                api.sendMessage('Số bạn đen như chó, thử lại', event.threadID, event.messageID);
                
            }
        }
    }
    client.apis['database'].addBank(id)

}