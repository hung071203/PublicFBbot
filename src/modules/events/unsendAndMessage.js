const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');
const moment = require('moment-timezone');

module.exports.config = {
    name: 'unsend',
    version: '1.0.0',
    credit: 'HungDz',
    description: 'Noti!',
    usage: ''
}
let detailMessage = []
function getStartOfDayVN() {
    return moment.tz('Asia/Ho_Chi_Minh').startOf('day').valueOf();  // Trả về timestamp
}

function getStartOfWeekVN() {
    return moment.tz('Asia/Ho_Chi_Minh').startOf('week').valueOf();  // Trả về timestamp
}

module.exports.run = async function (api, event, client) {}
module.exports.anyEvent = async function (api, event, client) {
    
    if (event.type == 'message' || event.type == 'message_reply' && event.isGroup == true) {
        
        try {
            let find = await client.apis['database'].getMessage(event.threadID, event.senderID)
            if(!find){
                client.apis['database'].newMessage({
                    thread_id: event.threadID,
                    sender_id: event.senderID,
                    total: 1,
                    week: 1,
                    day: 1,
                    last_updated_day: getStartOfDayVN(),
                    last_updated_week: getStartOfWeekVN()
                });
            }else{
                find.day += 1
                find.week += 1
                find.total += 1
                client.apis['database'].newMessage(find)
            }
        } catch (error) {
            console.error(error)
        }
        
        
        if(detailMessage.length >= 0 && detailMessage.length <= 1000){
            detailMessage.push(event)
        }else detailMessage = [event]
        
        
    }
    const botID = api.getCurrentUserID();
    if (event.type == 'message_unsend' && event.senderID != botID) {
        
        client.unsend.push(event);
        
        let checkQTV = await client.apis['database'].getThreadConfig(event.threadID)
        if(!checkQTV) return
        if(checkQTV.remess == 0) return;

        let id = detailMessage.find(item => item.messageID == event.messageID)
        if(!id) return api.sendMessage(`Thông tin không còn trên hệ thống, gửi lại tin nhắn thất bại`, event.threadID)
        
        console.log(id);
        let msg;
        let arr =[];
        
        const IDS = Object.keys(id.mentions);
        for (let i = 0; i < IDS.length; i++) {
        arr.push({
                tag: id.mentions[IDS[i]],
                id: IDS[i]
        })
            
        }
        if (id.attachments.length>0) {
            if (id.attachments[0].type == 'video') {
                const response = await axios.get(id.attachments[0].url, { responseType: 'stream' });
        
                    // Download file from URL
                const filename = `${Date.now()}.mp4`;
                const filePath = path.join(__dirname, '..','..','img',filename);
        
                
                const writeStream = fs.createWriteStream(filePath);
                response.data.pipe(writeStream);
                // Wait for the video to finish downloading
                await new Promise((resolve) => {
                    writeStream.on('finish', resolve);
                });
                
                const stream = fs.createReadStream(filePath);
                // Gửi video
                msg = {
                    body: `Nội dung tin nhắn vừ gỡ: \n${id.body}`,
                    mentions: arr,
                    attachment:stream
                }
                
                api.sendMessage(msg, event.threadID, event.messageID);
                setTimeout(() => {
                    fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log('MP4 file deleted successfully');
                    }
                    });
                }, 60000);
                return;
            }else if (id.attachments[0].type == 'audio') {
                const filename = `${Date.now()}.mp3`;
                const filePath = path.join(__dirname, '..','..','img',filename);
                https.get(id.attachments[0].url, (res) => {
                    if (res.statusCode === 200) {
                        res.pipe(fs.createWriteStream(filePath));
                    } else {
                        console.error('Error downloading file from URL:', res.statusCode);
                        api.sendMessage('Đã xảy ra lỗi trong quá trình tải file từ URL.', event.threadID, event.messageID);
                    }
                });
                while(!fs.existsSync(filePath)){
                    await sleep(500);
                }
                
                const stream = fs.createReadStream(filePath);
                // Gửi âm thanh
                api.sendMessage({ attachment: stream, body: `Nội dung tin nhắn vừ gỡ: \n${id.body}  \n-Thả tim tin nhắn này để thu hồi nội dung-` }, event.threadID, event.messageID);
        
                stream.on('end', () => {
                    fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log('MP3 file deleted successfully');
                    }
                    });
                });   
                return;
            }else if (id.attachments[0].type == 'photo') {
                const filename = `${Date.now()}.png`;
                const filePath = path.join(__dirname, '..','..','img',filename);
        
                axios({
                    method: 'get',
                    url: id.attachments[0].url,
                    responseType: 'stream',
                })      
                .then(response => {
                    // Ghi dữ liệu từ phản hồi vào một tệp tin
                    response.data.pipe(fs.createWriteStream(filePath));
                
                    // Bắt sự kiện khi tải xong
                    response.data.on('end', () => {
                        console.log('Ảnh đã được tải thành công và lưu vào:', filePath);
        
                        const stream = fs.createReadStream(filePath);
                        msg = { 
                            attachment: stream, 
                            body: `Nội dung tin nhắn vừ gỡ: \n${id.body} \n-Thả tim tin nhắn này để thu hồi nội dung-`
                        }
                        api.sendMessage(msg, event.threadID, event.messageID);
        
                    });
                })
                .catch(error => {
                    console.error('Lỗi khi tải ảnh:', error);
                });  
        
                
        
                setTimeout(() => {
                    fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log('img file deleted successfully');
                    }
                    });
                }, 60000);
                return;
            }
        }
        msg = {
            body: `Nội dung tin nhắn vừ gỡ: \n${id.body} \n-Thả tim tin nhắn này để thu hồi nội dung-`,
            mentions: arr
        }
        
        api.sendMessage(msg, event.threadID, event.messageID);
    
        
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
