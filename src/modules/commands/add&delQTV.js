module.exports.config = {
    name: 'editqtv',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'Chỉnh trạng thái QTV',
    tag: 'QTV',
    usage: '!editqtv [add/del] [@user]',
    countDown: 700,
    role: 2
};

module.exports.run = async function (api, event, args, client) {
    if (args.length < 3) {
        return api.sendMessage('Tin nhắn sai cú pháp!', event.threadID, event.messageID);
    }

    // Kiểm tra quyền QTV của bot
    if (!await checkQTV(client, event.threadID, api.getCurrentUserID())) {
        return api.sendMessage('Thêm bot làm QTV đi đã', event.threadID, event.messageID);
    }

    let arrID = [];
    if (Object.keys(event.mentions).length === 0) {
        if (args[args.length - 1] === 'me') {
            arrID.push(event.senderID);
        } else {
            return api.sendMessage('Cần tag tối thiểu 1 người dùng!', event.threadID, event.messageID);
        }
    } else {
        arrID = Object.keys(event.mentions);
    }

    switch (args[1]) {
        case 'add':
            // Xử lý các phần tử của mảng bất đồng bộ
            const toAdd = await Promise.all(arrID.map(async ID => {
                const isQTV = await checkQTV(client, event.threadID, ID);
                return !isQTV ? ID : null; // Trả về ID nếu chưa là QTV
            }));

            // Lọc các ID hợp lệ (không phải null)
            const validAddIDs = toAdd.filter(ID => ID !== null);

            api.changeAdminStatus(event.threadID, validAddIDs, true, (err) => {
                if (err) {
                    console.error(err);
                    api.sendMessage('Có lỗi xảy ra khi thêm QTV!', event.threadID, event.messageID);
                } else {
                    api.sendMessage(`Thêm ${validAddIDs.length} người dùng làm QTV thành công`, event.threadID, event.messageID);
                }
            });
            break;

        case 'del':
            // Xử lý các phần tử của mảng bất đồng bộ
            const toDelete = await Promise.all(arrID.map(async ID => {
                const isQTV = await checkQTV(client, event.threadID, ID);
                return isQTV ? ID : null; // Trả về ID nếu đã là QTV
            }));

            // Lọc các ID hợp lệ (không phải null)
            const validDeleteIDs = toDelete.filter(ID => ID !== null);

            api.changeAdminStatus(event.threadID, validDeleteIDs, false, (err) => {
                if (err) {
                    console.error(err);
                    api.sendMessage('Có lỗi xảy ra khi xóa QTV!', event.threadID, event.messageID);
                } else {
                    api.sendMessage(`Hủy ${validDeleteIDs.length} người dùng khỏi QTV thành công`, event.threadID, event.messageID);
                }
            });
            break;

        default:
            api.sendMessage('Tin nhắn sai cú pháp!', event.threadID, event.messageID);
            break;
    }
}

async function checkQTV(client, threadID, ID) {
    try {
        let check = await client.apis['database'].getUserThread(threadID, ID);
        return !!check;
    } catch (error) {
        console.error('Lỗi khi kiểm tra QTV:', error.message);
        return false;
    }
}
