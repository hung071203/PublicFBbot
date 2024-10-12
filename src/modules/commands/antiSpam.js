module.exports.config = {
    name: "stop",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "Chan spam ",
    tag: 'system',
    usage: "!stop"
, countDown: 700, role: 3};
  
  
module.exports.run = async function (api, event, args, client) {
  if (process.env.ATS == 0) {
    process.env.ATS = 1;
    api.sendMessage('AntiSpam đang được kích hoạt', event.threadID);

  }else{
    process.env.ATS = 0;
    api.sendMessage('AntiSpam đã tắt', event.threadID);

  }
}