const { log } = require('console');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'money',
    version: '1.0.0',
    credit: 'HungDz',
    description: 'Noti!',
    usage: ''
}

module.exports.onload = async function (api, client) {
    setInterval( async() => {
        try {
            let all = await client.apis['database'].allBank()
            all.forEach(e => {
                if (e.moneyL < 0) {
                    e.moneyL = 0
                }
                let timeN = Date.now();
                while (timeN >= e.timeL+ 24 * 60*60*1000) {
                    e.timeL += 24 * 60*60*1000;
                    e.moneyL += e.moneyL*0.07
                }
                
                if (e.moneyV < 0) {
                    e.moneyV = 0
                }
                while (timeN >= e.timeV+ 24 * 60*60*1000) {
                    e.moneyV += e.moneyV*0.1;
                    e.timeV += 24 * 60*60*1000;
                }
                client.apis['database'].addBank(e)
            });
        } catch (error) {
            console.error('loi banks' + error)
        }
    }, 10000);
    
}
module.exports.run = async function (api, event, client) {
    //nothing
}
module.exports.anyEvent = async function (api, event, client) {
    const botID = api.getCurrentUserID();

    if (event.type == 'message' || event.type == 'message_reply') {

        const mID = event.senderID;
        if (mID == botID) return
        const id = await client.apis['database'].getBank(event.threadID, mID);
        if (!id) {
            api.getUserInfo(mID, (err, userInfo) => {
                if (err) return console.log(err.error);

                client.apis['database'].addBank({
                    name: userInfo[mID].name,
                    ID: mID,
                    threadID: event.threadID,
                    money: 0,
                    moneyV: 0,
                    moneyL: 0,
                    timeL: Date.now(),
                    timeV: Date.now(),
                });
            })
        }
        if (id) {
            id.money += 1
            if (id.money < 0) {
                id.money = 0
            }
            if (isNaN(id.money)) {
                id.money = 0
            }
            if (id.timeV == 0) {

                id.timeV = Date.now();
            }
            if (id.moneyV > 9999999 && id.money > 0) {
                let a = id.money;
                if (id.money > id.moneyV) {
                    a = id.money - id.moneyV + 9999999;
                    id.money = a;
                    id.moneyV = 9999999;

                } else {
                    id.moneyV -= id.money;
                    id.money = 0;
                }


                api.sendMessage(`Số nợ của người dùng ${id.name} vượt quá 9,999,999$, Nợ sẽ tự động được thanh toán.\nTKC trừ ${a.toLocaleString('en-US')}$\nSố nợ hiện tại: ${id.moneyV.toLocaleString('en-US')}$`, event.threadID, event.messageID);
            }
            client.apis['database'].addBank(id)
        }


    }

}