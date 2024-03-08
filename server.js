const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const VAKITLER_JSON = require('./common/ezan_vakitler.json')


const getHtmlPath = (size) => {
    try {
        // console.log(['size', size])
        console.time("getHtmlPath")

        var curr_date = new Date();
        curr_date.setHours(curr_date.getHours() + 3);

        let curr_yy = curr_date.getUTCFullYear();
        let curr_mm = curr_date.getUTCMonth() + 1;
        let curr_dd = curr_date.getUTCDate();

        curr_mm = `${curr_mm}`.length == 1 ? `0${curr_mm}` : `${curr_mm}`
        curr_dd = `${curr_dd}`.length == 1 ? `0${curr_dd}` : `${curr_dd}`

        var date_str = `${curr_yy}-${curr_mm}-${curr_dd}`;
        // console.log(['date_str', date_str])
        var curr_vakit = VAKITLER_JSON.find((e) => {
            if (e.date == date_str) {
                return e;
            }
        });
        // console.log(['curr_vakit', curr_vakit])

        var curr_sahur_str = curr_vakit["sahur"];
        var curr_iftar_str = curr_vakit["iftar"];

        const sahur_str = `${date_str}T${curr_sahur_str}:00`;
        const sahur_date = new Date(sahur_str);

        const iftar_str = `${date_str}T${curr_iftar_str}:00`;
        const iftar_date = new Date(iftar_str);

        var isSahur = false;
        var isNextDaySahur = false;

        // console.log(['sahur_date', sahur_date.toString()])
        // console.log(['iftar_date', iftar_date.toString()])
        // console.log(['curr_date', curr_date.toString()])

        var fileName = "iftar.html";
        if (sahur_date.getTime() > curr_date.getTime()) {
            isSahur = true;
            fileName = "sahur.html"
        } else {
            if (iftar_date.getTime() > curr_date.getTime()) {
                isSahur = false;
                fileName = "iftar.html";
            } else {
                isNextDaySahur = true;
                isSahur = true;
                fileName = "sahur.html"
            }
        }
        // console.log(['isSahur', isSahur]);
        // console.log(['isNextDaySahur', isNextDaySahur]);
        // console.log(['fileName', fileName]);
        var pathName = `./view/${size}/${fileName}`;
        // console.log(['pathName', pathName])
        console.timeEnd("getHtmlPath");
        return pathName;
    } catch (error) {
        console.error(error);
        return "";
    }
}


const server = http.createServer(async (req, res) => {
    try {
        // Gelen URL'den sayfa ismini al
        const pageName = req.url.slice(1); // Başındaki '/' karakterini kaldır

        // Alınan sayfa ismini kullanarak dosya yolu oluştur
        var pathName = "";
        if (!`${pageName}`.includes('.png') && !`${pageName}`.includes('.json')) {
            pathName = getHtmlPath(pageName);

            var newDirname = __dirname;
            if (`${__dirname}`.includes('?')) {
                newDirname = `${__dirname}`.split('?')[0];
            }


            const filePath = path.join(newDirname, pathName);

            console.log(['filePath', filePath])

            // Dosya var mı kontrol et
            await fs.access(filePath, fs.constants.F_OK);

            // Dosya içeriğini oku
            const data = await fs.readFile(filePath, 'utf8');

            // Dosya içeriğini ekrana bas
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        } else if (`${pageName}`.includes('.png')) {
            pathName = pageName;
            const filePath = path.join(__dirname, pathName);

            // console.log(['imagePath', filePath])

            // Dosya var mı kontrol et
            await fs.access(filePath, fs.constants.F_OK);

            // Dosya içeriğini oku
            const data = await fs.readFile(filePath);

            // Dosya içeriğini ekrana bas
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(data);
        } else {
            pathName = pageName;
            const filePath = path.join(__dirname, pathName);

            // console.log(['jsonPath', filePath])

            // Dosya var mı kontrol et
            await fs.access(filePath, fs.constants.F_OK);

            // Dosya içeriğini oku
            const data = await fs.readFile(filePath);

            // Dosya içeriğini ekrana bas
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        }
    } catch (error) {
        console.error(error);
        // Hata durumunda 404 hatası gönder
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});