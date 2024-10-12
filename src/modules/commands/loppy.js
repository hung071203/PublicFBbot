module.exports.config = {
    name: "loppy",
    version: "1.0.0",
    credits: "Hung dep trai",
    description: "Bật tắt tính năng nhại tin nhắn kiểu loppy",
    usage: "!loppy"
    , countDown: 700, role: 3
};
let Loppy = []
const fs = require('fs');
module.exports.run = async function (api, event, args, client) {
    const find = Loppy.find(item => item == event.threadID)
    if (!find) {
        Loppy.push(event.threadID)
        api.sendMessage('Nhại kiểu loppy đã kích hoạt!', event.threadID, event.messageID)
    } else {
        Loppy = Loppy.filter(item => item != event.threadID)
        api.sendMessage('Nhại kiểu loppy đã tắt!', event.threadID, event.messageID)
    }
}

module.exports.anyEvent = async function (api, event, client) {
    if (!event.body) return;

    const check = Loppy.find(item => item == event.threadID);
    if (!check) return;

    let find = await client.apis['database'].getThreadConfig(event.threadID);
    if (event.body.startsWith(find?.prefix ? find.prefix : global.gConfig.PREFIX)) return;
    const paths = [
        __dirname + "/../../img/cache/loppy/loppy.png",
        __dirname + "/../../img/cache/loppy/loppy1.png",
        __dirname + "/../../img/cache/loppy/loppy2.png",
        __dirname + "/../../img/cache/loppy/loppy3.png",
    ]
    api.sendMessage({
        body: processSentence(event.body),
        attachment: fs.createReadStream(paths[Math.floor(Math.random() * paths.length)])
    }, event.threadID, event.messageID);

}

function replaceWordWithNh(word) {
    // Tập hợp các nguyên âm tiếng Việt có dấu
    const vowels = 'aeiouăâêôơưáắấéếíóốớúứýàằầèềìòồờùừỳảẳẩẻểỉỏổởủửỷãẵẫẽễĩõỗỡũữỹạặậẹệịọộợụựỵ';
    word = word.toLowerCase();
    if(word == 'ok') return 'nhô nhê'

    if(word == 'cc' || word == 'vl') return 'nhờ nhờ'

    // Tìm vị trí nguyên âm đầu tiên trong từ
    const index = word.split('').findIndex(char => vowels.includes(char));

    // Nếu tìm thấy nguyên âm, xóa tất cả các ký tự trước nguyên âm và chèn 'nh' vào trước đó
    if (index !== -1) {
        return 'nh' + word.slice(index);
    }
    return word;  // Nếu không có nguyên âm, trả về từ gốc
}

function processSentence(sentence) {
    // Chia câu thành các từ
    const words = sentence.split(/\s+/);

    // Xử lý từng từ
    const processedWords = words.map(replaceWordWithNh);

    // Ghép lại thành câu
    return processedWords.join(' ');
}