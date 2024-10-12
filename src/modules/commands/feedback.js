
module.exports.config = {
    name: "feedback",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Gửi phản hồi/yêu cầu về cho dev qua mail",
    tag: 'Công cụ',
    usage: "!feedback [nội dung]"
    , countDown: 700, role: 3
};


module.exports.run = async function (api, event, args, client) {
    try {
        await client.apis['others'].sendMail('feedback từ người dùng trong nhóm ' + event.threadID, args.slice(1).join(" "), event.senderID);
        api.sendMessage('Đã gửi phần hồi cho dev', event.threadID, event.messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage(error.message, event.threadID, event.messageID);
    }

}