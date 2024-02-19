const Crawler = require('crawler');
const RLog = require('rlog-js');
const rlog = new RLog();
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const rootPath = 'https://store.playstation.com';
const langList = ['zh-hans-hk', 'en-us', 'ja-jp', 'de-de'];
let gameList = [];
let allGame;
let resultPage = 0;
async function starter() {
    rlog.log('Starting fetcing all informations...');
    rlog.log('Reading gameList.json...');
    gameList = getData('data/gameList.json');
    /*for (let i = 0; i < langList.length; i++) {
        resultPage = 0
        rlog.info(`Start fetching all games in ${langList[i]}`)
        await getList(langList[i])
    }
    exportGameList(gameList,'data/gameList.json')
    */
    rlog.success('Metedata successfully fetched.');
    rlog.info('Start downloading images...');
    let newResult = await downloadImages(gameList);
    updateJsonFile(newResult);
}
// 烤串转驼峰
function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, function (match, letter) {
        return letter.toUpperCase();
    });
}
// 强制导出
function exportGameList(gameList, filepath) {
    try {
        const jsonString = JSON.stringify(gameList, null, 2);
        fs.writeFileSync(filepath, jsonString, 'utf8');
        rlog.success(`Gamelist successfully exported to ${filepath}`);
    } catch (err) {
        rlog.error(`Export failed: ${err}`);
    }
}
// 合并文件
function updateJsonFile(obj, filePath) {
    let data = {};
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        data = JSON.parse(jsonData);
    } catch (error) {}
    Object.assign(data, obj);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
function getData(filepath) {
    if (fs.existsSync(filepath)) {
        rlog.info(`Start parsing file in ${filepath}...`);
        try {
            const jsonString = fs.readFileSync(filepath, 'utf8');
            return JSON.parse(jsonString);
        } catch (err) {
            rlog.exit(err);
        }
    }
}
async function getList(lang) {
    return new Promise((resolve) => {
        let allPage;
        let c = new Crawler({
            callback: function (error, res, done) {
                if (error) {
                    rlog.exit(error);
                } else {
                    let $ = res.$;

                    // 获取所有游戏列表
                    let imgList = $(
                        '#main > div > section > div > div > div > div.psw-l-w-3\\/4 > div.psw-l-w-1\\/1 > ul',
                    );
                    imgList.find('li').each(function (i, e) {
                        let path = $(this).find('a').attr('href');
                        let img = $(this).find('img').attr('src').split('?')[0];
                        let name = $(this)
                            .find(
                                'div > a > div > section > span.psw-t-body.psw-c-t-1.psw-t-truncate-2.psw-m-b-2',
                            )
                            .text();
                        gameList.push({
                            name: name,
                            img: img,
                            path: rootPath + path,
                            lang: lang,
                        });
                    });

                    // 获取总数
                    if (!allPage) {
                        allPage = $(
                            '#main > div > section > div > div > div > div.psw-l-w-3\\/4 > div.psw-l-w-1\\/1 > div > nav > ol > li:nth-child(5) > button',
                        ).text();

                        for (let i = 2; i <= allPage; i++) {
                            c.queue(`${rootPath}/${lang}/pages/browse/${i}`);
                        }
                    }

                    // 进度输出
                    resultPage++;
                    rlog.log('Fetching:', resultPage, '/', allPage);
                }
                done();
            },
        });

        c.queue(`${rootPath}/${lang}/pages/browse/1`);

        c.on('drain', () => {
            resolve();
        });
    });
}

const downloadImages = async (json) => {
    const imagesPath = path.join('origin', 'images');
    if (!fs.existsSync(imagesPath)) {
        fs.mkdirSync(imagesPath, {
            recursive: true,
        });
    }

    const downloadedImages = {};

    const newJson = [];
    for (let i = 0; i < json.length; i++) {
        const item = json[i];
        const imgUrl = item.img;
        const imgName = crypto.createHash('md5').update(imgUrl).digest('hex');
        const imgPath = path.join(imagesPath, `${imgName}.jpg`);

        if (downloadedImages[imgUrl]) {
            item.img = downloadedImages[imgUrl];
            newJson.push(item);
            continue;
        }

        let success = false;
        let retryCount = 0;
        while (!success && retryCount < 3) {
            try {
                rlog.info(`Fetching img for ${item['name']}...`);
                const response = await axios({
                    url: imgUrl,
                    method: 'GET',
                    responseType: 'stream',
                });

                const writer = fs.createWriteStream(imgPath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                downloadedImages[imgUrl] = path.join('images', `${imgName}.jpg`);
                item.img = downloadedImages[imgUrl];
                newJson.push(item);
                success = true;
            } catch (error) {
                retryCount++;
                rlog.warning(
                    `Error downloading image ${imgUrl}. Retrying in ${800 * retryCount}ms...`,
                );
                await new Promise((resolve) => setTimeout(resolve, 800 * retryCount));
            }
        }

        if (!success) {
            rlog.error(`Failed to download image ${imgUrl} after 3 retries.`);
        }
    }

    return newJson;
};

starter();
