const fs = require('fs');
const path = require('path');
module.exports.config = {
    name: 'addthinh',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' thêm thơ thả thính',
    usage: '!addthinh [thính muốn thêm]',
    countDown: 700, role: 3
};

module.exports.run = async function (api, event, args, client) {
    let content = args.slice(1).join(" ")
    let check = global.thathinh.find(item => item.toLowerCase() == content.toLowerCase())
    if (check) return api.sendMessage('Câu thính đã tồn tại', event.threadID, event.messageID)
    global.thathinh.push(content)
    api.sendMessage('Thêm thính thành công\n' + content, event.threadID, event.messageID)
    const filePathBT = path.join(__dirname, '..', '..', 'savefile', 'thathinh.json');
    fs.writeFile(filePathBT + '.tmp', JSON.stringify(global.thathinh, null, 2), { encoding: 'utf8' }, (err) => {
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