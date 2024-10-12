
module.exports.config = {
    name: 'setnoti',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Set noti join/leave group',
    tag: 'QTV',
    usage: '!setnoti'
, countDown: 700, role: 2};


module.exports.run = async function (api, event, args, client) {
    if(args[1] == 'help') return api.sendMessage('Cú pháp hỗ trợ: \n{name}: Tên người dùng\n{userid}: ID người dùng\n{tname}: Tên nhóm\n{tid}: ID nhóm\n{time}: Thời gian\n{tuser}: Tổng người dùng trong nhóm\n{adname}: Tên admin kick\n{adid}: ID admin kick!', event.threadID, event.messageID);
    let checkCmt = client.handleReply.find(e => e.threadID == event.threadID && e.name == this.config.name);
    if(checkCmt) client.handleReply.filter(e => e.threadID != event.threadID && e.name != this.config.name);
    api.sendMessage('Chọn loại noti bạn muốn set:\n1. Join\n2. Out', event.threadID, (error, info) => {
        if (error) console.log(error);
        else {
            client.handleReply.push({
                type: 'setnoti',
                name: this.config.name,
                messageID: info.messageID,
                threadID: event.threadID,
                author: event.senderID
            })
        }
    },event.messageID);
}

module.exports.handleReply = async function (api, event, client, hdr) {
    if(event.senderID != hdr.author) return api.sendMessage('Bạn không phải người gửi lệnh setnoti!', event.threadID, event.messageID);
    const alerts = ['{adname}', '{adid}'];
    switch (hdr.type) {
        case 'setnoti':
            if(event.body == '1') {
                api.sendMessage('Rep tin nhắn kèm nội dung bạn muốn hiển thị khi người vô nhóm!', event.threadID, (error, info) => {
                    if (error) console.log(error);
                    else {
                        hdr.type = 'setJoinNoti';
                        hdr.messageID = info.messageID;
                    }
                },event.messageID);
            }else if(event.body == '2') {
                api.sendMessage('Chọn loại thông báo khi rời nhóm: \n1. Bị kick\n2. Tự rời', event.threadID, (error, info) => {
                    if (error) console.log(error);
                    else {
                        hdr.type = 'outNoti';
                        hdr.messageID = info.messageID;
                    }
                },event.messageID);
            }else return api.sendMessage('Vui lòng chọn 1 hoặc 2!', event.threadID, event.messageID);
            break;
        case 'setJoinNoti':
            var findBox = await client.apis['database'].getThreadConfig(event.threadID)
            if(alerts.some(e => event.body.includes(e))) return api.sendMessage('Không được sử dụng từ khóa {adname} hoặc {adid}!', event.threadID, event.messageID);
            findBox.joinNoti = event.body;
            try {
                await client.apis['database'].addThreadConfig(findBox);
            } catch (error) {
                return api.sendMessage('Đã xảy ra lỗi!:\n' + error.toString(), event.threadID, event.messageID);
            }
            api.sendMessage('Đã set noti join nhóm!', event.threadID, event.messageID);
            break;

        case 'outNoti':
            if(event.body == '1') {
                api.sendMessage('Rep tin nhắn kèm nội dung bạn muốn hiển thị khi bị kick khỏi nhóm!', event.threadID, (error, info) => {
                    if (error) console.log(error);
                    else {
                        hdr.type = 'setOutNoti';
                        hdr.type1 = 'kick';
                        hdr.messageID = info.messageID;
                    }
                },event.messageID);
            }else if(event.body == '2') {
                api.sendMessage('Rep tin nhắn kèm nội dung bạn muốn hiển thị khi rời nhóm!', event.threadID, (error, info) => {
                    if (error) console.log(error);
                    else {
                        hdr.type = 'setOutNoti';
                        hdr.type1 = 'out';
                        hdr.messageID = info.messageID;
                    }
                },event.messageID);
            }else return api.sendMessage('Vui lòng chọn 1 hoặc 2!', event.threadID, event.messageID);
            break;
        case 'setOutNoti':
            var findBox = await client.apis['database'].getThreadConfig(event.threadID)
            if(hdr.type1 == 'kick') {
                findBox.outWAD = event.body;
            }else if(hdr.type1 == 'out') {
                if(alerts.some(e => event.body.includes(e))) return api.sendMessage('Không được sử dụng từ khóa {adname} hoặc {adid}!', event.threadID, event.messageID); 
                findBox.outNAD = event.body;
            }
            try {
                await client.apis['database'].addThreadConfig(findBox);
            } catch (error) {
                return api.sendMessage('Đã xảy ra lỗi!:\n' + error.toString(), event.threadID, event.messageID);
            }
            api.sendMessage('Đã set noti rời nhóm!', event.threadID, event.messageID);
            break;
        default:
            break;
    }
}