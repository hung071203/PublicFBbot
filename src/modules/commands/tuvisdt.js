const axios = require('axios');
const cheerio = require('cheerio');

module.exports.config = {
    name: "tuvisdt",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "xem tử vi về ngày sinh và số điện thoại",
    tag: 'mê tín',
    usage: `!tuvisdt (dd-mm-yyyy) (so dien thoai)`
  , countDown: 700, role: 3};
  
  
module.exports.run = async function (api, event, args, client) {
    if(args.length != 3) return api.sendMessage('Không hợp lệ!', event.threadID, event.messageID)
    if(!isValidDateFormat(args[1])) return api.sendMessage('Định dạng ngày tháng năm không hợp lệ, phải là dd-mm-yyyy!', event.threadID, event.messageID)
    if(isNaN(args[2])) return api.sendMessage('Định dạng sdt không hợp lệ!', event.threadID, event.messageID)
    const payload = {
        dateOfBirth: args[1],
        phone: args[2]
    };
    try {
        const response = await axios.post('https://lichngaytot.com/Ajax/XemSDTtheophongthuyAjax', payload);
    
        // console.log('Response:', response.data);
        const $ = cheerio.load(response.data);
        const text = $('body')
            .text()
        api.sendMessage(text, event.threadID, event.messageID)
    } catch (error) {
    console.error('Error fetching data:', error);
    api.sendMessage(error.message, event.threadID, event.messageID)
    }

}

function isValidDateFormat(date) {
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    return regex.test(date);
}