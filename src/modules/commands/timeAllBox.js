module.exports.config = {
    name: 'timeboxs',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' ',
    tag: 'ADMIN',
    usage: '!timeBox'
, countDown: 700, role: 3};


module.exports.run = async function (api, event, args, client) {
   

    arrAD = global.gConfig.ADMINBOT
    let check = arrAD.find(item => item == event.senderID)
    if(!check) return api.sendMessage('Bạn không có quyền dùng chức năng này!', event.threadID, event.messageID)
    let msgs ='---------------------------------------------'
    let i = 1
    let tConfig = await client.apis['database'].allThreadConfig().sort((a, b) => a.time - b.time);
    tConfig.forEach(e => {
        var d = new Date(e.time);
        var lDate = d.toLocaleString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh'});
        msgs += `${i}, ThreadID: ${e.threadID}\n   Thời gian còn lại: ${lDate}\n---------------------------------------------\n`
        i++
    });
    api.sendMessage(msgs, event.threadID, event.messageID)
}