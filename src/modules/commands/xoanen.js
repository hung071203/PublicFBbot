module.exports.config = {
  name: "xoanen",
  version: "1.0.0",
  credits: "Hung dep trai",
  description: "Xóa nền hình ảnh",
  tag: "AI",
  usage: "xoanen [Rep ảnh muốn xóa nền]",
  countDown: 700,
  role: 3,
};

module.exports.run = async function (api, event, args, client) {
  if (event.type != "message_reply")
    return api.sendMessage(
      "Vui lòng reply tin nhắn",
      event.threadID,
      event.messageID
    );
  let urls = [];
  event.messageReply.attachments.forEach((item) => {
    if (item.type == "photo") urls.push(item.url);
  });
  if (urls.length == 0)
    return api.sendMessage(
      "vui lòng reply hình ảnh",
      event.threadID,
      event.messageID
    );
  let msgs = "Ảnh của bạn:\n";
  api.setMessageReaction("⏳", event.messageID, () => {}, true);
  const promise = urls.map(async (url, i) => {
    try {
      const upscale = await client.apis["apiWeb"].xoanen(url);
      if (!upscale.data.success) return "Xóa nền thất bại ảnh " + (i + 1);
      const data = await client.apis["others"].base64ToFile(upscale.data.data)
      return data.readStream;
    } catch (error) {
      return error.message;
    }
  });
  const results = await Promise.all(promise);
  let attachments = [];
  results.forEach((result) => {
      if(result.type == "string") {
        msgs += result + "\n";
      }else {
        arguments.push(result);
      }
  })
  const data = {
    body: msgs,
    attachments
  };
  api.setMessageReaction("✅", event.messageID, () => {}, true);
  api.sendMessage(data, event.threadID, event.messageID);
};
