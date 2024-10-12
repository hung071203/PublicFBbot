const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "xsmb",
  version: "1.0.0",
  credits: "Hung dep trai",
  description: "kiểm tra kết quả sổ số hôm nay/ Mua vé số",
  tag: 'Money',
  usage: "!xsmb [buy/show/(để trống nếu muốn kiểm tra kết quả)] [số vé(6 chữ số/nếu nhiều vé thì mỗi vé cách nhau bằng 1 khoảng trắng)]"
  , countDown: 700, role: 3
};
let xsmbUsers = require('../../savefile/xsmb.json')
const giai = ['đặc biệt', 'nhất', 'nhì', 'ba', 'tư', 'năm', 'sáu', 'bảy']
const moneys = [10000000, 500000, 200000, 100000, 20000, 8000, 4000, 2000]
module.exports.onload = function (api, client) {
  setInterval(async () => {
    let Time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    if (Time.includes('19:00:00')) {
      try {
        const response = await getData();
        if (!response) return
        const { openTime, detail } = response
        const numberArray = JSON.parse(detail);
        let msgs = '✅Kết quả XSMB ngày ' + openTime + '\n'
        numberArray.forEach((number, index) => {
          msgs += `→Giải ${giai[index]}: ${number}\n`
        })
        msgs += '👉Sử dụng xsmb show để xem người thắng cuộc!'
        xsmbUsers = xsmbUsers.filter(item => item.isUse == false)
        const allBox = await client.apis['database'].allThreadConfig()
        if (allBox.length == 0) return
        for (const box of allBox) {
          const { threadID, time } = box
          if (time < Date.now()) continue
          // api.sendMessage(msgs, threadID);
          await getUser(client, numberArray, threadID)
        }
        saveXsmbUsers()
      } catch (error) {
        console.error(error)
      }
    }
  }, 1000);
}
const axios = require('axios');

async function getData() {
  try {
    const response = await axios.get('https://xoso188.net/api/front/open/lottery/history/list/5/miba');
    // console.log(response.data);
    const data = response.data;
    if (!data.success) return null
    const xsmb = data.t.issueList[0]
    return xsmb
  } catch (error) {
    throw error
  }
}

async function getUser(client, numberArray, threadID) {
  let arrUser = xsmbUsers.filter(item =>item.threadID == threadID && item.isUse == false)
  if (arrUser.length == 0) return
  for (const user of arrUser) {
    user.isUse = true
    for(const ve of user.ve) {
      const index = checkLotteryNumber(ve, numberArray)
      if(index != -1) continue
      const money = moneys[index]
      let data = await client.apis['database'].getBank(threadID, user.userID)
      if(!data) continue
      data.money += money
      await client.apis['database'].addBank(data)
    }
  }
}

function checkLotteryNumber(lotteryNumber, numberArray) {
  lotteryNumber = lotteryNumber.toString();
  // Biến lưu vị trí nhỏ nhất khi trùng khớp
  let minIndex = -1;

  // Duyệt qua từng phần tử trong mảng
  for (let i = 0; i < numberArray.length; i++) {
    const numbers = numberArray[i].split(','); // Tách chuỗi thành các số riêng lẻ

    // Kiểm tra từng số trong mảng con
    for (let j = 0; j < numbers.length; j++) {
      numbers[j] = numbers[j].toString();
      // So sánh 6 chữ số cuối của số nhập vào với số trong mảng
      if (lotteryNumber.endsWith(numbers[j])) {
        if (minIndex === -1 || i < minIndex) {
          minIndex = i;
        }
      }
    }
  }
  return minIndex
}

