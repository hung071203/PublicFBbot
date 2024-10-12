
const path = require('path');
const fs = require("fs");
const ytdl = require("@distube/ytdl-core");
const yts = require('yt-search');

module.exports.config = {
    name: 'yt',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'Hung',
    description: 'Phát nhạc hoặc video thông qua link YouTube hoặc từ khoá tìm kiếm',
    tag: 'Công cụ',
    usage: '!yt < keyword/url >',
    countDown: 700, role: 3
};
module.exports.handleReply = async function (api, event, client, hdr) {
    if (hdr.author != event.senderID) return api.sendMessage('Chỉ người hỏi mới được rep lại tin nhắn này', event.threadID, event.messageID);

    if (hdr.type == 'list') {
        const IDS = hdr.IDs
        const ID = IDS[parseInt(event.body) - 1];
        const t = hdr.t;
        hdr.titles = t[parseInt(event.body) - 1];
        const URL = `https://www.youtube.com/watch?v=${ID}`;
        console.log(URL, event);

        api.unsendMessage(hdr.messageID);

        const args = event.body.split(" ");
        api.setMessageReaction("⏳", event.messageID, () => { }, true);
        if(args[1] == 1){
            const ytdlOptions = { quality: '18' };
            downloadVideo(api, URL, ytdlOptions, event.threadID, event.messageID, hdr);
        }else{
            const ytdlOptions = { quality: '18' };
            downloadAudio(api, URL, ytdlOptions, event.threadID, event.messageID, hdr);
        }

    } else {
        const url = hdr.IDs;
        if (event.body == '1') {
            const ytdlOptions = { quality: '18' };
            api.setMessageReaction("⏳", hdr.messageID, () => { }, true);
            downloadVideo(api, url, ytdlOptions, event.threadID, event.messageID, hdr);
        } else if (event.body == '2') {
            const ytdlOptions = { quality: '18' };
            api.setMessageReaction("⏳", hdr.messageID, () => { }, true);
            downloadAudio(api, url, ytdlOptions, event.threadID, event.messageID, hdr);
        } else {
            api.sendMessage(`Cú pháp không hợp lệ, hủy tải!`, event.threadID, event.messageID);
        }
    }
    client.handleReply = client.handleReply.filter(item => item.messageID != event.messageReply.messageID);
}

async function downloadVideo(api, url, quality, threadID, messageID, hdr) {
    const video = ytdl(url, quality);
    const file = path.join(__dirname, '..', '..', 'img', `${Date.now()}.mp4`);
    video.pipe(fs.createWriteStream(file));

    video.on('end', () => {
        const stream = fs.createReadStream(file);

        if (fs.statSync(file).size <= 26214400) {
            api.sendMessage({ attachment: stream, body: `${hdr.titles}` }, threadID, messageID);
            api.setMessageReaction("✅", hdr.messageID, () => { }, true);
        } else {
            api.setMessageReaction("❌", hdr.messageID, () => { }, true);
            api.sendMessage('Kích thước quá lớn, gửi thất bại!', threadID, messageID);
        }



        setTimeout(() => {
            fs.unlink(file, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log('MP4 file deleted successfully');
                }
            });
        }, 60000);

    });

    video.on('error', (err) => {
        console.error(err);
        api.sendMessage('An error occurred while downloading the audio.', threadID, messageID);
    });
}

async function downloadAudio(api, url, quality, threadID, messageID, hdr) {
    const audio = ytdl(url, quality);
    const file = path.join(__dirname, '..', '..', 'img', `${Date.now()}.mp3`);

    audio.pipe(fs.createWriteStream(file));

    audio.on('end', () => {
        const stream = fs.createReadStream(file);

        if (fs.statSync(file).size <= 26214400) {
            api.sendMessage({ attachment: stream, body: `${hdr.titles}` }, threadID, messageID);
            api.setMessageReaction("✅", hdr.messageID, () => { }, true);
        } else {
            api.sendMessage('Kích thước quá lớn, gửi thất bại!', threadID, messageID);
            api.setMessageReaction("❌", hdr.messageID, () => { }, true);
        }



        setTimeout(() => {
            fs.unlink(file, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log('MP4 file deleted successfully');
                }
            });
        }, 60000);

    });

    audio.on('error', (err) => {
        console.error(err);
        api.sendMessage('An error occurred while downloading the audio.', threadID, messageID);
    });
}

module.exports.run = async function (api, event, args, client) {
    let IDs = [],
        t = [],
        msg = '';



    urlYT = 'https://www.youtube.com/watch';
    urlYT2 = 'https://m.youtube.com/watch';
    const content = args.slice(1).join(' ');


    if (content == '') {
        api.sendMessage('sau !yt không được trống', event.threadID, event.messageID);

        return;
    } else {
        const id = await client.apis['database'].getBank(event.threadID, event.senderID)
        if (id.money <= 100) {
            api.sendMessage('Cần tối thiểu 100$ để thực hiện hành động này!', event.threadID, event.messageID);
            return;
        }
        if (content.includes(urlYT) || content.includes('https://youtu.be/') || content.includes(urlYT2)) {
            console.log(event);
            api.sendMessage('𝑩𝒂̣𝒏 𝒎𝒖𝒐̂́𝒏 𝒍𝒂̀𝒎 𝒈𝒊̀ 𝒗𝒐̛́𝒊 𝑽𝒊𝒅𝒆𝒐 𝒏𝒂̀𝒚: \n𝟏. 𝐏𝐡𝐚́𝐭 𝐯𝐢𝐝𝐞𝐨\n𝟐. 𝐏𝐡𝐚́𝐭 𝐧𝐡𝐚̣𝐜', event.threadID, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    client.handleReply.push({
                        type: 'down',
                        name: this.config.name,
                        messageID: info.messageID,
                        author: event.senderID,
                        IDs: content,
                        titles: event.attachments[0].title
                    })
                }
            }, event.messageID);


        } else {
            const result = await yts(content);
            const videos = result.videos;

            let i = 0;
            if (videos.length === 0) {
                console.log('No videos found.');
            } else {
                videos.slice(0, 7).forEach(video => {
                    const title = video.title;
                    const videoId = video.videoId;
                    IDs.push(videoId);
                    console.log(`Title: ${title}, Video ID: ${videoId}`);
                    msg += `\n━━━━━━━━━━━━━━━━━━\n${i + 1}. ${title}\n➜ 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻 𝘃𝗶𝗱𝗲𝗼: ${video.timestamp}`;
                    i++;
                    t.push(title);
                });
                console.log(videos);
            }


            msg = `➜ 𝗖𝗼́ ${IDs.length} 𝗸𝗲̂́𝘁 𝗾𝘂𝗮̉ 𝘁𝗿𝘂̀𝗻𝗴 𝘃𝗼̛́𝗶 𝘁𝘂̛̀ 𝗸𝗵𝗼𝗮́ 𝘁𝗶̀𝗺 𝗸𝗶𝗲̂́𝗺 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻:${msg}\n━━━━━━━━━━━━━━━━━━\n ➜ Phản hồi tin nhắn này, chọn một kết quả tìm kiếm bằng số và nhập 1 hoặc 2 bên cạnh để xuất ra video hoặc âm thanh.`;

            api.sendMessage(msg, event.threadID, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    client.handleReply.push({
                        type: 'list',
                        name: this.config.name,
                        messageID: info.messageID,
                        author: event.senderID,
                        IDs,
                        t
                    })
                }
            }, event.messageID);
            console.log(client.handleReply);

        }
        id.money -= 100;
        client.apis['database'].addBank(id)
    }
}




