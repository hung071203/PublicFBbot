const moment = require('moment-timezone');

module.exports.config = {
  name: 'checktt',
  version: '1.0.0',
  credits: 'Hung dep zai',
  description: 'Hiện những người nhắn tin nhiều nhất từ trên xuống dưới',
  tag: 'system',
  usage: '!checktt [day/week]'
  , countDown: 700, role: 3
};

module.exports.onload = async function (api, client) {
  setInterval(async () => {
    await runOnload(api, client)
  }, 60000);

}
function getStartOfDayVN() {
  return moment.tz('Asia/Ho_Chi_Minh').startOf('day').valueOf();  // Trả về timestamp
}

function getStartOfWeekVN() {
  return moment.tz('Asia/Ho_Chi_Minh').startOf('week').valueOf();  // Trả về timestamp
}
async function runOnload(api, client) {
  try {
    let all = await client.apis['database'].allMessage()
    // const allBox = await client.apis['database'].allThreadConfig()
    // if (allBox.length > 0) {
    //   for (const box of allBox) {
    //     const { threadID, time } = box
    //     if(time < Date.now()) continue
    //     let check =''
    //     if (Date.now() >= all[0].last_updated_day + 24 * 60 * 60 * 1000) {
    //       check = 'day'
    //     }
    //     if (Date.now() >= all[0].last_updated_week + 7 * 24 * 60 * 60 * 1000) {
    //       check = 'week'
    //     }
    //     if (check != '') {
    //       const arrMess = await client.apis['database'].getMessage(threadID)
    //       let msgs = await generateLeaderboard(arrMess, [], check, client)
    //       msgs = `-----------------------------------------------------------------------\n|Top tuơng tác ${check == 'day' ? 'ngày hôm qua' : 'tuần trước'}:|\n-----------------------------------------------------------------------\n${msgs}\n`;
    //       api.sendMessage(msgs, threadID)
    //     }
    //   }
    // }

    all.forEach(find => {
      if (Date.now() >= find.last_updated_day + 24 * 60 * 60 * 1000) {
        find.day = 0
        find.last_updated_day = getStartOfDayVN()
      }

      if (Date.now() >= find.last_updated_week + 7 * 24 * 60 * 60 * 1000) {
        find.week = 0
        find.last_updated_week = getStartOfWeekVN()
      }
      client.apis['database'].newMessage(find)
    })
  } catch (error) {
    console.error('loi onload mess' + error)
  }
}

module.exports.run = async function (api, event, args, client) {
  let arrMess = []
  try {
    arrMess = await client.apis['database'].getMessage(event.threadID)
    console.log(arrMess);
  } catch (error) {
    console.error(error);
  }
  let msg = ''
  switch (args[1]) {
    case 'day':
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0)
      var date = new Date(currentDate.getTime());

      var localeDate = date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      let msgs = await generateLeaderboard(arrMess, event.participantIDs, 'day', client)
      msg = `-----------------------------------------------------------------------\n|Top tuơng tác ngày hôm nay ${localeDate}:|\n-----------------------------------------------------------------------\n${msgs}\n`;
      api.sendMessage(msg, event.threadID, (error, info) => {
        if (error) {
          console.log(error);
        } else {

        }
      }, event.messageID);
      break;

    case 'week':
      const today = new Date();

      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - today.getDay());
      const timestampInMilliseconds = startOfWeek.getTime();

      var date = new Date(timestampInMilliseconds);

      var localeDate = date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

      let msgs1 = await generateLeaderboard(arrMess, event.participantIDs, 'week', client)
      msg = `-----------------------------------------------------------------------\n|Top tuơng tác tuần kể từ ngày ${localeDate}:|\n-----------------------------------------------------------------------\n${msgs1}\n`;
      api.sendMessage(msg, event.threadID, (error, info) => {
        if (error) {
          console.log(error);
        } else {

        }
      }, event.messageID);
      break;

    default:
      let msgs2 = await generateLeaderboard(arrMess, event.participantIDs, 'all', client)
      msg = `-----------------------------------------------------------------------\n|BXH những người lắm mồm nhất nhóm:|\n-----------------------------------------------------------------------\n${msgs2}\n`;
      api.sendMessage(msg, event.threadID, (error, info) => {
        if (error) {
          console.log(error);
        } else {

        }
      }, event.messageID);
      break;
  }




}
async function generateLeaderboard(messages, participantIDs, dwa, client) {
  let msgs = '';
  let sum = 0;

  if (dwa == 'day') {
    messages.sort((a, b) => b.day - a.day);
    for (const [index, e] of messages.entries()) {
      sum += e.day;
      const usIF = await getUserInfo(client, e.sender_id);
      msgs += `\n${index + 1}, ${usIF ? usIF.name : 'Không xác định'}: ${e.day} tin nhắn`;
    }
  } else if (dwa == 'week') {
    messages.sort((a, b) => b.week - a.week);
    for (const [index, e] of messages.entries()) {
      sum += e.week;
      const usIF = await getUserInfo(client, e.sender_id);
      msgs += `\n${index + 1}, ${usIF ? usIF.name : 'Không xác định'}: ${e.week} tin nhắn`;
    }
  } else {
    messages.sort((a, b) => b.total - a.total);
    let i = 1;
    for (const e of messages) {
      participantIDs = participantIDs.filter(item => item != e.sender_id);
      const usIF = await getUserInfo(client, e.sender_id);
      sum += e.total;
      msgs += `\n${i}, ${usIF ? usIF.name : 'Không xác định'}: ${e.total} tin nhắn`;
      i++;
    }
    for (const e of participantIDs) {
      const usIF = await getUserInfo(client, e);
      msgs += `\n${i}, ${usIF ? usIF.name : 'Không xác định'}: 0 tin nhắn`;
      i++;
    }
  }

  msgs += `\n=> Tổng số tin nhắn: ${sum}`;
  console.log(msgs);
  return msgs;
}

async function getUserInfo(client, userID) {

  let find = await client.apis['database'].getUser(userID)
  if (!find) {
    return null
  }
  return find
}


