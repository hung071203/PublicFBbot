const path = require('path');
const fs = require('fs');
const axios = require('axios');
const levenshtein = require('fast-levenshtein');

const filePath = path.join(__dirname, '..', '..', 'savefile', 'thathinh.json');
global.thathinh = require(filePath);
module.exports = (api, client) => {
    function onLoad() {
        client.events.forEach(commandHandler => {
            if (commandHandler.onload) commandHandler.onload(api, client)
        });
        client.commands.forEach(commandHandler => {
            if (commandHandler.onload) commandHandler.onload(api, client)
        });
    }
    async function anyEvent(event) {
        if (event.threadID && !event.logMessageType && !global.gConfig.ADMINBOT.includes(event.senderID)) {
            let check = await client.apis['database'].getThreadConfig(event.threadID)
            if (!check) {
                return api.getThreadInfo(event.threadID, (err, info) => {
                    // if(info.folder == 'COMMUNITY') return
                    let name = ''
                    if (err) { console.error(err) } else { name = info.threadName ? info.threadName : '' };

                    client.apis['database'].addThreadConfig({
                        userName: '',
                        key: '',
                        threadID: event.threadID,
                        checkid: 0,
                        remess: 0,
                        antiOut: false,
                        antiJoin: false,
                        antiName: false,
                        antiThreadName: false,
                        antiEmoji: false,
                        invite: info.inviteLink.enable,
                        inviteLink: info.inviteLink.link,
                        emoji: info.emoji ? info.emoji : '',
                        desBan: '',
                        timeBan: 0,
                        time: Date.now(),
                        prefix: global.gConfig.PREFIX,
                        botRep: false,
                        threadName: name,
                        joinNoti: `===『 𝗧𝗵𝗲̂𝗺 𝗧𝘃𝗺 𝗧𝗵𝗮̀𝗻𝗵 𝗖𝗼̂𝗻𝗴 』===\n━━━━━━━━━━━━━━━━\n→ [💓] 𝗖𝗵𝗮̀𝗼 𝗺𝘂̛̀𝗻𝗴 {name} 𝘁𝗼̛́𝗶 𝘃𝗼̛́𝗶 𝗻𝗵𝗼́𝗺 {tname}━━━━━━━━━━━━━━━━\n→ [🌷] 𝗡𝗵𝗼̛́ 𝘁𝘂̛𝗼̛𝗻𝗴 𝘁𝗮́𝗰 đ𝗮̂̀𝘆 đ𝘂̉ 𝗻𝗵𝗮́ 𝗯𝗯𝗶 𝘁𝗵𝘂̛́ {tuser} 𝗰𝘂̉𝗮 𝗯𝗼𝘁\n→ [❄️] 𝗖𝗵𝘂́𝗰 𝗯𝗯𝗶 𝟭 𝗻𝗴𝗮̀𝘆 𝘁𝗵𝗮̣̂𝘁 𝘃𝘂𝗶 𝘃𝗲̉\n→ [⏰️] 𝗧𝗵𝗼̛̀𝗶 𝗚𝗶𝗮𝗻 𝗩𝗮̀𝗼 𝗡𝗵𝗼́𝗺: {time}`,
                        outWAD: `Thuyền viên {name} đã bị {adname} sút khỏi nhóm vì ngứa mồm!`,
                        outNAD:  `Thuyền viên {name} vì bị trap nên đã quyết định rời nhóm!`,
                    })
                })
            }
            if (check.time < parseInt(event.timestamp) || parseInt(event.timestamp) < check.timeBan) return
        }
        client.events.forEach(eventHandler => {
            if(eventHandler.anyEvent) eventHandler.anyEvent(api, event, client)});
        client.commands.forEach(commandHandler => {
            if (commandHandler.anyEvent) commandHandler.anyEvent(api, event, client);
        });
    }

    function findClosestCommand(input, commands) {
        return commands.reduce((closest, command) => {
            const distance = levenshtein.get(input, command);
            return distance < levenshtein.get(input, closest) ? command : closest;
        });
    }

    function handleReaction(event) {
        const reactionHandler = client.handleReaction.find(item => item.messageID == event.messageID);
        if (reactionHandler) client.commands.get(reactionHandler.name).handleReaction(api, event, client, reactionHandler);
    }
    function handleReply(event) {
        const replyHandler = client.handleReply.find(item => item.messageID == event.messageReply.messageID);
        if (replyHandler) client.commands.get(replyHandler.name).handleReply(api, event, client, replyHandler);
    }
    function handleEvent(event) {
        if(event.type != 'event') return
        client.events.forEach(eventHandler => eventHandler.run(api, event, client));
    }
    let commandStart = 0
    async function handleCommand(event) {
        if (!event.body) return;

        let tConfig = await client.apis['database'].getThreadConfig(event.threadID)
        let args = event.args?.filter(item => item != '');
        const prefix = tConfig ? tConfig.prefix : global.gConfig.PREFIX;
        const listCommands = [...client.commands.keys()];
        if (!args[0].startsWith(prefix)) {
            if(listCommands.includes(args[0].toLowerCase()) && client.commands.get(args[0].toLowerCase())?.noprefix){
                client.commands.get(args[0].toLowerCase()).noprefix(api, event, args, client)
            }
            return
        };

        const AdminBots = global.gConfig.ADMINBOT;
        const dev = global.gConfig.DEV;
        const qtv = await client.apis['database'].getUserThread(event.threadID, event.senderID);

        let role = qtv ? 2 : 3;
        if (AdminBots.includes(event.senderID)) role = 1;
        if (dev.includes(event.senderID)) role = 0;

        const command = args[0].toLowerCase().slice(1);
        const commandConfig = client.commands.get(command)?.config;

        if (commandConfig?.role !== global.gConfig.Role.length - 1 && !AdminBots.includes(event.senderID) && !dev.includes(event.senderID)) {
            if (!tConfig) return;
            if(parseInt(event.timestamp) < tConfig.timeBan) {
                const timeBan = await client.apis['others'].getTime(tConfig.timeBan);
                return api.sendMessage(`🔒Nhóm đã bị cấm sử dụng bot!\n🎄Lý do: ${checkBan.desBan} \n⌚Thời gian mở ${timeBan}\nHãy đợi hết thời gian hoặc liên hệ admin để được mở khóa!`, event.threadID, event.messageID);
            }
            if (tConfig.time < parseInt(event.timestamp)) {
                let msgs = 'Nhóm đã hết hạn dùng bot, vui lòng liên hệ với 1 trong các admin sau hoặc dev để gia hạn bot:\nDanh sách Admin:\n';
                AdminBots.forEach((element, index) => msgs += `${index + 1}. https://www.facebook.com/${element}\n`);
                msgs += '\nDanh sách Dev:\n';
                dev.forEach((element, index) => msgs += `${index + 1}. https://www.facebook.com/${element}\n`);
                return api.shareContact(msgs, global.gConfig.DEV[0], event.threadID, (err) => {
                    if (err) {
                        console.log(err);
                        api.sendMessage(msgs, event.threadID, event.messageID);
                    }
                });
            }

            if (tConfig.checkid == 1 && qtv.isQTV == false) return api.sendMessage('⛔Chỉ quản trị viên dùng được bot', event.threadID, event.messageID);
            if(qtv.isQTV == false){
                const checkBan = qtv
                if (checkBan.timeBan > parseInt(event.timestamp)) {
                    return api.sendMessage(`🔒Bạn đã bị cấm sử dụng bot!\n🎄Lý do: ${checkBan.desBan} \n⌚Thời gian mở: ${new Date(checkBan.timeBan).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\nHãy đợi hết thời gian hoặc liên hệ admin để được mở khóa!`, event.threadID, event.messageID);
                }
            }
            
        }

        if (commandConfig?.role < role) {
            return api.sendMessage(`Bạn không thể dùng chức năng này\nQuyền hạn tối thiểu là: ${global.gConfig.Role[commandConfig.role]}`, event.threadID, event.messageID);
        }

        if (event.body === prefix) {
            const timeElapsed = Date.now() - global.timeRun;
            const hours = Math.floor((timeElapsed / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((timeElapsed / (1000 * 60)) % 60);
            const seconds = Math.floor((timeElapsed / 1000) % 60);
            const days = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));
            let msgs = `⛔Bạn chưa nhập tên lệnh\n⏱Tổng thời gian hoạt động: ${days > 0 ? `${days} ngày, ` : ''}${hours}:${minutes}:${seconds}\n`;

            const pingURL = async (url) => {
                try {
                    const startTime = Date.now();
                    await axios.get(url);
                    msgs += `🪫Ping: ${Date.now() - startTime}ms`;
                } catch (error) {
                    msgs += `🪫Ping: false`;
                }
                msgs += `\n\n${global.thathinh[Math.floor(Math.random() * global.thathinh.length)]}\n\n`;
                api.sendMessage(msgs, event.threadID, event.messageID);
            };

            return pingURL('https://www.google.com');
        }


        if (!listCommands.includes(command)) {
            const find = findClosestCommand(command, listCommands);
            return api.sendMessage(`⛔Lệnh bạn nhập không tồn tại!\n♟️Lệnh gần giống nhất là: ${find}`, event.threadID, event.messageID);
        }

        if(parseInt(event.timestamp) - commandStart < (commandConfig?.countDown || 500)) return api.sendMessage(`⏳Vui lòng chờ thêm ${Date.now() - commandStart}ms trước khi thực thi lệnh tiếp theo!`, event.threadID, event.messageID);
        commandStart = parseInt(event.timestamp);
        client.commands.get(command).run(api, event, args, client);
    }
    return {
        handleCommand, handleReaction, handleReply, handleEvent, anyEvent, onLoad
    }
}