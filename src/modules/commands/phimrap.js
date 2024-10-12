
const axios = require('axios');

module.exports.config = {
    name: 'phimrap',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Kiểm tra thông tin phim chiếu tại các rạp',
    tag: 'Công cụ',
    usage: '!phimrap (Galaxy/CGV/Gallaxy/Lotte/Mega GS/BHD/Dcine) '
    , countDown: 700, role: 3
};

module.exports.run = async function (api, event, args, client) {
    if(args.length > 2) return api.sendMessage('Cú pháp không hợp lệ', event.threadID, event.messageID)
    let rap = ''
    if(args[1]){
        if(args[1] == 'Galaxy' || args[1] == 'CGV' || args[1] == 'Gallaxy' || args[1] == 'Lotte' || args[1] == 'Mega GS' || args[1] == 'BHD' || args[1] == 'Dcine'){
            rap = args[1]
        }else{
            return api.sendMessage('Cú pháp không hợp lệ, yêu cầu tên 1 trong các rạp sau, hoặc để trống để hiện tất cả!(Galaxy/CGV/Gallaxy/Lotte/Mega GS/BHD/Dcine)', event.threadID, event.messageID)
        }
    }
    try {
        const response = await axios.get(`https://rapchieuphim.com/api/v1/movies`);
        let data = response.data
        if(data.length == 0) return api.sendMessage('Không tìm thấy phim', event.threadID, event.messageID)
        if(rap != ''){
            data = data.filter(item => item.release_vn == rap)
        }
        const lastTenRecords = data.slice(-10).reverse()
        let msgs = `✅Thông tin 10 bộ phim mới nhất tại ${rap != '' ? rap : 'Tất cả các rạp'} \n\n`
        lastTenRecords.forEach((item, index) => {
            msgs += `${index + 1}. Tên: ${item.name}\n`
            msgs += `Thời gian khởi chiếu: ${item.release}\n`
            msgs += `Nội dung: ${item.seo_description}\n`
            msgs += `Đơn vị chiếu: ${item.release_vn}\n`
            msgs += `Thời lượng: ${item.duration}\n\n`

        });
        api.sendMessage(msgs, event.threadID, event.messageID)
    } catch (error) {
        api.sendMessage('Lỗi:' + error.message, event.threadID, event.messageID)
    }
}