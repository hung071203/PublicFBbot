module.exports.config = {
    name: 'sbox',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'Đổi tên nhóm ',
    tag: 'system',
    usage: '!sbox [Tên nhóm]'
, countDown: 700, role: 3};

module.exports.run = async function (api, event, args, client) {
    const name = args.slice(1).join(" ")
    api.setTitle(name, event.threadID, (err, obj) =>{
        if(err){
            api.sendMessage('Không thể đổi tên', event.threadID, event.messageID)
        }
    })
}