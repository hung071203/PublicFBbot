module.exports.config = {
    name: "pexels",
    version: "1.0.0",
    credits: "Hung dep trai",
    description: "Tìm kiếm ảnh pexels theo yêu cầu",
    tag: 'Công cụ',
    usage: "!pexels [từ khóa]"
    , countDown: 700, role: 3
};
const axios = require('axios');

module.exports.run = async function (api, event, args, client) {
    if (args.length == 1) return api.sendMessage('Nội dung k hợp lệ!', event.threadID, event.messageID)
    const content = args.slice(1).join(" ");
    const apis = client.apis['others']
    const url = `https://www.pexels.com/vi-vn/api/v3/search/photos?query=${encodeURIComponent(content)}&page=1&per_page=9&orientation=all&size=all&color=all&sort=popular&seo_tags=true`;

    // Cấu hình yêu cầu GET với header
    try {
        const response = await get(url);
        if (response.data.length == 0) return api.sendMessage('Không tìm được ảnh!', event.threadID, event.messageID)
        const newArr = response.data;
        let msgs = `Kết quả tìm kiếm cho từ khóa ${content}:\n`;
        let attachment = [];

        const downloadPromises = newArr.map(async (item, i) => {
            const { image } = item.attributes;
            const { small: url, download_link: url2 } = image;
        
            try {
                const atm = await apis.download(url);
                if (atm) attachment.push(atm.readStream);
        
                const link = await apis.getShortUrl(url2);
                return link;
            } catch (error) {
                return error.message;
            }
        });
        
        try {
            const results = await Promise.all(downloadPromises);
            msgs += results.join('\n');
        } catch (error) {
            console.error("Error during processing:", error);
        }
        

        api.sendMessage({
            body: msgs,
            attachment: attachment
        }, event.threadID, event.messageID)
    } catch (error) {
        console.log(error.message);

    }
}

async function get(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'secret-key': 'H2jk9uKnhRmL6WPwh89zBezWvr'
            }
        });
        return response.data
    } catch (error) {
        throw error
    }
}