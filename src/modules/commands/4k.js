
module.exports.config = {
  name: "4k",
  version: "1.0.0",
  credits: "Hung dep trai",
  description: "Upscale hình ảnh",
  tag: "AI",
  usage:
    "4k rep hình muốn upscale",
  countDown: 700,
  role: 3,
};

module.exports.run = async function (api, event, args, client) {
    if(event.type != "message_reply") return api.sendMessage("Vui lòng reply tin nhắn", event.threadID, event.messageID);
    let urls = []
    event.messageReply.attachments.forEach(item => {
        if(item.type == "photo") urls.push(item.url)
    })
    if(urls.length == 0) return api.sendMessage("vui lòng reply hình ảnh", event.threadID, event.messageID);
    let msgs = 'Link ảnh 4k của bạn:\n'
    api.setMessageReaction("⏳", event.messageID, () => { }, true);
    const promise = urls.map(async (url, i) => {
        try {
            const data = await client.apis['others'].download(url, `${Date.now() + i}.jpg`);
            if(!data) return 'Lỗi tải xuống'
            const upscale = await client.apis['others'].upscaleImage(data.readStream);
            return upscale.result_url
        } catch (error) {
            return error.message
        }
    })
    const results = await Promise.all(promise);
    msgs += results.join('\n');
    api.setMessageReaction("✅", event.messageID, () => { }, true);
    api.sendMessage(msgs, event.threadID, event.messageID)
};
