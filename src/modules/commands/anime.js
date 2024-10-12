const axios = require("axios");

module.exports.config = {
  name: "anime",
  version: "1.0.0",
  credits: "Hung dep trai",
  description: "Ramdom hình anime",
  tag: "Công cụ",
  usage: "anime",
  countDown: 700,
  role: 3,
};

module.exports.run = async function (api, event, args, client) {
  const path = await processData(client);
  api.sendMessage(path, event.threadID, event.messageID);
};

module.exports.noprefix = async function (api, event, args, client) {
  if (args.length > 1) return;
  const path = await processData(client);
  api.sendMessage(path, event.threadID, event.messageID);
};

async function processData(client) {
  try {
    const { data } = await axios.get(
      "https://api.waifu.im/search"
    );
    const attachment = data.images[0].url;
    const path = await client.apis["others"].download(attachment);
    return {attachment: path.readStream, body: data.images[0].artist?.name ? data.images[0].artist.name : "Random anime"};
  } catch (error) {
    return {body: error.message};
  }
}
