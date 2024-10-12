require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const gConfig = require('./gConfig.json');

const { readFileSync, writeFileSync, readdir, unlink } = require("fs");
// const login = require("facebook-chat-api");
const login = require("../Fca-Horizon-Remastered");


loginPath = { appState: JSON.parse(readFileSync(__dirname + "/appstate.json", "utf-8")) };
const dbPath = path.join(__dirname, 'savefile', 'database.db');

global.db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Lỗi kết nối với cơ sở dữ liệu SQLite:', err.message);
  } else {
    console.log('Đã kết nối với cơ sở dữ liệu SQLite.');
  }
});
var client = {
  config: process.env,
  commands: new Map(),
  events: new Map(),
  handleReply: new Array(),
  handleReaction: new Array(),
  unsend: new Array(),
  tempMail: new Array(),
  userCM: new Array(),
  coinMaster: new Array(),
  userLevel: new Array(),
  dataLevel: new Array(),
  getTime: function (ts) {
    return new Date(parseInt(ts)).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })
  },
  apis: {},
  mainPath: process.cwd()
}

global.gConfig = gConfig
global.timeRun = Date.now()

const handlers = ['handlerCommand', 'handlerEvent', 'loadApis'];

handlers.forEach(handler => {
  // code sử dụng biến handler
  require(`${__dirname}/core/${handler}`)(client);

});

//xoa cache
const directoryPath = path.join(__dirname, 'img');

// Các đuôi file cần xóa
const extensionsToDelete = ['.jpg', '.jpeg', '.png', '.gif', '.mp3', '.wav', '.mp4', '.avi', '.mkv'];

readdir(directoryPath, (err, files) => {
  if (err) {
    return console.log('Lỗi khi đọc thư mục:', err.message);
  }

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const fileExtension = path.extname(file).toLowerCase();

    // Kiểm tra nếu file có đuôi nằm trong danh sách cần xóa
    if (extensionsToDelete.includes(fileExtension)) {
      unlink(filePath, (err) => {
        if (err) {
          console.log(`Lỗi khi xóa file ${file}:`, err.message);
        } else {
          console.log(`Đã xóa file: ${file}`);
        }
      });
    }
  });
});

login(loginPath, async (error, api) => {

  if (error) {
    if (error.code === 'ECONNRESET') {
      console.error('Lỗi kết nối bị reset:', error);
      process.exit(1);
    } else {
      console.error(error);
    }

  }
  api.setOptions(global.gConfig.FCAOption);
  const appState = await api.getAppState()
  const appStateFilePath = path.join(__dirname, 'appstate.json');
  writeFileSync(appStateFilePath, JSON.stringify(appState, null, 2), 'utf8');
  console.log('\x1b[32m%s\x1b[0m', 'App state updated successfully!');
  require(`${__dirname}/core/listen`)(api, client);
});