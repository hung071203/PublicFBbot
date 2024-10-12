const axios = require('axios');

module.exports.config = {
    name: 'hoingu',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'Đố ngu',
    tag: 'game',
    usage: '!hoingu'
, countDown: 700, role: 3};

module.exports.run = async function (api, event, args, client) {
    const url = 'https://noitu.pro/initHoingu';

    try {
        // Gửi yêu cầu GET
        const response = await axios.get(url);

        // Kiểm tra mã trạng thái HTTP
        if (response.status === 200) {
            // In ra phản hồi JSON
            const data = response.data;
            if(data.error) return api.sendMessage(`Error: ${data.error}`, event.threadID, event.messageID);
            const textArray = data.text.split('|').filter(item => item != '');
            console.log(textArray);
            api.sendMessage(`${textArray[1]}\nA. ${textArray[2]}\nB. ${textArray[3]}\nC. ${textArray[4]}\nD. ${textArray[5]}`, event.threadID, (error, info) =>{
                if (error) return console.error(error);
                client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    threadID: event.threadID,
                    dapan: textArray[6].toLowerCase(),
                    detail: textArray[7],
                    timestamp: event.timestamp
                    
                })
            }, event.messageID);
        } else {
        console.log('Yêu cầu không thành công với mã trạng thái:', response.status);
        return api.sendMessage('Lỗi: ' + response.status, event.threadID, event.messageID);
        }
    } catch (error) {
        // Xử lý lỗi khi yêu cầu thất bại
        console.error('Đã xảy ra lỗi:', error.message);
        return api.sendMessage('Lỗi: ' + error.message, event.threadID, event.messageID);
    }
}

module.exports.handleReply = async function (api, event, client, hdr) {
    if(hdr.messageID != event.messageReply.messageID) return
    if(hdr.author != event.senderID) return
    let chose = event.body.toLowerCase()
    if(chose != hdr.dapan) return api.sendMessage('Bạn đoán sai rồi, đoán lại!',event.threadID, event.messageID)
    api.sendMessage(`Bạn đã trả lời chính xác!\n${hdr.detail}`, event.threadID, event.messageID)
    api.unsendMessage(hdr.messageID);
    client.handleReply = client.handleReply.filter(item => item.messageID != hdr.messageID)
    
}