module.exports.config = {
    name: 'listban',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'Xem danh sách người bị cấm',
    tag: 'ADMIN',
    usage: '!listban'
, countDown: 700, role: 1};


module.exports.run = async function (api, event, args, client) {
    let msg = 'Danh sách người bị cấm: \n'
    let finds = await client.apis['database'].getUserThread(event.threadID)
    if(finds.length == 0) msg += 'Trống!!'
    for (const [index, element] of finds.entries()) {
        try {
            let user = await client.apis['database'].getUser(element.ID);
            msg += `${index + 1}. Người dùng ${user ? user.name : element.ID}\n`;
            msg += `→ ThreadID: ${element.threadID}\n`;
            msg += `→ Lý do: ${element.reason}\n`;

            var d = new Date(element.timestamp);
            var lDate = d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
            msg += `→ Thời gian mở: ${lDate}\n\n`;
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin người dùng với ID ${element.ID}:`, error);
            msg += `Lỗi khi lấy thông tin người dùng với ID ${element.ID}\n`
        }
    }

    api.sendMessage(msg, event.threadID, event.messageID)
}