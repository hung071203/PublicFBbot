let fs = require('fs');
const path = require('path');
const axios = require('axios');
module.exports.config = {
    name: "down",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Hỗ trợ tải video từ nhiều trang web, !down help để biết chi tiết",
    tag: 'Công cụ',
    usage: "!down [link]"
    , countDown: 700, role: 3
};


module.exports.run = async function (api, event, args, client) {
    if (args[1] == 'help') return api.sendMessage('hỗ trợ tải video, hình ảnh được chia sẻ từ Tiktok, Douyin, Capcut, Threads, Instagram, Facebook, Espn, Kuaishou, Pinterest, imdb, imgur, ifunny, Izlesene, Reddit, Youtube, Twitter, Vimeo, Snapchat, Bilibili, Dailymotion, Sharechat, Linkedin, Tumblr, Hipi, Telegram, Getstickerpack, Bitchute, Febspot, 9GAG, oke.ru, Rumble, Streamable, Ted, SohuTv, Xvideos, Xnxx, Xiaohongshu, Weibo, Miaopai, Meipai, Xiaoying, National Video, Yingke, Soundcloud, Mixcloud, Spotify, Zingmp3, Bandcamp.', event.threadID, event.messageID)

    api.sendMessage('Gửi đường dẫn là được ', event.threadID, event.messageID);
};

async function checkFileSize(url) {
    try {
        const response = await axios.head(url);
        const fileSize = parseInt(response.headers['content-length'], 10);
        if (isNaN(fileSize)) {
            console.log('Không thể xác định dung lượng file.');
            return false;
        }
        return fileSize <= 26214400; // 25 MB
    } catch (error) {
        console.error('Lỗi khi kiểm tra dung lượng file:', error.message);
        return false;
    }
}
async function download(url, savePath) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        fs.writeFileSync(savePath, response.data);
        setTimeout(() => {
            fs.unlink(savePath, (err) => {
              if (err) {
                console.error('Lỗi khi xóa tệp:', err);
                return;
              }
              console.log('Đã xóa tệp thành công:', savePath);
            });
          }, 1000 * 60);
        console.log(`Đã được tải và lưu tại ${savePath}`);
        return fs.createReadStream(savePath);
    } catch (error) {
        console.error('Lỗi khi tải:', error.message);
        return { err: true }
    }
}
module.exports.anyEvent = async function (api, event, client) {
    const down = client.apis['webAPI'];
    if (!event.body) return
    const url = event.body
    const isURL = /^http(|s):\/\//.test(url);

    if (!isURL) return
    const patternsAndMessages = [
        { pattern: /instagram\.com/, message: 'INSTAGRAM' },
        { pattern: /facebook\.com/, message: 'FACEBOOK' },
        { pattern: /fb\.watch/, message: 'FACEBOOK' },
        { pattern: /pinterest\.com/, message: 'PINTEREST' },
        { pattern: /soundcloud\.com/, message: 'SOUNDCLOUD' },
        { pattern: /pin\.it/, message: 'PINTEREST' },
        { pattern: /capcut\.com/, message: 'CAPCUT' },
        { pattern: /spotify\.com/, message: 'SPOTIFY' },
        { pattern: /x\.com/, message: 'X' },
        { pattern: /twitter\.com/, message: 'TWITTER' },
        { pattern: /bilibili\.com/, message: 'BILIBILI' },
        { pattern: /threads\.net/, message: 'THREADS' },
        { pattern: /douyin\.com/, message: 'DOUYIN' },
    ];
    const matches = patternsAndMessages.find(({ pattern }) => pattern.test(url));
    if (!matches) return
    try {
        var {data} = await down.getLink(url)

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return api.sendMessage(error.message, event.threadID, event.messageID)
    }

    if (data.error) return
    data.medias = data.medias.filter(item => item?.url);
    if(data.medias.length == 0) return
    let fileContent = [];
    const findImg = data.medias.find(item => item.type == 'image')
    if (findImg) {
        fileContent = data.medias
        .filter(item => item.type === 'image' || item.type === 'video')
        .map((item, index) => ({
            path: path.join(__dirname, '..', '..', 'img', `${Date.now() + index}.${item.type === 'video' ? 'mp4' : 'jpg'}`),
            url: item.url
        }));
    } else {
        fileContent.push({
            path: path.join(__dirname, '..', '..', 'img', `${Date.now()}.${data.medias[0].type == 'video' ? 'mp4' : data.medias[0].type == 'audio' ? 'mp3' : 'jpg'}`),
            url: data.medias[0].url
        })
    }
    console.log(fileContent);
    const { message } = matches;
    let msgs = `╭─────────────⭓\n│ AUTODOWN ${message}\n├─────⭔`;
    if (message !== 'BILIBILI') {
        msgs += `\n│📃Title: ${data.title}`;
    }
    if (message !== 'BILIBILI' && message !== 'PINTEREST') {
        msgs += `\n│👤Author: ${data.author}`;
    }
    let attachments = []
    for (const content of fileContent) {
        const isFileSizeValid = await checkFileSize(content.url);
        if (!isFileSizeValid) {
            const link = await client.apis['others'].getShortUrl(content.url);
            msgs += `\n│->Link download: ${link}`
            continue;
        }
        const attachment = await download(content.url, content.path)
        if (attachment.err) continue
        attachments.push(attachment)
    }
    api.sendMessage({
        body: msgs,
        attachment: attachments
    }, event.threadID, event.messageID)
}

