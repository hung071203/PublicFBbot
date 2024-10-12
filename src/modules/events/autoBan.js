module.exports.config = {
    name: 'autoBan',
    version: '1.0.0',
    credit: 'HungDz',
    description: 'Noti!',
    usage: ''
}
let arrBan = []
module.exports.anyEvent = async function (api, event, client) {
    if (event.type == 'message' || event.type == 'message_reply') {
        const inputURL = event.body.toLowerCase();
        let threadCf = await client.apis['database'].getThreadConfig(event.threadID)
        if (!inputURL.includes(threadCf?.prefix ? threadCf.prefix : global.gConfig.PREFIX)) return
        const timeLimit = 5 * 60 * 1000
        const messageLimit = 15
        let find = arrBan.find(e => e.ID == event.senderID && e.threadID == event.threadID)
        if (!find) {
            arrBan.push({
                ID: event.senderID,
                threadID: event.threadID,
                count: 1,
                timestamp: parseInt(event.timestamp) + timeLimit
            })
            return
        }

        if (find.timestamp > parseInt(event.timestamp)) {
            if (find.count <= messageLimit) return find.count++

            let findB = await client.apis['database'].getUserThread(event.threadID, event.senderID)
            let timeBan = 30 * 60 * 1000
            if (!findB) return
            if (findB.timeBan > parseInt(event.timestamp)) return
            findB.timeBan = timeBan + parseInt(event.timestamp)
            findB.desBan = 'Spam quá nhiều'
            client.apis['database'].addUserThread(findB)
        } else {
            find.count = 1
            find.timestamp = parseInt(event.timestamp) + timeLimit
        }
    }
}

