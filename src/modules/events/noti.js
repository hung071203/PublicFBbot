const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "noti",
  version: "1.0.0",
  credit: "HungDz",
  description: "Noti!",
  usage: "",
};

let check = true;
module.exports.anyEvent = async function (api, event, client) {
  if (check) {
    check = false;
    processData(api, client);
  }
};

function replacePlaceholders(text, values) {
  return text.replace(/{(.*?)}/g, (_, key) => {
    // Trả về giá trị tương ứng từ đối tượng values, nếu không tìm thấy thì giữ nguyên
    return values[key] || `{${key}}`;
  });
}

async function generateLeaderboard({
  client,
  userid,
  name,
  tid,
  time,
  tuser,
  adid,
}) {
  if (!name) {
    const user = await client.apis["database"].getUser(userid);
    name = user?.name;
  }
  if (adid) {
    const user = await client.apis["database"].getUser(adid);
    var adname = user?.name;
  }
  const box = await client.apis["database"].getThreadConfig(tid);

  return {
    name: name || "Lỏ",
    userid: userid,
    tname: box?.threadName || "Lỏ",
    tid: tid,
    time: time,
    tuser: tuser,
    adname: adname || "Lỏ",
    adid: adid,
  };
}

async function joinNoti(api, event, client, antiJ, msg) {
  if (antiJ == false) {
    const format = {
      client,
      userid: event.logMessageData.addedParticipants[0].userFbId,
      name: event.logMessageData.addedParticipants[0].fullName,
      tid: event.threadID,
      time: client.getTime(Date.now()),
      tuser: event.participantIDs.length,
    };
    const after = await generateLeaderboard(format);
    msg = replacePlaceholders(msg, after);

    api.shareContact(
      msg,
      event.logMessageData.addedParticipants[0].userFbId,
      event.threadID,
      (err, data) => {
        if (err) {
          console.log(err);
        }
      }
    );
  } else {
    let check = await client.apis["database"].getUserThread(
      event.threadID,
      api.getCurrentUserID()
    );
    if (!check?.isQTV)
      return api.sendMessage(
        "Vui lòng thêm bot làm QTV để antiJoin có hiệu lực!",
        event.threadID
      );
    api.removeUserFromGroup(
      event.logMessageData.addedParticipants[0].userFbId,
      event.threadID,
      (err) => {
        if (err) return console.log(err);
        api.sendMessage(
          "Người dùng đã bị kick vì antiJoin đang có hiệu lực!",
          event.threadID
        );
      }
    );
  }
}

async function outNoti(api, event, client, antiO, msg) {
  const user = await client.apis["database"].getUser(
    event.logMessageData.leftParticipantFbId
  );
  if (antiO == false) {
    const format = {
      client,
      userid: event.logMessageData.leftParticipantFbId,
      name: user?.name,
      tid: event.threadID,
      time: client.getTime(Date.now()),
      tuser: event.participantIDs.length,
      adid: event.author,
    };
    const after = await generateLeaderboard(format);
    msg = replacePlaceholders(msg, after);
    api.shareContact(
      msg,
      event.logMessageData.leftParticipantFbId,
      event.threadID,
      (err, data) => {
        if (err) {
          console.log(err);
        }
      }
    );
  } else {
    let check = await client.apis["database"].getUserThread(
      event.threadID,
      api.getCurrentUserID()
    );
    if (!check?.isQTV)
      return api.sendMessage(
        "Vui lòng thêm bot làm QTV để antiOut có hiệu lực!",
        event.threadID
      );
    const msg = {
      body: `out làm sao được ${user?.name}!`,
      mentions: [
        {
          tag: user?.name,
          id: event.logMessageData.leftParticipantFbId,
        },
      ],
    };
    api.addUserToGroup(
      event.logMessageData.leftParticipantFbId,
      event.threadID,
      (err) => {
        if (err) {
          console.log(err);
          return api.sendMessage(
            `Thêm người dùng vào lại nhóm thất bại\nLỗi: ${err.message}`,
            event.threadID
          );
        }
        api.sendMessage(msg, event.threadID);
      }
    );
  }
}

