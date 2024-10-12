

module.exports.config = {
    name: 'doanso',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Đoán số có 4 chữ số, bạn có 5 lần đoán, nếu đoán sai cả 5 sẽ mất hêt tiền cược còn trúng thì sẽ nhận thường bằng tiền cược nhân số lần còn lại',
    tag: 'game',
    usage: '!doanso [Số tiền cược]',
    countDown: 700, 
    role: 3
};

module.exports.run = async function (api, event, args, client) {
    if(args.length != 2) return api.sendMessage('Cú pháp k hợp lệ!', event.threadID, event.messageID)
    if(isNaN(args[1])) return api.sendMessage('Tiền cược phải là 1 con số!', event.threadID, event.messageID)
    let mon = parseFloat(args[1])
    if(mon < 100) return api.sendMessage('Số tiền phải hơn 100$!', event.threadID, event.messageID)
    let user = await client.apis['database'].getBank(event.threadID, event.senderID)
    if(!user) return api.sendMessage('Lỗi xảy ra, thử lại', event.threadID, event.messageID)
    if(user.money < mon) return api.sendMessage('M nghèo quá r!', event.threadID, event.messageID)
    user.money -= mon
    client.apis['database'].addBank(user)
    const number = generateSecretNumber()
    api.sendMessage('Game bắt đầu, bạn đã cược thành công '+mon+'$ \nHãy đoán 1 số có 4 chữ số khác nhau.\nBạn có 7 lần thử!',event.threadID, (err, data) => {
        if(err) return console.error(err);
        client.handleReply.push({
            name: this.config.name,
            messageID: data.messageID,
            author: event.senderID,
            secret: number,
            count: 7,
            cuoc: mon,
            timestamp: event.timestamp
        })
    })
}

module.exports.handleReply = async function (api, event, client, hdr) {
    if(event.senderID != hdr.author) return
    let user = await client.apis['database'].getBank(event.threadID, event.senderID)
    if(isNaN(event.body)) return  api.sendMessage('Nhập số mà m!', event.threadID, event.messageID)
    if(hdr.secret == event.body){
        api.sendMessage('chúc mùng bạn đã đoán đúng, bạn nhận được '+ (hdr.mon + hdr.mon * hdr.count) + '$', event.threadID, event.messageID)
        user.money += hdr.mon + hdr.mon * hdr.count
        client.apis['database'].addBank(user)
        api.unsendMessage(hdr.messageID)
        client.handleReply = client.handleReply.filter(item =>item.messageID != hdr.messageID);
    }else{
        const { correctDigits, correctPosition } = checkGuess(hdr.secret, event.body)
        let msg = `Đoán sai, số bạn đoán có ${correctDigits} chữ số đúng nhưng sai vị trí, ${correctPosition} chữ số đúng vị trí!\n`
        hdr.count -- 
        if(hdr.count == 0) {
            msg += 'Đã hết 7 lần thử, bạn đã thua. Số cần tìm là ' + hdr.secret + '!'
            api.unsendMessage(hdr.messageID)
            client.handleReply = client.handleReply.filter(item =>item.messageID != hdr.messageID);
        }else{
            msg += `Bạn còn ${hdr.count} lần thử!`
        }
        api.sendMessage(msg, event.threadID, (err, data) =>{
            if(err) return
            api.unsendMessage(hdr.messageID)
            hdr.messageID = data.messageID
        }, event.messageID)

    }

}



// Hàm kiểm tra số đoán
function checkGuess(secret, guess) {
  let correctDigits = 0;
  let correctPosition = 0;

  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      correctPosition++;
    } else if (secret.includes(guess[i])) {
      correctDigits++;
    }
  }

  return { correctDigits, correctPosition };
}

function generateSecretNumber() {
    let digits = [];
    while (digits.length < 4) {
      let digit = Math.floor(Math.random() * 10);
      if (digit !== 0 && !digits.includes(digit)) {
        digits.push(digit);
      }
    }
    return digits.join('');
  }
