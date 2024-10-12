const QRCode = require("qrcode");
const { Image } = require("image-js");
const jsQR = require("jsqr");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "qr",
  version: "1.0.0",
  credits: "Hung dep trai",
  description: "Tạo qrcode hoặc giải mã qrcode",
  tag: "Công cụ",
  usage:
    "qr [văn bản/đường dẫn muốn tạo mã qr] hoặc rep lại hình ảnh qr muốn giải mã",
  countDown: 700,
  role: 3,
};

module.exports.run = async function (api, event, args, client) {
  const content = args.slice(1).join(" ");
  if (!content) {
    if (
      event.type != "message_reply" ||
      event.messageReply?.attachments?.length == 0 ||
      event.messageReply?.attachments[0]?.type != "photo"
    )
      return api.sendMessage(
        "Vui lòng đính kèm hình ảnh qr!",
        event.threadID,
        event.messageID
      );
    const attachment = event.messageReply.attachments[0].url;
    try {
      const name = Date.now() + ".png";
      await client.apis["others"].download(attachment, name);
      const paths = path.join(__dirname, "..", "..", "img", name);
      const img = fs.readFileSync(paths);
      Image.load(img).then(async (image) => {
        const imageData = {
          data: new Uint8ClampedArray(image.data),
          width: image.width,
          height: image.height,
        };
        const qrCode = jsQR(imageData.data, image.width, image.height);
        if (qrCode) {
          api.sendMessage(qrCode.data, event.threadID, event.messageID);
        } else {
          api.sendMessage(
            "Không phải qrcode!",
            event.threadID,
            event.messageID
          );
        }
      });
    } catch (error) {
      api.sendMessage(error.message, event.threadID, event.messageID);
    }
    return;
  }

  const paths = path.join(__dirname, "..", "..", "img", Date.now() + ".png");
  QRCode.toFile(paths, content, function (err) {
    if (err) {
      api.sendMessage("Lỗi: " + err.message, event.threadID, event.messageID);
    } else {
      api.sendMessage(
        {
          body: "Đã tạo qrcode thành công!",
          attachment: fs.createReadStream(paths),
        },
        event.threadID,
        event.messageID
      );
      setTimeout(() => {
        fs.unlinkSync(paths);
      }, 60000);
    }
  });
};