module.exports.run = async function (api, event, client) {
  switch (event.logMessageType) {
    case "log:subscribe":
      await processData(api, client);
      const findBox = await client.apis["database"].getThreadConfig(
        event.threadID
      );
      const msg = findBox?.joinNoti
        ? findBox.joinNoti
        : `✌️Chào mừng {name} đã tham gia nhóm!\n👤Bạn là thành viên thứ ${
            event.participantIDs.length
          } của nhóm\nSử dụng ${
            findBox?.prefix ? findBox.prefix : global.gConfig.PREFIX
          }rule để xem luật nhóm`;
      joinNoti(api, event, client, findBox?.antiJoin, msg);
      break;

    case "log:unsubscribe":
      if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
        client.apis["database"].delThreadMessage(event.threadID);
        client.apis["database"].delBank(event.threadID);
        client.apis["database"].delThreadConfig(event.threadID);
        client.apis["database"].delUserThread(event.threadID);
      } else {
        const find = await client.apis["database"].getThreadConfig(
          event.threadID
        );
        if (event.logMessageData.leftParticipantFbId != event.author) {
          var msgs = find?.outWAD
            ? find.outWAD
            : `Thuyền viên {name} đã bị quản trị viên sút khỏi nhóm vì ngứa mồm!`;
        } else {
          var msgs = find?.outNAD
            ? find.outNAD
            : `Thuyền viên {name} vì bị trap nên đã quyết định rời nhóm!`;
        }
        outNoti(api, event, client, find?.antiOut, msgs);
        client.apis["database"].delUserMessage(
          event.threadID,
          event.logMessageData.leftParticipantFbId
        );
        client.apis["database"].delBank(
          event.threadID,
          event.logMessageData.leftParticipantFbId
        );
        client.apis["database"].delUser(
          event.logMessageData.leftParticipantFbId
        );
        client.apis["database"].delUserThread(
          event.threadID,
          event.logMessageData.leftParticipantFbId
        );
      }
      break;

    case "log:thread-admins":
      let find = await client.apis["database"].getUserThread(
        event.threadID,
        event.logMessageData.TARGET_ID
      );
      if (!find) return;
      if (event.logMessageData.ADMIN_EVENT == "remove_admin") {
        find.isQTV = false;
      } else if (event.logMessageData.ADMIN_EVENT == "add_admin") {
        find.isQTV = true;
      }
      client.apis["database"].addUserThread(find);
      break;

    case "log:user-nickname":
      if (event.logMessageData.participant_id != api.getCurrentUserID()) {
        let threadCf = await client.apis["database"].getThreadConfig(
          event.threadID
        );
        let find = await client.apis["database"].getUserThread(
          event.threadID,
          event.logMessageData.participant_id
        );
        if (!find) return;
        if (threadCf.antiName) {
          api.changeNickname(
            find.nickName,
            event.threadID,
            event.logMessageData.participant_id,
            (err) => {
              if (err) {
                console.error(err);
                api.sendMessage(
                  "Không thể đổi lại nickname: " + err.message,
                  event.threadID
                );
              } else {
                api.sendMessage(
                  "Nhóm đang bật anti set nickname!",
                  event.threadID
                );
              }
            }
          );
        } else {
          find.nickName = event.logMessageData.nickname;
          client.apis["database"].addUserThread(find);
        }
      }
      break;

    case "log:link-status":
      let threadCf = await client.apis["database"].getThreadConfig(
        event.threadID
      );
      if (!threadCf) return;
      threadCf.invite = event.logMessageData?.joinable_mode == 1;
      client.apis["database"].addThreadConfig(threadCf);
      break;
    default:
      break;
  }
};

