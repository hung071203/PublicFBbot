const request = require('request');

module.exports.config = {
    name: 'rname',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: 'Đổi biệt danh Random ',
    tag: 'system',
    usage: '!rname [Người dùng(nếu cần)] '
  , countDown: 700, role: 3};
  
  module.exports.run = async function (api, event, args, client) {
    // Check if the thread exists before attempting to change the user nickname
    

    const countryCodes = [
        { code: "afk", full: "Afrikaans" },
        { code: "afr", full: "African" },
        { code: "aka", full: "Akan" },
        { code: "alb", full: "Albanian" },
        { code: "alg", full: "Algonquin" },
        { code: "ame", full: "Indigenous American" },
        { code: "amem", full: "New World Mythology" },
        { code: "amh", full: "Amharic" },
        { code: "anci", full: "Ancient" },
        { code: "apa", full: "Apache" },
        { code: "ara", full: "Arabic" },
        { code: "arm", full: "Armenian" },
        { code: "asm", full: "Assamese" },
        { code: "ast", full: "Asturian" },
        { code: "astr", full: "Astronomy" },
        { code: "aus", full: "Indigenous Australian" },
        { code: "ava", full: "Avar" },
        { code: "aym", full: "Aymara" },
        { code: "aze", full: "Azerbaijani" },
        { code: "bal", full: "Balinese" },
        { code: "bas", full: "Basque" },
        { code: "bel", full: "Belarusian" },
        { code: "ben", full: "Bengali" },
        { code: "ber", full: "Berber" },
        { code: "bhu", full: "Bhutanese" },
        { code: "bibl", full: "Biblical (All)" },
        { code: "bos", full: "Bosnian" },
        { code: "bre", full: "Breton" },
        { code: "bsh", full: "Bashkir" },
        { code: "bul", full: "Bulgarian" },
        { code: "bur", full: "Burmese" },
        { code: "cat", full: "Catalan" },
        { code: "cela", full: "Ancient Celtic" },
        { code: "celm", full: "Celtic Mythology" },
        { code: "cew", full: "Chewa" },
        { code: "cha", full: "Chamorro" },
        { code: "che", full: "Chechen" },
        { code: "chi", full: "Chinese" },
        { code: "chk", full: "Cherokee" },
        { code: "cht", full: "Choctaw" },
        { code: "chy", full: "Cheyenne" },
        { code: "cir", full: "Circassian" },
        { code: "cmr", full: "Comorian" },
        { code: "com", full: "Comanche" },
        { code: "cop", full: "Coptic" },
        { code: "cor", full: "Cornish" },
        { code: "cre", full: "Cree" },
        { code: "cro", full: "Croatian" },
        { code: "crs", full: "Corsican" },
        { code: "cze", full: "Czech" },
        { code: "dan", full: "Danish" },
        { code: "dgs", full: "Dagestani" },
        { code: "dhi", full: "Dhivehi" },
        { code: "dut", full: "Dutch" },
        { code: "egya", full: "Ancient Egyptian" },
        { code: "egym", full: "Egyptian Mythology" },
        { code: "eng", full: "English" },
        { code: "enga", full: "Anglo-Saxon" },
        { code: "esp", full: "Esperanto" },
        { code: "est", full: "Estonian" },
        { code: "eth", full: "Ethiopian" },
        { code: "ewe", full: "Ewe" },
        { code: "fae", full: "Faroese" },
        { code: "fairy", full: "Fairy" },
        { code: "fij", full: "Fijian" },
        { code: "fil", full: "Filipino" },
        { code: "fin", full: "Finnish" },
        { code: "fle", full: "Flemish" },
        { code: "fntsg", full: "Gluttakh" },
        { code: "fntsm", full: "Monstrall" },
        { code: "fntsr", full: "Romanto" },
        { code: "fntss", full: "Simitiq" },
        { code: "fntst", full: "Tsang" },
        { code: "fntsx", full: "Xalaxxi" },
        { code: "fre", full: "French" },
        { code: "fri", full: "Frisian" },
        { code: "ful", full: "Fula" },
        { code: "gaa", full: "Ga" },
        { code: "gal", full: "Galician" },
        { code: "gan", full: "Ganda" },
        { code: "geo", full: "Georgian" },
        { code: "ger", full: "German" },
        { code: "gmca", full: "Ancient Germanic" },
        { code: "goth", full: "Goth" },
        { code: "gre", full: "Greek" },
        { code: "grea", full: "Ancient Greek" },
        { code: "grem", full: "Greek Mythology" },
        { code: "grn", full: "Greenlandic" },
        { code: "gua", full: "Guarani" },
        { code: "guj", full: "Gujarati" },
        { code: "hau", full: "Hausa" },
        { code: "haw", full: "Hawaiian" },
        { code: "hb", full: "Hillbilly" },
        { code: "heb", full: "Hebrew" },
        { code: "hin", full: "Hindi" },
        { code: "hippy", full: "Hippy" },
        { code: "hist", full: "History" },
        { code: "hmo", full: "Hmong" },
        { code: "hun", full: "Hungarian" },
        { code: "ibi", full: "Ibibio" },
        { code: "ice", full: "Icelandic" },
        { code: "igb", full: "Igbo" },
        { code: "ind", full: "Indian" },
        { code: "indm", full: "Hindu Mythology" },
        { code: "ing", full: "Ingush" },
        { code: "ins", full: "Indonesian" },
        { code: "inu", full: "Inuit" },
        { code: "iri", full: "Irish" },
        { code: "iro", full: "Iroquois" },
        { code: "ita", full: "Italian" },
        { code: "jap", full: "Japanese" },
        { code: "jav", full: "Javanese" },
        { code: "jer", full: "Jèrriais" },
        { code: "jew", full: "Jewish" },
        { code: "kan", full: "Kannada" },
        { code: "kaz", full: "Kazakh" },
        { code: "khm", full: "Khmer" },
        { code: "kig", full: "Kiga" },
        { code: "kik", full: "Kikuyu" },
        { code: "kk", full: "Kreatyve" },
        { code: "kon", full: "Kongo" },
        { code: "kor", full: "Korean" },
        { code: "kur", full: "Kurdish" },
        { code: "kyr", full: "Kyrgyz" },
        { code: "lao", full: "Lao" },
        { code: "lat", full: "Latvian" },
        { code: "lim", full: "Limburgish" },
        { code: "lite", full: "Literature" },
        { code: "litk", full: "Arthurian Romance" },
        { code: "lth", full: "Lithuanian" },
        { code: "luh", full: "Luhya" },
        { code: "luo", full: "Luo" },
        { code: "mac", full: "Macedonian" },
        { code: "mag", full: "Maguindanao" },
        { code: "mal", full: "Maltese" },
        { code: "man", full: "Manx" },
        { code: "mao", full: "Maori" },
        { code: "map", full: "Mapuche" },
        { code: "vie", full: "Vietnamese" },
        { code: "may", full: "Mayan" },
        { code: "mbu", full: "Mbundu" },
        { code: "medi", full: "Medieval" },
        { code: "mlm", full: "Malayalam" },
        { code: "mly", full: "Malay" },
        { code: "moh", full: "Mohawk" },
        { code: "mon", full: "Mongolian" },
        { code: "morm", full: "Mormon" },
        { code: "yor", full: "Yoruba" },
        { code: "zap", full: "Zapotec" },
        { code: "zul", full: "Zulu" }
    ];

    const gender = [
        { code: "m", full: "Nam" },
        { code: "f", full: "Nữ" },
        { code: "mf", full: "Bê đê" }
    ];
    const rdC = Math.floor(Math.random() * 149);
    const rdG = Math.floor(Math.random() * 3);
    request(`https://www.behindthename.com/api/random.json?usage=${countryCodes[rdC].code}&gender=${gender[rdG].code}&key=mi451266190`, (err, response, body) => {
    if (err) {
        console.error(err);
        return;
    }

    const data = JSON.parse(body);
    console.log(data, `https://www.behindthename.com/api/random.json?usage=${countryCodes[rdC].code}&gender=${gender[rdG].code}&key=mi451266190`);
    if (Object.keys(event.mentions).length === 0) {
      api.changeNickname(`${data.names[0]} ${data.names[1]}`, event.threadID, event.senderID);
      
      api.sendMessage({
          body: `Tên đã đổi thuộc quốc gia ${formatFont(countryCodes[rdC].full)} và là tên dành cho ${formatFont(gender[rdG].full)} (～￣▽￣)～`,
          attachment: null,
          mentions: [],
          // Mã màu hồng
      }, event.threadID, event.messageID);
    }else if (Object.keys(event.mentions).length === 1) {
      
      const userID = Object.keys(event.mentions)[0];
      api.changeNickname(`${data.names[0]} ${data.names[1]}`, event.threadID, userID);
      
      api.sendMessage({
          body: `Tên đã đổi thuộc quốc gia ${formatFont(countryCodes[rdC].full)} và là tên dành cho ${formatFont(gender[rdG].full)} (～￣▽￣)～`,
          attachment: null,
          mentions: [],
          // Mã màu hồng
      }, event.threadID, event.messageID);
    }else{
      api.sendMessage('Cú pháp không hợp lệ, sử dụng !rname [Người dùng(nếu cần)] ',event.threadID, event.messageID);
    }
    
});
};
function formatFont(text) {
    const fontMapping = {
      a: "𝙖",
      á: "𝙖́",
      à: "𝙖̀",
      ả: "𝙖̉",
      ã: "𝙖̃",
      ạ: "𝙖̣",
      ă: "𝙖̆",
      ắ: "𝙖̆́",
      ằ: "𝙖̆̀",
      ẳ: "𝙖̆̉",
      ẵ: "𝙖̆̃",
      ặ: "𝙖̣̆",
      â: "𝙖̂",
      ấ: "𝙖̂́",
      ầ: "𝙖̂̀",
      ẩ: "𝙖̂̉",
      ẫ: "𝙖̂̃",
      ậ: "𝙖̣̂",
      b: "𝙗",
      c: "𝙘",
      d: "𝙙",
      đ: "đ",
      e: "𝙚",
      é: "𝙚́",
      è: "𝙚̀",
      ẻ: "𝙚̉",
      ẽ: "𝙚̃",
      ẹ: "𝙚̣",
      ê: "𝙚̂",
      ế: "𝙚̂́",
      ề: "𝙚̂̀",
      ể: "𝙚̂̉",
      ễ: "𝙚̂̃",
      ệ: "𝙚̣̂",
      f: "𝙛",
      g: "𝙜",
      h: "𝙝",
      i: "𝙞",
      í: "𝙞́",
      ì: "𝙞̀",
      ỉ: "𝙞̉",
      ĩ: "𝙞̃",
      ị: "𝙞̣",
      j: "𝙟",
      k: "𝙠",
      l: "𝙡",
      m: "𝙢",
      n: "𝙣",
      o: "𝙤",
      ó: "𝙤́",
      ò: "𝙤̀",
      ỏ: "𝙤̉",
      õ: "𝙤̃",
      ọ: "𝙤̣",
      ô: "𝙤̂",
      ố: "𝙤̂́",
      ồ: "𝙤̂̀ ",
      ổ: "𝙤̂̉",
      ỗ: "𝙤̂̃",
      ộ: "𝙤̣̂",
      ơ: "𝙤̛",
      ớ: "𝙤̛́",
      ờ: "𝙤̛̀",
      ở: "𝙤̛̉",
      ỡ: "𝙤̛̃",
      ợ: "𝙤̛̣",
      p: "𝙥",
      q: "𝙦",
      r: "𝙧",
      s: "𝙨",
      t: "𝙩",
      u: "𝙪",
      ú: "𝙪́",
      ù: "𝙪̀",
      ủ: "𝙪̉",
      ũ: "𝙪̃",
      ụ: "𝙪̣",
      ư: "𝙪̛",
      ứ: "𝙪̛́",
      ừ: "𝙪̛̀",
      ử: "𝙪̛̉",
      ữ: "𝙪̛̃",
      ự: "𝙪̛̣",
      v: "𝙫",
      w: "𝙬",
      x: "𝙭",
      y: "𝙮",
      ý: "𝙮́",
      ỳ: "𝙮̀",
      ỷ: "𝙮̉",
      ỹ: "𝙮̃",
      ỵ: "𝙮̣",
      z: "𝙯",
      A: "𝘼",
      Á: "𝘼́",
      À: "𝘼̀",
      Ả: "𝘼̉",
      Ã: "𝘼̃",
      Ạ: "𝘼̣",
      Ă: "𝘼̆",
      Ắ: "𝘼́̆",
      Ằ: "𝘼̀̆",
      Ẳ: "𝘼̉̆",
      Ẵ: "𝘼̃̆",
      Ặ: "𝘼̣̆",
      Â: "𝘼̂",
      Ấ: "𝘼́̂",
      Ầ: "𝘼̀̂",
      Ẩ: "𝘼̉̂",
      Ẫ: "𝘼̃̂",
      Ậ: "𝘼̣̂",
      B: "𝘽",
      C: "𝘾",
      D: "𝘿",
      Đ: "𝘿̛",
      E: "𝙀",
      É: "𝙀́",
      È: "𝙀̀",
      Ẻ: "𝙀̉",
      Ẽ: "𝙀̃",
      Ẹ: "𝙀̣",
      Ê: "𝙀̂",
      Ế: "𝙀́̂",
      Ề: "𝙀̀̂",
      Ể: "𝙀̉̂",
      Ễ: "𝙀̃̂",
      Ệ: "𝙀̣̂",
      F: "𝙁",
      G: "𝙂",
      H: "𝙃",
      I: "𝙄",
      Í: "𝙄́",
      Ì: "𝙄̀",
      Ỉ: "𝙄̉",
      Ĩ: "𝙄̃",
      Ị: "𝙄̣",
      J: "𝙅",
      K: "𝙆",
      L: "𝙇",
      M: "𝙈",
      N: "𝙉",
      O: "𝙊",
      Ó: "𝙊́",
      Ò: "𝙊̀",
      Ỏ: "𝙊̉",
      Õ: "𝙊̃",
      Ọ: "𝙊̣",
      Ô: "𝙊̂",
      Ố: "𝙊́̂",
      Ồ: "𝙊̀̂",
      Ổ: "𝙊̉̂",
      Ỗ: "𝙊̃̂",
      Ộ: "𝙊̣̂",
      Ơ: "𝙊̛",
      Ớ: "𝙊̛́",
      Ờ: "𝙊̛̀",
      Ở: "𝙊̛̉",
      Ỡ: "𝙊̛̃",
      Ợ: "𝙊̛̣",
      P: "𝙋",
      Q: "𝙌",
      R: "𝙍",
      S: "𝙎",
      T: "𝙏",
      U: "𝙐",
      Ụ: "𝙐̣",
      V: "𝙑",
      W: "𝙒",
      X: "𝙓",
      Y: "𝙔",
      Ý: "𝙔́",
      Ỳ: "𝙔̀",
      Ỷ: "𝙔̉",
      Ỹ: "𝙔̃",
      Ỵ: "𝙔̣",
      Z: "𝙕",
      0: "𝟎",
    1: "𝟏",
    2: "𝟐",
    3: "𝟑",
    4: "𝟒",
    5: "𝟓",
    6: "𝟔",
    7: "𝟕",
    8: "𝟖",
    9: "𝟗"
    };
  
    let formattedText = "";
    for (const char of text) {
      if (char in fontMapping) {
        formattedText += fontMapping[char];
      } else {
        formattedText += char;
      }
    }
    return formattedText;
  }