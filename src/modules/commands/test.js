const fs = require("fs");
const path = require("path");
module.exports.config = {
  name: "test",
  version: "1.0.0",
  credits: "Hung dep zai",
  description: "Tài xỉu nhiều người chơi",
  tag: "game",
  usage:
    "!taixiu [join [t/x] [Mức tiền cược]: tham gia phòng /out: rời phòng /run: Bắt đầu ]",
  countDown: 700,
  role: 0,
};

module.exports.run = async function (api, event, args, client) {
  api.getAccessToken((err, data) => {
    if (err) return console.log(err);
    console.log(data);
  });

  console.log(client.getTime(parseInt(parseInt(event.timestamp))));
  
  // api.getThreadInfo(event.threadID, (err, info) => {
  //   if (err) return console.log(err);
  //   const filePathBT = path.join(__dirname, "..", "..", "abc.json");
  //   fs.writeFile(
  //     filePathBT + ".tmp",
  //     JSON.stringify(info, null, 2),
  //     { encoding: "utf8" },
  //     (err) => {
  //       if (err) {
  //         console.error("Lỗi khi lưu tien file:", err);
  //       } else {
  //         fs.rename(filePathBT + ".tmp", filePathBT, (err) => {
  //           if (err) {
  //             console.error("Lỗi khi đổi tên file:", err);
  //           }
  //         });
  //       }
  //     }
  //   );
  // });

  // api.getUserInfoV2('100001715653945', (err, data) => {
  //   if (err) return console.log(err);
  //   console.log(data);

  //   api.sendMessage(JSON.stringify(data, null, 2), event.threadID, event.messageID);
  // });

  // const moment = require("moment-timezone");

  // // Các hàm lấy timestamp theo múi giờ Việt Nam
  // function getStartOfDayVN() {
  //   return moment.tz("Asia/Ho_Chi_Minh").startOf("day").valueOf(); // Trả về timestamp
  // }

  // function getStartOfWeekVN() {
  //   return moment.tz("Asia/Ho_Chi_Minh").startOf("week").valueOf(); // Trả về timestamp
  // }

  // // Lấy giá trị timestamp
  // const startOfDay = getStartOfDayVN();
  // const startOfWeek = getStartOfWeekVN();

  // // Câu lệnh cập nhật tất cả các bản ghi trong bảng messages
  // const sql = `
  // UPDATE messages 
  // SET last_updated_day = ?, last_updated_week = ?`;

  // // Thực hiện cập nhật tất cả các bản ghi
  // global.db.run(sql, [startOfDay, startOfWeek], function (err) {
  //   if (err) {
  //     return console.error("Lỗi khi cập nhật dữ liệu:", err.message);
  //   }
  //   console.log(`Cập nhật thành công tất cả các bản ghi trong bảng messages.`);
  // });

  // global.db.serialize(() => {
  //   // Thêm cột joinNoti
  //   global.db.run('ALTER TABLE configs ADD COLUMN joinNoti TEXT');
  
  //   // Thêm cột outWAD
  //   global.db.run('ALTER TABLE configs ADD COLUMN outWAD TEXT');
  
  //   // Thêm cột outNAD
  //   global.db.run('ALTER TABLE configs ADD COLUMN outNAD TEXT');
  // });
};
module.exports.anyEvent = async function (api, event, client) {
  // console.log('anyEvent');
};

module.exports.onload = async function (api, client) {
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log('Memory usage:\n' + `RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB\nHeap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB\nHeap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB\nExternal: ${Math.round(memoryUsage.external / 1024 / 1024)} MB`);
}, 10000); // Kiểm tra mỗi 10 giây

}