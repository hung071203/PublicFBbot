module.exports.config = {
    name: "toptuvi",
    version: "1.0.0",
    credits: "Hung dep zai",
    description: "",
    tag: 'TUTIEN',
    usage: "!toptuvi"
  , countDown: 700, role: 3};
  
  
module.exports.run = async function (api, event, args, client) {
    let findtuvi = client.userLevel.filter(item => item.threadID == event.threadID)
    let arrTuvi = []
    findtuvi.forEach(e => {
        let check = arrTuvi.find(item => item.tu == e.tu)
        if (!check) {
            arrTuvi.push({
                tu: e.tu,
                arr: [e]
            })
        }else{
            check.arr.push(e)
        }
    });
    arrTuvi.forEach(e => {
        e.arr.sort((a, b) => b.xp - a.xp)
    })
    msgs ='[Bản xếp hạng sức mạnh các thể tu hiện tại]\n--------------------------------------------------------\n'
    for (const e of arrTuvi) {
        msgs += `[${e.tu}]\n`;
      
        for (const [i, element] of e.arr.entries()) {
          let user = await client.apis['database'].getBank(event.threadID, element.ID);
          let getLV = client.dataLevel.level[element.level];
      
          if (!user) {
            msgs += `${i + 1}: ${element.ID} <${getLV.name}>\n`;
          } else {
            msgs += `${i + 1}: ${user.name} <${getLV.name}>\n`;
          }
        }
      
        msgs += '--------------------------------------------------------\n';
      }
    api.sendMessage(msgs, event.threadID, event.messageID)
}