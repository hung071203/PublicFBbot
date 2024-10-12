module.exports.config = {
    name: "imgur",
    version: "1.0.0",
    credits: "Hung dep trai",
    description: "Upload ảnh hoạc video lên imgur",
    tag: 'Công cụ',
    usage: "!imgur (reply tin nhắn chứa ảnh hoặc video)"
    , countDown: 700, role: 3
};

module.exports.run = async function (api, event, args, client) {
    if(event.type != "message_reply") return api.sendMessage("Vui lòng reply tin nhắn", event.threadID, event.messageID);
    let urls = []
    event.messageReply.attachments.forEach(item => {
        if(item.type == "photo" || item.type == "video") urls.push(item.url)
    })
    if(urls.length == 0) return api.sendMessage("vui lòng reply hình ảnh", event.threadID, event.messageID);
    let msgs = 'Link imgur của bạn:\n'
    api.setMessageReaction("⏳", event.messageID, () => { }, true);
    const promise = urls.map(async (url, i) => {
        try {
            const data = await client.apis['others'].download(url);
            if(!data) return 'Lỗi tải xuống'
            const imgur = await client.apis['others'].imgur(data);
            return imgur.data.link
        } catch (error) {
            return error.message
        }
    })
    const results = await Promise.all(promise);
    msgs += results.join('\n');
    api.setMessageReaction("✅", event.messageID, () => { }, true);
    api.sendMessage(msgs, event.threadID, event.messageID)
}