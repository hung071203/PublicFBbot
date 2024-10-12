module.exports.config = {
    name: "kick",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Kick người dùng khỏi nhóm! ",
    tag: 'QTV',
    usage: "!kick [user]"
    , countDown: 700, role: 2
};


module.exports.run = async function (api, event, args, client) {

    if (Object.keys(event.mentions).length == 0) return api.sendMessage('Tin nhắn sai cú pháp!', event.threadID, event.messageID)

    const userIDs = Object.keys(event.mentions);
    userIDs.forEach(userID => {
        if (userID == api.getCurrentUserID()) return api.sendMessage("Mày muốn sao? :/", event.threadID, event.messageID);
        let adIDs = global.gConfig.ADMINBOT
        let checkAD = adIDs.find(item => item == userID)
        if (checkAD) return api.sendMessage("M định kick bố t á, t kick m giờ!", event.threadID, event.messageID);
        api.removeUserFromGroup(userID, event.threadID, (err) => {
            if (err) {
                console.log(err);
                api.sendMessage("Lỗi: "+ err.message, event.threadID, event.messageID);
            }
        })
    });
};