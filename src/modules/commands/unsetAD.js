
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'unsetad',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Set admin',
    tag: 'ADMIN',
    usage: '!unsetad [Người dùng]'
, countDown: 700, role: 3};
const oldAD = global.gConfig.DEV

module.exports.run = async function (api, event, args, client) {
    let adIDs = global.gConfig.ADMINBOT
    if(Object.keys(event.mentions).length == 0) return api.sendMessage('Tin nhắn sai cú pháp!', event.threadID, event.messageID)
    if(Object.keys(event.mentions).length > 1) return api.sendMessage('Chỉ set được 1 người 1 lúc!', event.threadID, event.messageID)

    const userID = Object.keys(event.mentions)[0];
    arrAD = global.gConfig.ADMINBOT
    let check = arrAD.find(item => item == event.senderID)
    if(!check) return api.sendMessage('Bạn không có quyền dùng chức năng này!', event.threadID, event.messageID)

    let find = arrAD.find(item => item == userID)
    if(find){
        let arrADOld = oldAD
        let findOldAd = arrADOld.find(item => item == userID)
        if(findOldAd) {
            console.log(oldAD);
            
            global.gConfig.ADMINBOT = global.gConfig.ADMINBOT.filter(item => item != userID)
            return api.sendMessage('M định xóa cha t á, m bị tước quyền QTV', event.threadID, event.messageID)
        }
        global.gConfig.ADMINBOT = global.gConfig.ADMINBOT.filter(item => item != userID)
        api.sendMessage('xóa Admin bot thành công!', event.threadID, event.messageID)
    }else{
        api.sendMessage('Người dùng này không phải quản trị viên!', event.threadID, event.messageID)
    }

    const filePathBT = path.join(__dirname, '..', '..', 'gConfig.json');
    fs.writeFile(filePathBT + '.tmp', JSON.stringify(global.gConfig, null, 2), { encoding: 'utf8' }, (err) => {
        if (err) {
            console.error('Lỗi khi lưu tien file:', err);
        } else {
            fs.rename(filePathBT + '.tmp', filePathBT, (err) => {
                if (err) {
                    console.error('Lỗi khi đổi tên file:', err);
                }
            });
        }
    });
}