function saveXsmbUsers() {
  const filePathBT = path.join(__dirname, '..', '..', 'savefile', 'xsmb.json');
  fs.writeFile(filePathBT + '.tmp', JSON.stringify(xsmbUsers, null, 2), { encoding: 'utf8' }, (err) => {
    if (err) {
      console.error('Lỗi khi lưu tien file:', err);
    } else {
      fs.rename(filePathBT + '.tmp', filePathBT, (err) => {
        if (err) {
          console.error('Lỗi khi đổi tên file:', err);
        }
      });
    }
  });
}
module.exports.run = async function (api, event, args, client) {
  console.log(args[1]);
  if(!args[1]) {args[1] = 'show'}
  switch (args[1]) {
    case 'show':
      try {
        const response = await getData();
        if (!response) return
        const { openTime, detail } = response
        const numberArray = JSON.parse(detail);
        let msgs = '✅Kết quả XSMB ngày ' + openTime + ':\n'
        numberArray.forEach((number, index) => {
          
          msgs += `→Giải ${giai[index]}: ${number}\n`
        })
        let arrItem = xsmbUsers.filter(item => item.userID == event.senderID && item.threadID == event.threadID)
        if(arrItem.length == 0) {
          msgs += '❗Bạn hiện không có lịch sử mua vé số trong 2 ngày gần đây!\n'
        }else {
          arrItem.forEach(item => {
            if (item.isUse) {
              msgs += `✅Tổng số vé đã mua hôm qua: ${item.ve.join(', ')}\n`
            }else{
              msgs += `✅Tổng số vé đã mua hôm nay: ${item.ve.join(', ')}\n⚠️Vui lòng đợi đến 19h để kiểm tra kết quả vé số hôm nay\n `
            }
          })
        }
        msgs += '📝Sử dụng xsmb rule để xem cơ cấu giải thưởng!'
        api.sendMessage(msgs, event.threadID, event.messageID)
      } catch (error) {
        api.sendMessage(error.message, event.threadID, event.messageID)
      }
      break;
    case 'buy':
      if (!args[2]) return api.sendMessage('Vui lòng nhập số vé', event.threadID, event.messageID);
      const arrNum = args.slice(2);
      const veso = xsmbUsers.filter(item => item.isUser == false).flatMap(item => item.ve);
      console.log(arrNum, veso);

      // Lọc các số trong `arrNum` không trùng lặp và đáp ứng các điều kiện
      const allValid = [...new Set(arrNum)].filter(num =>
        !isNaN(num) && num <= 999999 && !veso.includes(num)
      );
      if (allValid.length == 0) return api.sendMessage('Tất cả các vé đã được những người khác mua hết hoặc định dạng vé số k đúng!', event.threadID, event.messageID)
      let userBank = await client.apis['database'].getBank(event.threadID, event.senderID)
      if (userBank.money < allValid.length * 100) return api.sendMessage('Bạn không đủ tiền để mua, cần thêm ' + (allValid.length * 100 - userBank.money) + '$', event.threadID, event.messageID)
      userBank.money -= allValid.length * 100
      client.apis['database'].addBank(userBank)
      let item = xsmbUsers.find(item => item.userID == event.senderID && item.threadID == event.threadID && item.isUse == false)
      if(!item) {
        xsmbUsers.push({ userID: event.senderID, threadID: event.threadID, isUse: false, ve: allValid})
      }else{
        item.ve = item.ve.concat(allValid)
      }
      saveXsmbUsers()
      api.sendMessage(`💸Đã mua ${allValid.length} vé số\n🎫Tổng số vé của bạn hiện tại: ${(item?.ve || allValid).join(', ')}\nVui lòng đợi đến 19h để xem kết quả`, event.threadID, event.messageID);
      break;
    case 'rule':
      let msgs = '✅Cơ cấu giải thưởng:\n'
      giai.forEach((item, index) => {
        msgs += `→Giải ${item}: ${moneys[index].toLocaleString('en-US')}$\n`
      })
      api.sendMessage(msgs, event.threadID, event.messageID)
      break
    // case 'run':
    //   try {
    //     const response = await getData();
    //     if (!response) return
    //     const { openTime, detail } = response
    //     const numberArray = JSON.parse(detail);
    //     let msgs = '✅Kết quả XSMB ngày ' + openTime + '\n'
    //     numberArray.forEach((number, index) => {
    //       msgs += `→Giải ${giai[index]}: ${number}\n`
    //     })
    //     msgs += '👉Sử dụng xsmb show để xem người thắng cuộc!'
    //     xsmbUsers = xsmbUsers.filter(item => item.isUse == false)
    //     const allBox = await client.apis['database'].allThreadConfig()
    //     if (allBox.length == 0) return
    //     for (const box of allBox) {
    //       const { threadID, time } = box
    //       if (time < Date.now()) continue
    //       api.sendMessage(msgs, threadID);
    //       await getUser(client, numberArray, threadID)
    //     }
    //     saveXsmbUsers()
    //   } catch (error) {
    //     console.error(error)
    //   }
    //   break
    default:
      api.sendMessage('Cú pháp không hợp lệ!', event.threadID, event.messageID);
      break;
  }
}