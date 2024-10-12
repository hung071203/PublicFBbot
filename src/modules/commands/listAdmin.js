module.exports.config = {
    name: 'listad',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Hiện tất cả Admin bot',
    tag: 'system',
    usage: '!listad'
    , countDown: 700, role: 4
};

module.exports.run = async function (api, event, args, client) {

    let msg = '🎄Thông tin admin bot🎄\n---------------------------------------------------------------------\n'
    for (const e of global.gConfig.ADMINBOT) {
        try {
            const find = await client.apis['database'].getUser(e);
            if (!find) {
                msg += `UID: ${e}\n`;
                msg += `Liên kết TCN: https://www.facebook.com/${e}\n\n`;
            } else {
                console.log(find);
                msg += `→Tên người dùng: ${find.name}\n`;
                msg += `→Biệt danh: ${find.username ? find.username : 'Trống'}\n`;
                msg += `(👉ﾟヮﾟ)👉Đường dẫn trang cá nhân: ${find.url}\n\n`;
            }
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin người dùng với ID ${e}:`, error);
            msg += `Lỗi khi lấy thông tin người dùng với ID ${e}\n`
        }
    }

    api.sendMessage(msg, event.threadID, event.messageID)
}