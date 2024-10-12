
const axios = require('axios');
const FormData = require('form-data');

module.exports.config = {
    name: 'phatnguoi',
    version: '1.0.0',
    credits: 'Hung dep zai',
    description: ' Kiểm tra phạt nguội',
    tag: 'Công cụ',
    usage: '!phatnguoi (biển số xe) (1: ô tô, 2: xe máy, 3: Xe máy điện)'
    , countDown: 700, role: 3
};

module.exports.run = async function (api, event, args, client) {
    if (args.length != 3) return api.sendMessage('TIn nhắn sai cú pháp', event.threadID, event.messageID);
    async function check() {
        try {
            const { connect } = await import('puppeteer-real-browser');

            const response = await connect({
                headless: 'auto',
                fingerprint: true,
                turnstile: true,
            });

            const { browser, page } = response;

            // Bắt đầu tải trang và thiết lập một giới hạn thời gian 5 giây
            await Promise.race([
                page.goto('https://phatnguoi.com/', { waitUntil: 'domcontentloaded' }),
                new Promise(resolve => setTimeout(resolve, 5000)) // Chờ 5 giây
            ]);

            // Lấy nội dung HTML của trang sau 5 giây, bất kể trạng thái tải trang
            let responseValue = await page.evaluate(() => {
                const inputElement = document.querySelector('input[name="cf-turnstile-response"]');
                return inputElement ? inputElement.value : null;
            });

            console.log('Initial cf-turnstile-response value:', responseValue);

            // Nếu không có giá trị, đợi thêm 2 giây rồi kiểm tra lại
            if (!responseValue) {
                console.log('Không tìm thấy giá trị, đợi thêm 2 giây...');
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Kiểm tra lại sau khi đợi 2 giây
                responseValue = await page.evaluate(() => {
                    const inputElement = document.querySelector('input[name="cf-turnstile-response"]');
                    return inputElement ? inputElement.value : null;
                });

                console.log('Final cf-turnstile-response value:', responseValue);
            }

            await browser.close();
            return responseValue;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }


    };
    let a = await check();
    if (!a) return api.sendMessage('Không nhận được phản hồi, vui lòng thử lại sau', event.threadID, event.messageID);

    try {
        // Dữ liệu cần gửi
        const form = new FormData();
        form.append('type', '1');
        form.append('retry', '');
        form.append('loaixe', args[2]);
        form.append('bsx', args[1]);
        form.append('bsxdangkiem', '');
        form.append('bien', 'T');
        form.append('tem', '');
        form.append('cf-turnstile-response', a);



        // Gửi yêu cầu POST với axios
        const response = await axios.post('https://phatnguoi.com/action.php', form);

        const data = response.data;
        if (data.error) return api.sendMessage(data.error, event.threadID, event.messageID);
        let msgs = `Kiểm tra phạt nguội:\nBiển số xe: ${data.biensoxe}\n`
        msgs += `Tổng số vi phạm: ${data.totalViolations}\n`
        msgs += `Cập nhật lần cuối: ${data.updated_at}\n\n`
        if (data.violations.length > 0) {
            data.violations.forEach((item, index) => {
                msgs += `Lỗi ${parseInt(index) + 1}: ${item.trang_thai}\n`
                msgs += `Màu biển: ${item.mau_bien}\n`
                msgs += `Loại phương tiện: ${item.loai_phuong_tien}\n`
                msgs += `Thời gian vi phạm: ${item.thoi_gian_vi_pham}\n`
                msgs += `Địa điểm: ${item.dia_diem_vi_pham}\n`
                msgs += `Hành vi: ${item.hanh_vi_vi_pham}\n`
                msgs += `Đơn vị phát hiện vi phạm: ${item.don_vi_phat_hien_vi_pham}\n`
                msgs += `Nơi giải quyết vụ việc: ${item.noi_giai_quyet_vu_viec}\n`
                msgs += `Số điện thoại: ${item.so_dien_thoai}\n`
                msgs += `Mức phạt: ${item.muc_phat}\n\n`
            })
        }

        return api.sendMessage(msgs, event.threadID, event.messageID);
    } catch (error) {
        console.error('Error sending POST request:', error.message);
        api.sendMessage(error.message, event.threadID, event.messageID);
    }
}