module.exports.onload = function (api, client) {
  // setInterval(() => {
  //     processData(api, client);
  // }, 60000 * 2);
  // setTimeout(() => {
  //     clearInterval(interval);
  //     console.log("Processing stopped after 7 seconds.");
  // }, 7000);
};
async function processData(api, client) {
  api.getThreadList(999, null, [], async (err, arr) => {
    if (err) return console.error(err);
    let arr2 = [];
    let listThread = [];
    for (const thread of arr) {
      if (thread.isGroup) {
        if (thread.snippet.includes("đã xóa bạn khỏi nhóm")) continue;
        let thisBank = await client.apis["database"].getBank(thread.threadID);
        for (const item of thisBank) {
          if (!thread.participantIDs.includes(item.ID)) {
            client.apis["database"].delBank(thread.threadID, item.ID);
          }
        }

        listThread.push(thread);
        let threadCf = await client.apis["database"].getThreadConfig(
          thread.threadID
        );
        if (threadCf) {
          if (threadCf.antiThreadName) {
            if (threadCf.threadName != thread.name) {
              api.setTitle(threadCf.threadName, thread.threadID, (err, obj) => {
                if (err) {
                  api.sendMessage(
                    "Không thể đổi tên nhóm: " + err.message,
                    thread.threadID
                  );
                } else {
                  api.sendMessage(
                    "Nhóm đang bật anti set name box!",
                    thread.threadID
                  );
                }
              });
            }
          } else {
            threadCf.threadName = thread.name ? thread.name : "";
          }
          if (threadCf.antiEmoji) {
            if (threadCf.emoji != thread.emoji) {
              api.changeThreadEmoji(
                threadCf.emoji,
                thread.threadID,
                (err, obj) => {
                  if (err) {
                    api.sendMessage(
                      "Không thể đổi lại emoji: " + err.message,
                      thread.threadID
                    );
                  } else {
                    api.sendMessage(
                      "Nhóm đang bật anti set emoji!",
                      thread.threadID
                    );
                  }
                }
              );
            }
          } else {
            threadCf.emoji = thread.emoji ? thread.emoji : "";
          }
          client.apis["database"].addThreadConfig(threadCf);

          thread.participants.forEach((e) => {
            let find = arr2.find((item) => item.userID == e.userID);
            if (find) return;
            arr2.push(e);
          });

          let userThread = await client.apis["database"].getUserThread(
            thread.threadID
          );
          userThread.forEach((e) => {
            if (!thread.participantIDs.includes(e.userID)) {
              client.apis["database"].delUserThread(thread.threadID, e.userID);
            }
          });

          thread.participantIDs.forEach((e) => {
            let find = userThread.find(
              (item) => item.userID == e && item.threadID == thread.threadID
            );
            let data = {};
            const nickname = thread.nicknames?.find((item) => item.userID == e);
            if (!find) {
              data = {
                userID: e,
                threadID: thread.threadID,
                nickName: nickname ? nickname.nickname : "",
                isQTV: thread.adminIDs.includes(e) ? true : false,
                timeBan: 0,
                desBan: "",
              };
            } else {
              data = find;
              if (threadCf.antiName) {
                if (data.nickName != nickname.nickname) {
                  api.changeNickname(
                    data.nickName,
                    thread.threadID,
                    e,
                    (err) => {
                      if (err) {
                        console.error(err);
                        api.sendMessage(
                          "Không thể đổi lại nickname: " + err.message,
                          thread.threadID,
                          thread.messageID
                        );
                      } else {
                        api.sendMessage(
                          "Nhóm đang bật anti set nickname!",
                          thread.threadID
                        );
                      }
                    }
                  );
                }
                data.isQTV = thread.adminIDs.includes(e) ? true : false;
              } else {
                data.nickName = nickname ? nickname.nickname : "";
                data.isQTV = thread.adminIDs.includes(e) ? true : false;
              }
            }
            client.apis["database"].addUserThread(data);
          });
        }
      }
    }
    //loc thread
    let allThread = await client.apis["database"].allThreadConfig();
    let mapThreads = new Map(
      listThread.map((thread) => [thread.threadID, thread])
    );
    for (const item of allThread) {
      if (!mapThreads.has(item.threadID)) {
        client.apis["database"].delThreadConfig(item.threadID);
        client.apis["database"].delThreadMessage(item.threadID);
        client.apis["database"].delBank(item.threadID);
        client.apis["database"].delUserThread(item.threadID);
      }
    }
    let mapAllThread = new Map(
      allThread.map((thread) => [thread.threadID, thread])
    );
    for (const item of listThread) {
      if (!mapAllThread.has(item.threadID)) {
        client.apis["database"].addThreadConfig({
          userName: "",
          key: "",
          threadID: item.threadID,
          checkid: 0,
          remess: 0,
          antiOut: false,
          antiJoin: false,
          antiName: false,
          antiThreadName: false,
          antiEmoji: false,
          invite: item.inviteLink.enable,
          inviteLink: item.inviteLink.link,
          emoji: item.emoji ? item.emoji : "",
          desBan: "",
          timeBan: 0,
          time: Date.now(),
          prefix: global.gConfig.PREFIX,
          botRep: false,
          threadName: item.name ? item.name : "",
        });
      } else {
        const check = await client.apis["database"].getThreadConfig(
          item.threadID
        );
        check.invite = item.inviteLink.enable;
        check.inviteLink = item.inviteLink.link;
        client.apis["database"].addThreadConfig(check);
      }
    }
    //loc user
    let allUser = await client.apis["database"].allUser();
    let map1 = new Map(allUser.map((user) => [user.userID, user]));
    for (let user of arr2) {
      if (!map1.has(user.userID)) {
        client.apis["database"].addUser(user);
      }
    }
    let map2 = new Map(arr2.map((user) => [user.userID, user]));
    for (let user of allUser) {
      if (!map2.has(user.userID)) {
        client.apis["database"].delUser(user.userID);
      }
    }
  });
}
