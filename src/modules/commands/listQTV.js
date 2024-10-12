module.exports.config = {
    name: 'listqtv',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Hiện tất cả QTV nhóm',
    tag: 'system',
    usage: '!listqtv'
    , countDown: 700, role: 4
};

module.exports.run = async function (api, event, args, client) {
    try {
        // Lấy thông tin về các QTV trong nhóm
        let finds = await client.apis['database'].getUserThread(event.threadID);
        if (!finds) {
            return api.sendMessage('Có lỗi khi truy vấn thông tin QTV, thử lại sau!', event.threadID, event.messageID);
        }

        // Khởi tạo biến để lưu trữ thông điệp và danh sách tag
        let msg = '🎄Thông tin quản trị viên của nhóm🎄\n---------------------------------------------------------------------\n';
        let mentions = [];

        // Lọc các QTV từ thông tin đã lấy
        let find1 = finds.filter(e => e.isQTV);

        // Duyệt qua từng QTV để lấy thông tin chi tiết
        for (const e of find1) {
            const find = await client.apis['database'].getUser(e.userID);
            if (!find) {
                msg += `UID: ${e.userID}\n`;
                msg += `Liên kết TCN: https://www.facebook.com/${e.userID}\n\n`;
            } else {
                console.log(find);
                msg += `→Tên người dùng: ${find.name}\n`;
                msg += `→Biệt danh: ${find.username ? find.username : 'Trống'}\n`;
                msg += `(👉ﾟヮﾟ)👉Đường dẫn trang cá nhân: ${find.url}\n\n`;
                mentions.push({
                    tag: find.name,
                    id: e.userID
                });
            }
        }

        // Gửi tin nhắn với thông tin đã chuẩn bị
        api.sendMessage({ body: msg, mentions: mentions }, event.threadID, event.messageID);
    } catch (error) {
        console.error('Có lỗi xảy ra:', error);
        api.sendMessage('Có lỗi xảy ra trong quá trình xử lý, thử lại sau!', event.threadID, event.messageID);
    }
}