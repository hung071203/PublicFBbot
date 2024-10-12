const os = require("os");
const du = require("du");

module.exports.config = {
  name: "upt",
  version: "1.0.0",
  credits: "Hung dep zai",
  description: "Xem nền tảng bot đang chạy",
  usage: "!upt",
  countDown: 700,
  role: 3,
};

module.exports.run = async function (api, event, args, client) {
  utp(api, event, args, client);
};

module.exports.noprefix = async function (api, event, args, client) {
  utp(api, event, args, client);
};

async function utp(api, event, args, client) {
  const directoryPath = client.mainPath;

  const totalMemory = os.totalmem();
  let msgs = `-------------------------------------------------------\n[Thông tin thiết bị chạy bot:]\n-------------------------------------------------------\n`;
  const timeElapsed = Date.now() - global.timeRun;
  const hours = Math.floor((timeElapsed / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeElapsed / (1000 * 60)) % 60);
  const seconds = Math.floor((timeElapsed / 1000) % 60);
  const days = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));
  msgs += `⏱Tổng thời gian hoạt động: ${
    days > 0 ? `${days} ngày, ` : ""
  }${hours}:${minutes}:${seconds}\n`;
  const freeMemory = os.freemem();
  msgs += `💻Tên máy tính: ${os.hostname()}\n`;
  msgs += `⏸️Phiên bản hệ điều hành: ${os.version()}\n`;
  msgs += `©️Thông tin CPU: ${os.cpus()[0].model}, ${os.cpus().length} nhân\n`;
  msgs += `📱Nền tảng: ${os.platform()} ${os.arch()}\n`;
  msgs += `♈Dung lượng Ram còn trống: ${(
    freeMemory / Math.pow(1024, 3)
  ).toFixed(2)} GB\n`;
  msgs += `❄️Tổng dung lượng RAM: ${(totalMemory / Math.pow(1024, 3)).toFixed(
    2
  )} GB\n`;
  const memoryUsage = process.memoryUsage();
  msgs +=
    "🎢Tổng bộ nhớ RSS sử dụng: " +
    (memoryUsage.rss / 1024 / 1024).toFixed(2) +
    " MB\n";
  msgs +=
    "♨️Bộ nhớ heap đã sử dụng: " +
    (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + 
    "/" + (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + " MB\n";
  const totalUser = await client.apis["database"].allUser();
  msgs += `👤Tổng người dùng: ${totalUser.length}\n`;
  const totalThread = await client.apis["database"].allThreadConfig();
  msgs += `👥Tổng số nhóm: ${totalThread.length}\n`;

  du(directoryPath, (err, size) => {
    if (err) {
      console.error("Error calculating directory size:", err);
      return;
    }

    // Chuyển đổi kết quả từ byte sang các đơn vị khác như KB, MB, GB nếu cần
    const sizeInKB = size / 1024;
    const sizeInMB = sizeInKB / 1024;
    const sizeInGB = sizeInMB / 1024;
    const sizeT =
      sizeInGB >= 1
        ? sizeInGB.toFixed(2) + "GB"
        : sizeInMB >= 1
        ? sizeInMB.toFixed(2) + "MB"
        : sizeInKB.toFixed(2) + "KB";
    msgs += `🗂️Tổng dung lượng file: ${sizeT}\n`;
    msgs += `\n🪫Ping: ${Date.now() - event.timestamp}ms`;
    const formattedTime = client.getTime(Date.now());
    msgs += `\n-------------------------------------------------------\n[Dữ liệu cập nhật ${formattedTime}]\n-------------------------------------------------------\n`;
    return api.sendMessage(msgs, event.threadID, event.messageID);
  });
}
