const axios = require('axios');
module.exports.config = {
    name: 'ping',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'Ping! nội dung đến mọi người',
    tag: 'system',
    usage: '!ping [nội dung]'
    , countDown: 700, role: 3
};

module.exports.run = async function (api, event, args, client) {
    let text = ''
    if (args.length == 1) {
        text = 'Mọi người'
    } else {
        text = args.slice(1).join(" ");
    }

    msgbody = `${text}`;
    msg = {
        body: msgbody,
        mentions: [
            {
                tag: `${text}`,
                id: event.threadID
            }
        ]
    }
    api.sendMessage(msg, event.threadID);


};

module.exports.noprefix = function (api, event, args, client) {
    // Tương tự như trên nhưng không cần prefix
    const pingURL = async (url) => {
        try {
            const startTime = Date.now();
            await axios.get(url);
            const endTime = Date.now();
            const pingTime = endTime - startTime;
            console.log(`Ping to ${url} took ${pingTime} ms`);
            api.sendMessage(`Ping to ${url} took ${pingTime} ms`, event.threadID, event.messageID)
        } catch (error) {
            console.error(`Ping to ${url} failed: ${error.message}`);
            api.sendMessage(`Ping to ${url} failed: ${error.message}`, event.threadID, event.messageID)
        }
    };
    if (args.length == 1) {
        pingURL('https://www.google.com');
    } else {
        const isURL = /^http(|s):\/\//.test(args[1]);
        if (!isURL) {
            if (!args[1].includes('.')) return
        }
        pingURL(isURL ? args[1] : `https://${args[1]}`);
    }

};

module.exports.onload = function (api, client) {
    // Hàm được thực thi khi bpt khởi chạy
    console.log('onload!');
};
