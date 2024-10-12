

module.exports.config = {
    name: 'check',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'Kiểm tra thông tin bản thân',
    tag: 'system',
    usage: '!check'
, countDown: 700, role: 3};

module.exports.run = async function (api, event, args, client) {
    api.getUserInfo(event.senderID, async (err, info) => {
        if (err) {
            console.error(err);
            api.sendMessage('Có lỗi khi truy vấn thông tin bạn, thử lại sau!', event.threadID, event.messageID)

        } else {
            console.log(info[event.senderID]);
            msgs =`🎄Dữ liệu cá nhân của ${info[event.senderID].name}:\n---------------------------------------------------------\n`
            msgs += `🪪ID người dùng: ${event.senderID}\n`
            msgs += `🆔Biệt danh: ${info[event.senderID].vanity}\n`
            msgs += `🕵️Giới tính: ${info[event.senderID].gender}\n---------------------------------------------------------\n`
            msgs += '🎄Kiểm tra tương tác của nguời dùng:\n---------------------------------------------------------\n'
            let find = await client.apis['database'].getMessage(event.threadID, event.senderID)
            if(!find){
                msgs +='Tương tác đi rồi kiểm tra lại!'
            }else{
                msgs +=`🎈Tổng số tin nhắn: ${find.total}\n`
                msgs +=`🚲Số tin nhắn trong tuần: ${find.week}\n`
                msgs +=`🚲Số tin nhắn trong ngày: ${find.day}\n`
            }
            
            api.shareContact(msgs, event.senderID, event.threadID, (err, data) => {
                if(err) {
                    console.log(err);
                }
            })
        }
      });
}
