
exports.config = {
    name: "find",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Tìm người dùng bằng tên",
    tag: 'system',
    usage: "!find",
    countDown: 1000,
    role: 0,
  };
  module.exports.run = async function (api, event, args, client) {
    api.getUID(args.slice(1).join(" "), (err, data) => {
        if(err) return console.error(err);

        // Send the message to the best match (best by Facebook's criteria)
        console.log(data);
    });
  };
  