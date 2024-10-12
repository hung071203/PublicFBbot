
const fs = require('fs');
const path = require('path');
module.exports.config = {
    name: 'restart',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Khởi động lại bot',
    tag: 'DEV',
    usage: '!restart'
, countDown: 700, role: 3};

let threadID = ''
module.exports.onload = function (api, client) {
    if(global.gConfig.threadRS != ''){
        if(global.gConfig.STARTTIME != ''){
            global.timeRun = global.gConfig.STARTTIME
            global.gConfig.STARTTIME = ''
        }
        const rsTime = (Date.now() - global.gConfig.TIMERS) / 1000
        api.sendMessage(`✅ Hệ thống khởi động lại thành công\n🕛Thời gian: ${rsTime}s`, global.gConfig.threadRS)
        global.gConfig.threadRS = ''
        saveFile()
    }
    setInterval(() => {
        global.gConfig.threadRS = threadID
        global.gConfig.STARTTIME = global.timeRun + 5000
        global.gConfig.TIMERS = Date.now() + 5000
        saveFile()
        api.sendMessage('Hệ thống sẽ tự khởi động lại sau: 5 giây', threadID)
        setTimeout(() => {
            process.exit(1)
        }, 5000);
    }, 24 * 60 * 60 * 1000);
    
}

module.exports.run = async function (api, event, args, client) {
    let check = global.gConfig.DEV.find(item => item == event.senderID)
    if(!check) return api.sendMessage('Bạn không thể dùng chức năng này', event.threadID, event.messageID)
    let seconds = 5;
    api.sendMessage(`hệ thống sẽ tự khởi động lại sau: 5 giây`, event.threadID, (error, data) => {
        if(error) return console.error(error);
        global.gConfig.threadRS = event.threadID
        global.gConfig.STARTTIME = global.timeRun + 5000
        global.gConfig.TIMERS = Date.now() + 5000
        saveFile()
        const interval = setInterval(() => {
            console.log(seconds);
            seconds--;
            api.editMessage(data.messageID, `hệ thống sẽ tự khởi động lại sau: ${seconds} giây`)
            
    
            if (seconds < 0) {
                clearInterval(interval);
                console.log('Hết giờ!');
                process.on('exit', (code) => {
                    if (code !== 0) {
                        //hmmmmmm
                    }
                });
                process.exit(1)
                // exec('npm run res', (error, stdout, stderr) => {
                //     if (error) {
                //         console.error(`Lỗi khi khởi động lại ứng dụng: ${error}`);
                //         return;
                //     }
                //     console.log(`Ứng dụng đã khởi động lại: ${stdout}`);
                // });
            }
        }, 1000);
    })
    
    
}
module.exports.anyEvent = async function (api, event, client) {
    // console.log('anyEvent');
    threadID = event.threadID
  };
function saveFile() {
    const filePathBT = path.join(__dirname, '..', '..', 'gConfig.json');
    fs.writeFile(filePathBT + '.tmp', JSON.stringify(global.gConfig, null, 2), { encoding: 'utf8' }, (err) => {
        if (err) {
            console.error('Lỗi khi lưu tien file:', err);
        } else {
            fs.rename(filePathBT + '.tmp', filePathBT, (err) => {
                if (err) {
                    console.error('Lỗi khi đổi tên file:', err);
                }
            });
        }
    });
}