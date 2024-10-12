const axios = require('axios');
const fs = require('fs');
const path = require('path');
module.exports.config = {
    name: 'file',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' show file',
    tag: 'DEV',
    usage: '!file [path(Cách nhau bởi dấu cách)]'
    , countDown: 700, role: 0
};


module.exports.run = async function (api, event, args, client) {
    const arrPaths = args.slice(1)
    try {
        const directoryPath = path.join(client.mainPath, ...arrPaths);
        let newPath = []
        if(arrPaths?.length > 0 ){
            for(const item of arrPaths){
                newPath.push({
                    threadID: event.threadID,
                    path: item
                })
            }
        }
        main(api, event, client, directoryPath, newPath)
    } catch (error) {
        console.error(error)
        api.sendMessage(error.message, event.threadID, event.messageID)
    }

}

module.exports.handleReply = async function (api, event, client, hdr) {
    if (hdr.messageID != event.messageReply.messageID) return
    if (hdr.author != event.senderID) return api.sendMessage('M định làm gì cơ:)?', event.threadID, event.messageID);
    const args = event.args
    if (!args) return api.sendMessage('vui lòng nhập nội dung!', event.threadID, event.messageID)
    switch (args[0].toLowerCase()) {
        case 'open':
            if (isNaN(args[1])) return api.sendMessage('Phải là một con số!', event.threadID, event.messageID);
            let index = parseInt(args[1]) - 1
            if (index < 0 || index >= hdr.value.length) {
                api.sendMessage('Số nhập vào k hợp lệ, hủy chức năng!', event.threadID, event.messageID);
                api.unsendMessage(hdr.messageID);
                return client.handleReply = client.handleReply.filter(item => item.messageID != hdr.messageID)
            }
            let value = hdr.value[index];

            if (value.isFile) {
                const paths = hdr.paths
                    .filter(dir => dir.threadID == event.threadID)
                    .map(dir => dir.path);
                const filePath = path.join(client.mainPath, ...paths, `${hdr.value[index].name}`);
                const content = fs.readFileSync(filePath, 'utf8');
                console.log(content);

                const data = {
                    charset: "UTF-8",
                    content: content,
                    content_type: "application/json",
                    expiration: "1day",
                    secret: "123",
                    status: 200
                };

                try {
                    const response = await axios.post('https://api.mocky.io/api/mock', data);
                    console.log('Response Status:', response.status);
                    console.log('Response Data:', response.data);
                    api.sendMessage(response.data.link, event.threadID, event.messageID)
                } catch (error) {
                    console.error('Error:', error.response ? error.response.data : error.message);
                    api.sendMessage(error.message, event.threadID, event.messageID)
                }
            } else {
                hdr.paths.push({
                    threadID: event.threadID,
                    path: hdr.value[index].name
                })
                const paths = hdr.paths
                    .filter(dir => dir.threadID == event.threadID)
                    .map(dir => dir.path);
                const directoryPath = path.join(client.mainPath, ...paths);
                main(api, event, client, directoryPath, hdr.paths)
            }
            break;
        case 'back':
            const paths = hdr.paths.filter(dir => dir.threadID == event.threadID).map(dir => dir.path);
            if (paths.length == 0) return api.sendMessage('Không thể lùi lại!', event.threadID, event.messageID);
            const namePath = paths.pop();
            hdr.paths = hdr.paths.filter(dir => dir.threadID == event.threadID && dir.path != namePath);
            const directoryPath = path.join(client.mainPath, ...paths);
            main(api, event, client, directoryPath, hdr.paths)
            break;
        default:
            return api.sendMessage('lỗi cú pháp!', event.threadID, event.messageID);
            break;
    }

    api.unsendMessage(hdr.messageID);
    return client.handleReply = client.handleReply.filter(item => item.messageID != hdr.messageID)

}

async function main(api, event, client, directoryPath, newPath) {
    let msgs = '🗂️Danh sách nội dung file bot: \n';
    let value = [];

    async function getDirectorySize(directoryPath) {
        const files = await fs.promises.readdir(directoryPath);
        let totalSize = 0;

        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const stats = await fs.promises.stat(filePath);

            if (stats.isFile()) {
                totalSize += stats.size;
            } else if (stats.isDirectory()) {
                totalSize += await getDirectorySize(filePath); // Đệ quy để tính dung lượng của thư mục con
            }
        }

        return totalSize;
    }

    try {
        const files = await fs.promises.readdir(directoryPath);
        const fileStats = await Promise.all(files.map(async (file) => {
            const filePath = path.join(directoryPath, file);
            const stats = await fs.promises.stat(filePath);

            let size = 0;
            if (stats.isFile()) {
                size = stats.size / 1024; // Chuyển đổi kích thước từ bytes sang KB
            } else if (stats.isDirectory()) {
                size = (await getDirectorySize(filePath)) / 1024; // Chuyển đổi kích thước từ bytes sang KB cho thư mục
            }

            return {
                isFile: stats.isFile(),
                name: file,
                size: size.toFixed(2) // Giới hạn 2 chữ số sau dấu phẩy
            };
        }));

        fileStats.forEach((item, index) => {
            value.push(item);
            const sizeInfo = ` - ${item.size} KB`; // Thêm thông tin kích thước tính bằng KB
            msgs += `${index + 1}, ${item.isFile ? "📃" : "🗂️"}${item.name}${sizeInfo}\n`;
        });

        msgs += '⛔open + số để mở file, back để lùi, hoặc chọn số bên ngoài khoảng để hủy!';

        api.sendMessage(msgs, event.threadID, (err, inf) => {
            if (err) return console.error(err);
            client.handleReply.push({
                name: module.exports.config.name,
                messageID: inf.messageID,
                author: event.senderID,
                value: value,
                paths: newPath,
                timestamp: event.timestamp
            });
            console.log(client.handleReply);
        }, event.messageID);
    } catch (err) {
        api.sendMessage('Lỗi: ' + err.message, event.threadID, event.messageID);
    }

}
