module.exports.config = {
    name: 'key',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Gia hạn thời gian dùng bot bằng key',
    tag: 'ADMIN',
    usage: `${global.gConfig.PREFIX}key [m(thủ công) (tên key) / a(tự động) / s(show)] [thời gian(ngày)]\n(muốn dùng key chỉ cần nhập vào đoạn chat)`
    , countDown: 700, role: 4
};

const keys = []

module.exports.run = async function (api, event, args, client) {

    let check = global.gConfig.ADMINBOT.find(item => item == event.senderID)
    if (!check) return api.sendMessage('Bạn không có quyền dùng chức năng này!', event.threadID, event.messageID)
    let time = 0
    let name = ''
    switch (args[1]) {
        case 'm':
            if (isNaN(args[3])) return api.sendMessage('cú pháp không hợp lệ, thời gian cần là 1 số. Ví dụ: 10!', event.threadID, event.messageID)
            keys.push({
                name: args[2],
                time: parseInt(args[3]),
                isUse: false
            })
            time = parseInt(args[3])
            name = args[2]
            break;

        case 'a':
            const randomKey = generateRandomKey(10);
            if (isNaN(args[2])) return api.sendMessage('cú pháp không hợp lệ, thời gian cần là 1 số. Ví dụ: 10!', event.threadID, event.messageID)
            keys.push({
                name: randomKey,
                time: parseInt(args[2]),
                isUse: false
            })
            time = parseInt(args[2])
            name = randomKey
            break;

        case 's':
            let msgs = '📜Danh sách nhóm đã dùng key: \n'
            let count = 1
            await client.apis['database'].allThreadConfig().forEach(item => {
                if (item.key == '') return
                var date = new Date(item.time);

                var localeDate = date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
                msgs += `${count}. 🔑Tên key: ${item.key} \n🆔ID nhóm: ${item.threadID}\n💻Tên nhóm: ${item.threadName}\n👤Người gia hạn: ${item.userName} \n🕛Hạn sử dụng: ${localeDate}\n\n`
                count++
            })
            return api.sendMessage(msgs, event.threadID, event.messageID)
            break;

        default:
            return api.sendMessage('cú pháp không hợp lệ!', event.threadID, event.messageID)

    }

    const currentDate = new Date(); // Lấy ngày hiện tại

    // Tính toán ngày sau khi thêm số ngày vào ngày hiện tại
    const futureDate = new Date(currentDate.getTime() + time * 24 * 60 * 60 * 1000);

    // Định dạng ngày thành chuỗi dạng ngày/tháng/năm theo múi giờ Việt Nam
    const options = { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = futureDate.toLocaleDateString('vi-VN', options);
    api.sendMessage(`🔑Đã thêm key: ${name}\n📜Hạn đến: ${formattedDate}\n🕛Key sẽ tự hết hạn sau 10 phút! `, event.threadID, event.messageID)
    setTimeout(() => {
        let find = keys.find(item => item.name == name)
        if (find) keys.splice(keys.indexOf(find), 1)
        api.sendMessage(`🔑Key ${name} đã bị thu hồi vì hết hạn!`, event.threadID, event.messageID)
    }, 10 * 60 * 1000);
}

module.exports.anyEvent = async function (api, event, client) {
    if (!event.body) return
    let find = keys.find(item => item.name == event.body)
    if (!find) return
    let checkBox = await client.apis['database'].getThreadConfig(event.threadID)
    if (!checkBox) return
    const currentDate = new Date()
    if (currentDate.getTime() < checkBox.time - 3 * 24 * 60 * 60 * 1000) return api.sendMessage(`Nhóm vẫn còn trên 3 ngày dùng bot, không thể gia hạn!`, event.threadID, event.messageID)
    if (find.isUse) return api.sendMessage(`🔑Key ${event.body} đã được sử dụng`, event.threadID, event.messageID)
    find.isUse = true
    // Tính toán ngày sau khi thêm số ngày vào ngày hiện tại
    const futureDate = new Date(currentDate.getTime() + find.time * 24 * 60 * 60 * 1000);

    // Định dạng ngày thành chuỗi dạng ngày/tháng/năm theo múi giờ Việt Nam
    const options = { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const formattedDate = futureDate.toLocaleDateString('vi-VN', options);
    let msgs = `🔑Key ${event.body} sử dụng thành công!\n`
    msgs += `📜Nhóm được gia hạn đến: ${formattedDate}\n`
    let user = await client.apis['database'].getUser(event.senderID)
    let userName = user ? user.name : "Không xác định";
    msgs += `👤Người dùng: ${userName}`
    checkBox.time = currentDate.getTime() + find.time * 24 * 60 * 60 * 1000
    checkBox.userName = userName
    checkBox.key = event.body
    client.apis['database'].addThreadConfig(checkBox)
    api.sendMessage(msgs, event.threadID, event.messageID)
}

function generateRandomKey(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}