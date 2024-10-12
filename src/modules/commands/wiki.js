module.exports.config = {
    name: "wiki",
    version: "1.0.0",
    credits: "Hung dep trai",
    description: "Tìm kiếm thông tin trên wikipedia",
    tag: 'Công cụ',
    usage: "!wiki [từ khóa]"
    , countDown: 700, role: 3
};


module.exports.run = async function (api, event, args, client) {
    const content = args.slice(1).join(" ");
    const baseUrl = "https://vi.wikipedia.org/w/api.php";
    const params = {
        action: "query",
        format: "json",
        prop: "extracts",
        exintro: true,
        explaintext: true,
        titles: content
    };

    // Tạo URL với tham số truy vấn
    const url = new URL(baseUrl);
    url.search = new URLSearchParams(params);
    url.searchParams.append('origin', '*');  // Thêm tham số origin để tránh lỗi CORS

    // Gửi yêu cầu fetch
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let msgs = `🔎Kết quả tìm kiếm:\n`
            // Truy cập vào nội dung bài viết
            const pages = data.query.pages;
            for (const pageId in pages) {
                if (pages.hasOwnProperty(pageId)) {
                    const page = pages[pageId];
                    msgs += `📩Title: ${page.title}\n📝Content: ${page.extract ? page.extract : 'Trống!'}\n\n`;
                }
            }

            api.sendMessage(msgs, event.threadID, event.messageID);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error)
            api.sendMessage(error.message, event.threadID, event.messageID);
        });
}