module.exports.config = {
    name: "work",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Kiếm tiền",
    tag: 'Money',
    usage: "!work"
, countDown: 700, role: 3};

let checkWorks = [];
module.exports.run = async function (api, event, args, client) {
    const arr = [
        'Bạn đã bỏ nhà đi bán thân và kiếm được ',
        'Nay bạn ra sông câu được cá to, sau khi bán đi đã thu được ',
        'Hôm nay là ngày may mắn, bạn bắt được ',
        'Đi ngang qua một quán cà phê, bạn thấy người ta để quên ví, bạn đã thấy và trộm ',
        'Trên đường đi bạn tình cờ thấy một túi tiền nằm dưới đất, bên trong là ',
        'Hôm nay bạn đi cướp ngân hàng và cướp được ',
        'Bạn đã bán 1 quả thận và kiếm được '
    ];

    const rd = Math.floor(Math.random() * 7);
    const rdM = Math.floor(Math.random() * 1000) + 120;
    const id = await client.apis['database'].getBank(event.threadID, event.senderID);
    if (!id) return api.sendMessage(`Có lỗi phát sinh, thử lại`, event.threadID, event.messageID);

    let find = checkWorks.find(item => item.senderID == event.senderID && item.threadID == event.threadID);
    if (find && find.time + 5 * 60 * 1000 > Date.now()) {
        // Nếu đã làm việc trong vòng 5 phút qua
        var date = new Date(find.time + 5 * 60 * 1000);
        var localeDate = date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        api.sendMessage(`Bạn đã làm việc rồi, vui lòng đợi đến ${localeDate} để tiếp tục kiếm tiền!`, event.threadID, event.messageID);
        return;
    }

    // Nếu chưa làm việc hoặc đã qua 5 phút
    checkWorks = checkWorks.filter(item => item.time + 5 * 60 * 1000 > Date.now());
    checkWorks.push({
        senderID: event.senderID,
        threadID: event.threadID,
        time: Date.now()
    });

    id.money += rdM;
    id.time = parseInt(event.timestamp);
    client.apis['database'].addBank(id);
    api.sendMessage(`${arr[rd]}${rdM.toLocaleString('en-US')}$`, event.threadID, event.messageID);
}
