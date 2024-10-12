const fs = require("fs");
const path = require('path');
const axios = require('axios');

module.exports.config = {
    name: "ai",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Trả lời câu hỏi bằng AI",
    tag: 'AI',
    usage: "!ai [câu hỏi]",
    countDown: 3000, role: 3
};

let chatHis = []
let stream_url = async (url, filePath) => {
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, res.data);
        console.log('tai thành công tệp!');
        setTimeout(() => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Lỗi khi xóa tệp:', err);
                } else {
                    console.log('Đã xóa tệp thành công:', filePath);
                }
            });
        }, 1000 * 60);
    } catch (error) {
        throw error;
    }
};
module.exports.run = async function (api, event, args, client) {
    const gemini = client.apis['gemini']
    if (args.length <= 1) {
        api.sendMessage('Cú pháp không hợp lệ', event.threadID, event.messageID);
        return;
    }

    let query = args.slice(1).join(" ");

    let findHis = chatHis.find(item => item.ID === event.senderID);
    if (!findHis) {
        chatHis.push({
            ID: event.senderID,
            his: []
        });
        findHis = chatHis.find(item => item.ID === event.senderID);
    }
    let format = {
        content: query, 
        his: findHis.his,
    }
    api.setMessageReaction("⏳", event.messageID, () => { }, true);
    if (event.type === 'message_reply') {
        if (event.messageReply.attachments.length === 0) {
            const lastQuery = event.messageReply.body;
            query = `${lastQuery}\n${args.slice(1).join(" ")}`;
            format.content = query;
        } else {
            format = await dataGenerator(api, event, format, gemini);
            if (format.err) return api.sendMessage(format.err, event.threadID, event.messageID);
        }
    }
    const result = await gemini.chat(format);
    api.setMessageReaction("✅", event.messageID, () => { }, true);
    api.sendMessage(result.text, event.threadID, (err, data) =>{
        if(err) console.log(err)
            client.handleReply.push({
                name: module.exports.config.name,
                messageID: data.messageID,
                author: event.senderID,
                his: findHis.his
            })
    }, event.messageID);
};

module.exports.handleReply = async function (api, event, client, hdr) {
    if(event.senderID != hdr.author) return 
    let find = await client.apis['database'].getThreadConfig(event.threadID);
    if (event.body.startsWith(find?.prefix ? find.prefix : global.gConfig.PREFIX)) return;
    let format = {
        content: event.body, 
        his: hdr.his,
    }
    const gemini = client.apis['gemini']
    api.setMessageReaction("⏳", event.messageID, () => { }, true);
    if(event.messageReply.attachments.length > 0){
        format = await dataGenerator(api, event, format, gemini);
        if (format.err) return api.sendMessage(format.err, event.threadID, event.messageID);
    }
    const result = await gemini.chat(format);
    api.setMessageReaction("✅", event.messageID, () => { }, true);
    api.sendMessage(result.text, event.threadID, (err, data) =>{
        if(err) console.log(err)
            hdr.messageID = data.messageID
    }, event.messageID);
}

async function dataGenerator(api, event, format, gemini) {
    if (event.messageReply.attachments[0].type == 'photo') {
        let i = 0
        let imageParts = []
        for (const item of event.messageReply.attachments) {
            if (item.type == 'photo') {
                const filename = `${Date.now() + i}.jpeg`;
                const filePath = path.join(__dirname, '..', '..', 'img', filename);
                try {
                    await stream_url(item.url, filePath)
                } catch (error) {
                    api.setMessageReaction("❌", hdr.messageID, () => { }, true);
                    return {err: error.message}
                }
                const result = await gemini.uploadFile(filePath, filename)
                if (result.error) {
                    api.setMessageReaction("❌", event.messageID, () => { }, true);
                    return {err: result.error}
                }
                imageParts.push(result)
            }
            i++
        }
        format.filePath = imageParts
    }else if(['audio', 'video', 'file'].includes(event.messageReply.attachments[0].type)){
        const reply = event.messageReply.attachments[0];
        const filename = reply.type == 'audio' ? `${Date.now()}.mp3` : reply.type == 'video' ? `${Date.now()}.mp4` : reply.filename;
        console.log(reply.url);
        let url = reply.url
        if(reply.type == 'file'){
            url = url.replace("https://l.facebook.com/l.php?u=", "");
            url = decodeURIComponent(url);
        }
        const filePath = path.join(__dirname, '..', '..', 'img', filename);
        await stream_url(url, filePath)
        const result = await gemini.uploadFile(filePath, filename)
        if (result.error) {
            api.setMessageReaction("❌", event.messageID, () => { }, true);
            return {err: result.error}
        }
        format.filePath = [result]
    }
    return format
}

