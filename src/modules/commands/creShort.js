
module.exports.config = {
    name: 'creshort',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Tạo shortcut',
    tag: 'shortcut',
    usage: '!creshort [tên short]'
    , countDown: 700, role: 3
};

module.exports.run = async function (api, event, args, client) {
    if (args.length == 1) return api.sendMessage('Tên short k được trống', event.threadID, event.messageID);
    const text = args.slice(1).join(" ");
    let find = await client.apis['database'].getShortcut(event.threadID, text)
    if (find) return api.sendMessage('shortcut đã tồn tại!', event.threadID, event.messageID);
    api.sendMessage('Vui lòng nhập đầu ra shortcut!', event.threadID, (err, info) => {
        if (err) return console.log(err);
        client.handleReply.push({
            name: this.config.name,
            type: 'output',
            messageID: info.messageID,
            author: event.senderID,
            threadID: event.threadID,
            timestamp: event.timestamp,
            input: text
        })
    }, event.messageID);
}

module.exports.handleReply = async function (api, event, client, hdr) {
    if (event.senderID != hdr.author) return api.sendMessage('Bạn không có quyền!', event.threadID, event.messageID);
    switch (hdr.type) {
        case 'output':
            if (!event.body) return api.sendMessage('Vui lòng nhập đầu ra shortcut', event.threadID, event.messageID);
            hdr.output = event.body
            api.sendMessage('Vui lòng thêm đầu ra shortcut (ảnh, video hoặc audio)!', event.threadID, (err, info) => {
                if (err) return console.log(err);
                hdr.messageID = info.messageID
                hdr.type = 'setShortcut'
            }, event.messageID);
            break;
        case 'setShortcut':
            if (event.attachments[0].type == 'video' || event.attachments[0].type == 'photo' || event.attachments[0].type == 'audio') {
                let url = event.attachments[0].url;
                let url1 = ''
                api.setMessageReaction("⏳", hdr.messageID, () => { }, true);
                try {
                    const path = await client.apis['others'].download(url);
                    url1 = await client.apis['others'].catbox(path.readStream);
                    api.setMessageReaction("✅", hdr.messageID, () => { }, true);
                } catch (error) {
                    api.sendMessage('Lỗi: ' + error.message, event.threadID, event.messageID);
                    return api.setMessageReaction("❌", hdr.messageID, () => { }, true);
                }

                client.apis['database'].addShortcut({
                    name: hdr.input,
                    type: event.attachments[0].type,
                    output:hdr.output,
                    url: url1,
                    threadID: event.threadID
                })
                client.handleReply = client.handleReply.filter(item =>item != hdr);
                api.sendMessage('shortcut đã thêm vào thành công!', event.threadID, event.messageID);
            } else {
                api.sendMessage('Chỉ hỗ trợ hình ảnh, video hoặc audio làm đầu vào!', event.threadID, event.messageID);
            }
            break;
        default:
            break;
    }

}
