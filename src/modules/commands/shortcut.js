
module.exports.config = {
    name: 'shortcut',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Các lệnh của shortcut',
    tag: 'shortcut',
    usage: '!shortcut '
    , countDown: 700, role: 3
};

module.exports.run = async function (api, event, args, client) {
    prefix = global.gConfig.PREFIX;
    msgs = `Các lệnh của Shortcut:\n`;
    msgs += `${prefix}creShort [tên short mới] (lưu ý rep lại hình ảnh hoặc video muốn tạo)\n\n`;
    msgs += `${prefix}short [tên shortcut]\n\n`;
    msgs += `${prefix}delShort [tên shortcut]\n\n`;
    api.sendMessage(msgs, event.threadID, event.messageID);

}

module.exports.anyEvent = async function (api, event, client) {
    if (!event.body) return;
    let check = await client.apis['database'].getThreadConfig(event.threadID);
    let prefix = check && check.prefix ? check.prefix : global.gConfig.PREFIX;
    if (event.body.startsWith(prefix)) return;

    let arr = await client.apis['database'].getShortcut(event.threadID)
    let find = arr.find(item => event.args.includes(item.name))
    if (!find) return;

    const fileName = `${Date.now()}.${find.type == 'video' ? 'mp4' : find.type == 'photo' ? 'jpg' : 'mp3'}`;
    try {
        const path = await client.apis['others'].download(find.url, fileName)
        api.sendMessage({
            body: find.output,
            attachment: path
        }, event.threadID, event.messageID)
    } catch (error) {
        console.error(error);
        api.sendMessage('Lỗi: ' + error.message, event.threadID, event.messageID)
    }
}
