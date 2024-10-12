
module.exports.config = {
    name: "cbox",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Xem thông tin nhóm",
    tag: 'system',
    usage: "!cbox"
  , countDown: 700, role: 3};
  
  
module.exports.run = async function (api, event, args, client) {
    let find = await client.apis['database'].getThreadConfig(event.threadID)
    if(!find) return api.sendMessage('Không có thông tin nhóm này, thử lại!', event.threadID, event.messageID)
    var d = new Date(find.time);
    var lDate = d.toLocaleString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh'});
    
    api.getThreadInfo(event.threadID, (err, inf) =>{
        if (err) {
            console.log(err);
        }else{
            console.log(inf);
            let msg = `Thông tin nhóm: ${inf.threadName}\n`;
            msg += `Mã nhóm: ${inf.threadID}\n`;
            msg+= `Số lượng thành viên: ${inf.participantIDs.length}\n`;
            msg+= `Emoji đang dùng: ${inf.emoji}\n`;
            msg+= `Thread color: ${inf.color}\n`;
            msg+= `số tin nhắn trong nhóm: ${inf.messageCount}\n`;
            msg+= `Anti join: ${find.antiJoin ? 'Bật' : 'Tắt'}\n`;
            msg+= `Anti out: ${find.antiOut ? 'Bật' : 'Tắt'}\n`;
            msg+= `Nói chuyện với bot: ${find.botRep ? 'Bật' : 'Tắt'}\n`;
            msg+= `Tự gửi lại tin nhắn đã thu hồi: ${find.remess == 1 ? 'Bật' : 'Tắt'}\n`;
            msg+= `CHỉ QTV dùng bot: ${find.checkid == 1 ? 'Bật' : 'Tắt'}\n`;
            msg+= `Prefix: ${find.prefix}\n`;
            msg+= `Thời gian sử dụng bot của nhóm đến ${lDate}`
            api.sendMessage(msg, event.threadID, event.messageID);

        }
    });
    
}