const {readdirSync} = require("fs");
const path = require('path');

module.exports = (client) => {
    const apisPath = path.join(__dirname, '..', '..','apis');
    const apiFile = readdirSync(apisPath).filter(File => File.endsWith('.js'));
    var apiCount = 0

    for (const File of apiFile) {
        try{
            const apiName = path.basename(File, '.js')
            delete require.cache[require.resolve(path.join(apisPath, File))];
            client.apis[apiName] = require(path.join(apisPath, File));
            apiCount++
        } catch (error) {
            console.error(`Lỗi khi nạp API từ file ${File}:`, error);
        }
        
    }
    console.log('Đã load thành công '+ apiCount + ' file api.')
}