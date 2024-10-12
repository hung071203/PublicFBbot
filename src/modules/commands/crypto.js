module.exports.config = {
  name: "crypto",
  version: "1.0.0",
  credits: "Hung dep zai",
  description: "May rủi với tiền điện tử",
  tag: "Money",
  usage: "!crypto [show/buy/sell]",
  countDown: 700,
  role: 3,
};

const axios = require("axios");
const { type } = require("os");
async function getCryptos() {
  try {
    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_KEY,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    return { err: error.toString() };
  }
}
module.exports.onload = async function (api, client) {};

function processData(datas) {
  let msg = "";
  datas.forEach((data, index) => {
    msg += `${index + 1}. ${data.name} - ${data.symbol} - ${data.quote.USD.price.toFixed(2)}$\n━━━━━━━━━━━━━━━━━━\n`;
  });
  return msg;
}

module.exports.run = async function (api, event, args, client) {
  if (args[1] == "show" || args[1] == "buy" || args[1] == "sell") {
    var cryptos = await getCryptos();
    if (cryptos.err) return api.sendMessage(cryptos.err, event.threadID, event.messageID);
    var msg = "Thông tin bảng giá các đồng crypto hiện tại:\n━━━━━━━━━━━━━━━━━━\n";
    msg += processData(cryptos.slice(0, 10));
    msg += "Định dạng: | name - symbol - price$ |\n━━━━━━━━━━━━━━━━━━\n";
  }

  switch (args[1]) {
    case "show":
      api.sendMessage(msg, event.threadID, event.messageID);
      break;
    case "buy":
      msg += 'Chọn đồng crypto muốn mua bằng số kèm số tiền mua bên cạnh, chọn ngoài khoảng để hủy!'
      api.sendMessage(msg, event.threadID, (err, data) => {
        if (err) return console.log(err);
        client.handleReply.push({
          type: "buyCrypto",
          name: this.config.name,
          messageID: data.messageID,
          author: event.senderID,
          cryptos: cryptos.slice(0, 10)
        })
      }, event.messageID);
      break;
    case "sell":
      const userCrypto = await client.apis["database"].getCrypto(event.threadID, event.senderID);
      if(!userCrypto || userCrypto.length == 0) return api.sendMessage("Bạn chưa mua đồng tiền ảo nào", event.threadID, event.messageID);
      var msgs = 'Danh sách đồng cryto bạn đang sở hữu:\n━━━━━━━━━━━━━━━━━━\n';
      let newArr = []
      userCrypto.forEach((data, index) => {
        if(data.amount == 0) return
        const find = cryptos.find(item => item.symbol == data.name);
        msgs += `${index + 1}. ${data.name} - ${data.amount} - ${data.price.toFixed(2)}$ - ${find ? find.quote.USD.price.toFixed(2) : data.price.toFixed(2)}$\n━━━━━━━━━━━━━━━━━━\n`;
        newArr.push({
          name: data.name,
          amount: data.amount,
          price: data.price,
          price_sell: find ? find.quote.USD.price.toFixed(2) : data.price.toFixed(2)
        })
      })
      if(newArr.length == 0) return api.sendMessage("Có đồng nào đâu mà đòi bán!", event.threadID, event.messageID);
      msgs += 'Định dạng: | name - amount - Giá lúc mua - giá hiện tại |\n━━━━━━━━━━━━━━━━━━\n';
      msgs += 'Chọn đồng crypto muốn bán bằng số kèm số lượng muốn bán bên cạnh, chọn ngoài khoảng để hủy!'
      api.sendMessage(msgs, event.threadID, (err, data) => {
        if (err) return console.log(err);
        client.handleReply.push({
          type: "sellCrypto",
          name: this.config.name,
          messageID: data.messageID,
          author: event.senderID,
          cryptos: newArr
        })
      }, event.messageID);
      break;
    default:
      var msg = "Vui lòng để định dạng: !crypto [show/buy/sell]";
      break;
  }
};

module.exports.handleReply = async function (api, event, client, hdr) {
  if(hdr.author != event.senderID) return
  const args = event.body.split(" ");
  if(args.length != 2 || isNaN(args[1]) || isNaN(args[0])) return api.sendMessage('Cú pháp không hợp lệ, giá trị nhập vào phải là số ví dụ(1 1), ...!', event.threadID, event.messageID);
  const chose = parseInt(args[0]) - 1;
  const pOrA = parseFloat(args[1]);
  if(chose >= hdr.cryptos.length) {
    api.unsendMessage(hdr.messageID);
    client.handleReply = client.handleReply.filter(item => item.messageID != hdr.messageID);
    return api.sendMessage('Số đã chọn k hợp lệ, hủy mua!', event.threadID, event.messageID);
  }
  const userBank = await client.apis["database"].getBank(event.threadID, event.senderID);
  const crypto = hdr.cryptos[chose];
  const userCrypto = await client.apis["database"].getCrypto(event.threadID, event.senderID);
  if(hdr.type == "buyCrypto"){
    if(userBank.money < pOrA) return api.sendMessage('Bạn k đủ tiền để mua!', event.threadID, event.messageID);
    const cryptoData = {
      ID: event.senderID,
      threadID: event.threadID,
      name: crypto.symbol,
      price: crypto.quote.USD.price,
      amount: pOrA / crypto.quote.USD.price
    };

    if (!userCrypto || userCrypto.length == 0) {
      client.apis["database"].addCrypto(cryptoData);
    } else {
      let find = userCrypto.find(item => item.name == crypto.symbol);
      if (find) {
        find.amount += cryptoData.amount;
        find.price = cryptoData.price;
      } else {
        find = cryptoData;
      }
      client.apis["database"].addCrypto(find);
    }
    userBank.money -= pOrA;
    client.apis["database"].addBank(userBank);
    api.sendMessage(`Bạn đã mua thành công ${pOrA / crypto.quote.USD.price}${crypto.symbol} với giá ${pOrA}$`, event.threadID, event.messageID);
  } else if(hdr.type == "sellCrypto"){
    if(pOrA > crypto.amount) return api.sendMessage('Vượt quá số lượng bạn hiện có!', event.threadID, event.messageID);
    userBank.money += pOrA * crypto.price_sell;
    const find = userCrypto.find(item => item.name == crypto.name);
    find.amount -= pOrA;
    client.apis["database"].addCrypto(find);
    client.apis["database"].addBank(userBank);
    api.sendMessage(`Bạn đã bán thành công ${pOrA}${crypto.name} với giá ${crypto.price_sell}$/${crypto.name}\n ➜ Số tiền thu được ${pOrA * crypto.price_sell}$`, event.threadID, event.messageID);
  }
  api.unsendMessage(hdr.messageID);
  client.handleReply = client.handleReply.filter(item => item.messageID != hdr.messageID);
};
