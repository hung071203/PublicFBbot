const axios = require("axios");
const { wrapper } = require("axios-cookiejar-support");
const tough = require("tough-cookie");
const fs = require("fs-extra");
const cheerio = require("cheerio");
const qs = require("qs");
const { authenticator } = require("otplib");
const gConfig = require('./gConfig.json');

let cookieJar = new tough.CookieJar();

const defaultHeaders = {
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'accept-language': 'vi,en;q=0.9,en-GB;q=0.8,en-US;q=0.7',
  'sec-ch-ua': '""',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '""',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
  'origin': 'https://mbasic.facebook.com',
  'user-agent': gConfig.FCAOption.userAgent
};

async function saveTransformedCookies(cookies) {
  const transformedCookieFilePath = './src/appstate.json';
  await fs.writeFile(transformedCookieFilePath, JSON.stringify(cookies, null, 2));
  console.log('Cookies đã được lưu với định dạng mới.');
}
async function initializeClient() {
//   await loadCookiesFromFile();
  
  // return console.log("Cookies:", cookies);
  const client = wrapper(axios.create({ jar: cookieJar, headers: defaultHeaders }));

  try {
    let response = await client.get("https://mbasic.facebook.com/login.php");
    const $ = cheerio.load(response.data);
    const loginForm = $("#login_form");
    const action = loginForm.attr("action");
    let inputs = getFormInputs($, loginForm, ["lsd", "jazoest", "m_ts", "li", "try_number", "unrecognized_tries","email", "pass", "login", "bi_xrwh", "_fb_noscript"]);

    let formData = qs.stringify({
      ...inputs.reduce((acc, input) => {
        acc[input.name] = input.name === "email" ? gConfig.ACC :
                           input.name === "pass" ? gConfig.PASSWORD :
                           input.value;
        return acc;
      }, {})
    });

    console.log("Form data:", formData);

    let postResponse = await client.post(`https://mbasic.facebook.com${action}`, formData);
    
    if (postResponse.headers.location?.includes("m_lara_first_password_failure")) {
      return console.log("Mật khẩu sai");
    }

    console.log("POST Status:", postResponse.status);

    await handleLoginCheckpoint(client, postResponse);
    const cookies = transformCookies(cookieJar.getCookiesSync("https://mbasic.facebook.com"));
    await saveTransformedCookies(cookies);
    // await saveCookiesToFile();
  } catch (error) {
    console.error("Error:", error);
  }
}
function transformCookies(cookies) {
  return cookies.map(cookie => ({
    key: cookie.key,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path,
    hostOnly: cookie.hostOnly,
    creation: cookie.creation,
    lastAccessed: cookie.lastAccessed
  }));
}

async function handleLoginCheckpoint(client, postResponse) {
  let check = true;
  while (check) {
    const $ = cheerio.load(postResponse.data);
    const form = $('form[action="/login/checkpoint/"]');
    // console.log($.html());
    
    if (form.length === 0) {
      console.log("Không tìm thấy form với action /login/checkpoint/");
      check = false;
      return;
    }

    let inputs = getFormInputs($, form, [
      "fb_dtsg", "jazoest", "checkpoint_data", "approvals_code", "codes_submitted",
      "submit[Submit Code]", "nh", "name_action_selected", "submit[Continue]"
    ]);
    inputs.push({ name: "submit[This was me]", value: "Đây là tôi" });

    let formData = qs.stringify({
      ...inputs.reduce((acc, input) => {
        acc[input.name] = input.name === "approvals_code" ? authenticator.generate(gConfig.AUTH_CODE_SECRET.includes(" ") ? gConfig.AUTH_CODE_SECRET.replace(/ /g, "") : gConfig.AUTH_CODE_SECRET) :
                           input.name === "name_action_selected" ? "save_device" :
                           input.value;
        return acc;
      }, {})
    });

    console.log("Form data:", formData);
    postResponse = await client.post("https://mbasic.facebook.com/login/checkpoint/", formData);
  }
}

function getFormInputs($, form, relevantFields) {
  return form.find("input")
    .map((i, el) => {
      const name = $(el).attr("name");
      const value = $(el).attr("value");
      return relevantFields.includes(name) ? { name, value } : null;
    })
    .get()
    .filter(Boolean);
}

initializeClient();
