
module.exports.config = {
    name: "shorturl",
    version: "1.0.0",
    credits: "Hung dep trai",
    description: "Rút gọn link",
    tag: 'Công cụ',
    usage: "!shorturl [link]"
    , countDown: 700, role: 3
};


module.exports.run = async function (api, event, args, client) {
    if (args.length != 2) return api.sendMessage('Vui lòng nhập link', event.threadID, event.messageID);

    try {
        const a = await client.apis['others'].getShortUrl(args[1]);
        if (!a) return api.sendMessage('Link bị sai!', event.threadID, event.messageID);
        api.sendMessage(a, event.threadID, event.messageID);
    } catch (error) {
        return api.sendMessage('Lỗi: ' + error, event.threadID, event.messageID);
    }
}