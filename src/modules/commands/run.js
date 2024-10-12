const vm = require('vm');

module.exports.config = {
    name: 'run',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'Chạy lệnh trong code',
    tag: 'DEV',
    usage: '!run [lệnh]', 
    countDown: 700, 
    role: 0
};

module.exports.run = async function (api, event, args, client) {
    if(args.length == 1) return api.sendMessage('Chưa thêm lệnh!', event.threadID, event.messageID)
    const context = {
        api,
        event,
        args,
        client,
        console,
        process,
        global
    };
    vm.createContext(context);
    const command = args.slice(1).join(' ');
    try {
        // Thực thi lệnh trong ngữ cảnh đã tạo
        const result = vm.runInContext(command, context);

        let output = '';
        if (result !== undefined && result !== null) {
            output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        }

        // Gửi kết quả qua api.sendMessage
        api.sendMessage(output, event.threadID, event.messageID);
    } catch (e) {
        api.sendMessage(`Lỗi khi thực thi lệnh: ${e.message}`, event.threadID, event.messageID);
    }
}