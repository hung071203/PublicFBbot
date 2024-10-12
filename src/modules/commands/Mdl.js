
const path = require('path');
module.exports.config = {
    name: 'mdl',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' làm vc với mdl',
    tag: 'DEV',
    usage: '!mdl [load/del/reload] '
, countDown: 700, role: 0};


module.exports.run = async function (api, event, args, client) {
    let check = global.gConfig.DEV.find(item => item == event.senderID)
    if(!check) return api.sendMessage('Bạn không thể dùng chức năng này', event.threadID, event.messageID)
    
    let commandPath = path.join(__dirname, '..', 'commands');
   
    console.log(commandPath);
    let msg = ''
    switch (args[1]) {
        
        case 'del':
            try {
                commandPath = path.join(__dirname, `${args[2]}.js`);
                delete require.cache[require.resolve(commandPath)];
                
                // Nạp lại module và trả về
                const command = require(commandPath)
                if (!command.config.name) return api.sendMessage('Mdl k đúng định dạng, k thể nạp lại', event.threadID, event.message)
                if(!client.commands.has(command.config.name)) return api.sendMessage('Mdl k tồn tại trong lệnh', event.threadID, event.message)
                client.commands.delete(command.config.name)
                api.sendMessage('Xóa mdl thành công', event.threadID, event.message)
            } catch (error) {
                return api.sendMessage(`Lỗi: ${error.message}`, event.threadID, event.message)
            }
            break;
        case 'load':
            switch (args[2]) {
                case 'commands':
                    try {
                        commandPath = path.join(__dirname, `${args[3]}.js`);
                        delete require.cache[require.resolve(commandPath)];
                        
                        // Nạp lại module và trả về
                        const command = require(commandPath)
                        if (!command.config.name) return api.sendMessage('Mdl k đúng định dạng, k thể nạp lại', event.threadID, event.message)
                        if(client.commands.has(command.config.name)) {
                            client.commands.delete(command.config.name)
                        }
                        client.commands.set(command.config.name, command)
                        api.sendMessage('Load mdl thành công', event.threadID, event.message)
                    } catch (error) {
                        return api.sendMessage(`Lỗi: ${error.message}`, event.threadID, event.message)
                    }
                    
                    break;
                case 'events':
                    
                    try {
                        commandPath = path.join(__dirname, '..', 'events', `${args[3]}.js`);
                        delete require.cache[require.resolve(commandPath)];
                        
                        // Nạp lại module và trả về
                        const command = require(commandPath)
                        if (!command.config.name) return api.sendMessage('Mdl k đúng định dạng, k thể nạp lại', event.threadID, event.message)
                        if(client.events.has(command.config.name)) {
                            client.events.delete(command.config.name)
                        }
                        
                        client.events.set(command.config.name, command)
                        api.sendMessage('Load mdl thành công', event.threadID, event.message)
                    } catch (error) {
                        return api.sendMessage(`Lỗi: ${error.message}`, event.threadID, event.message)
                    }
                    break;
                case 'apis': 
                    try {
                            
                        apisPath = path.join(__dirname, '..', '..', '..', `apis`, `${args[3]}.js`);
                        delete require.cache[require.resolve(apisPath)];
                        client.apis[args[3]] = require(apisPath)

                        api.sendMessage('Load api thành công', event.threadID, event.message)
                    } catch (error) {
                        return api.sendMessage(`Lỗi: ${error.message}`, event.threadID, event.message)
                    }
                    break;
                case 'all':
                    try {
                        
                        const handlers = ['handlerCommand', 'handlerEvent', 'loadApis'];
                        client.apis = {};
                        client.commands.clear();
                        client.events.clear();
                        handlers.forEach(handler => {
                            
                            commandPath = path.join(__dirname, '..', '..', `core`, `${handler}`);
                            delete require.cache[require.resolve(commandPath)];
                        
                            // code sử dụng biến handler
                            require(commandPath)(client)
                        
                        });
                        api.sendMessage('Load all mdl/apis thành công', event.threadID, event.message)
                    } catch (error) {
                        return api.sendMessage(`Lỗi: ${error.message}`, event.threadID, event.message)
                    }
                    break;
                default:
                    api.sendMessage('k tìm dc đường đẫn', event.threadID, event.messageID)
                    break;
                
            }
            break;
        default:
            api.sendMessage('Sai cú pháp', event.threadID, event.messageID)
            break;
    }


}
