const Crawler = require('crawler');
const RLog = require('rlog-js');
const rlog = new RLog();
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const cheerio = require('cheerio');
const pLimit = require('p-limit');

const rootPath = 'https://store.playstation.com';
const langList = ['zh-hans-hk'];

let gameList = []; // 本次获取的游戏列表
let gameListOld = []; // 之前获取的游戏列表

// 启动函数
// 存储文件: data/metaData.json - 元数据
// 存储文件: data/priceHistory.json - 价格历史
// 存储文件: data/rateHistory - 评分列表
// 存储文件: data/info.json - 详细信息

async function starter() {
    rlog.log('Starting fetcing all informations...');
    rlog.log('Reading metadata.json...');

    // 读取文件
    let metaData, priceHistory, rateHistory, infoList;
    try {
        [metaData, priceHistory, rateHistory, infoList] = [
            'metaData',
            'priceHistory',
            'rateHistory',
            'info',
        ].map((file) => JSON.parse(fs.readFileSync(`data/${file}.json`, 'utf8')));
    } catch (err) {
        rlog.warning(err.message);
        rlog.warning('Failed to read files, reinitializing...');
        ['metaData', 'priceHistory', 'rateHistory', 'info'].forEach((file) =>
            fs.writeFileSync(
                `data/${file}.json`,
                JSON.stringify(file === 'metaData' ? [] : {}),
                'utf8',
            ),
        );
        starter();
        return;
    }

    // 重组数据
    metaData.forEach((item, index) => {
        item.priceHistory = priceHistory[item.name];
        item.rateHistory = rateHistory[item.name];
        item.info = infoList[item.name];
        gameListOld.push(item);
    });

    // 元数据获取
    for (let i = 0; i < langList.length; i++) {
        resultPage = 0;
        rlog.info(`Start fetching all games in ${langList[i]}`);
        await getList(langList[i]);
    }
    gameList = mergeObjects(gameListOld, gameList);
    rlog.success('Metedata successfully fetched.');

    // 封面下载
    rlog.info('Start downloading images...');
    let newResult = await downloadImages(gameList);
    gameList = mergeObjects(newResult, gameListOld);
    rlog.success('Successfully downloaded images');

    // 元数据扩充
    rlog.info('Start get more informations...');
    let gameListNew = await getInfo(gameList);
    gameList = mergeObjects(gameList, gameListNew);
    rlog.success('Successfully fetched informations');

    // 压缩
    rlog.log('Start compressing...');
    let gameListMini = [];
    gameListNew = gameList;
    gameListNew.forEach((item, index) => {
        gameListMini.push([]);
        gameListMini[index] = item;
        gameListMini[index].rateHistory = compressPriceHistory(item.rateHistory);
        gameListMini[index].priceHistory = compressPriceHistory(item.priceHistory);
    });
    rlog.success('Successfully compressed');

    // 导出
    exportGameList(gameListMini);
    rlog.success('All jobs finished');
}
function convertObjectToFile(obj, outputPath) {
    const dataString = `module.exports = ${JSON.stringify(obj, null, 2)};`;
    fs.writeFileSync(outputPath, dataString, 'utf8');
    rlog.success(`Object successfully converted and saved to ${outputPath}`);
}
// 烤串转驼峰
function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, function (match, letter) {
        return letter.toUpperCase();
    });
}
// 导出列表
function exportGameList(gameList, filepath = 'data') {
    try {
        const metaData = [];
        const priceHistory = {};
        const rateHistory = {};
        const infoList = {};

        gameList.forEach((item) => {
            const metaItem = {};
            for (const key in item) {
                if (key === 'priceHistory') {
                    priceHistory[item.name] = item.priceHistory;
                } else if (key === 'rateHistory') {
                    rateHistory[item.name] = item.rateHistory;
                } else if (key === 'info') {
                    infoList[item.name] = item.info;
                } else {
                    metaItem[kebabToCamel(key)] = item[key];
                }
            }
            metaData.push(metaItem);
        });

        const writeFile = (filename, data) => {
            fs.writeFileSync(`${filepath}/${filename}.json`, JSON.stringify(data, null, 2), 'utf8');
            rlog.success(`${filename}.json exported successfully`);
        };

        writeFile('metaData', metaData);
        writeFile('priceHistory', priceHistory);
        writeFile('rateHistory', rateHistory);
        writeFile('info', infoList);
    } catch (err) {
        rlog.error(`Export failed: ${err}`);
    }
}
function removeDuplicateDates(inputList) {
    const map = new Map();
    for (const [date, value] of inputList) {
        map.set(date, value);
    }
    const result = [];
    for (const [date, value] of map) {
        result.push([date, value]);
    }
    return result;
}

// 合并文件
function mergeObjects(oldObj, newObj) {
    let mergedObj = [...oldObj];
    for (let newItem of newObj) {
        let existingItemIndex = mergedObj.findIndex((item) => item.name === newItem.name);
        if (existingItemIndex !== -1) {
            mergedObj[existingItemIndex] = {
                ...mergedObj[existingItemIndex],
                ...newItem,
                img: mergedObj[existingItemIndex].img,
            };
        } else {
            mergedObj.push(newItem);
        }
    }
    return mergedObj;
}

async function getList(lang) {
    return new Promise((resolve) => {
        let allPage;
        let c = new Crawler({
            callback: (error, res, done) => {
                if (error) {
                    rlog.exit(error);
                } else {
                    try {
                        let $ = res.$;
                        let imgList = $('#main ul');
                        imgList.find('li').each((i, e) => {
                            let path = $(e).find('a').attr('href');
                            let img = $(e).find('img').attr('src').split('?')[0];
                            let name = $(e).find('span.psw-t-body').text();
                            gameList.push({ name, img, path: rootPath + path, lang });
                        });

                        if (!allPage) {
                            allPage = $('#main nav li:nth-child(5) > button').text();
                            for (let i = 2; i <= allPage; i++) {
                                c.queue(`${rootPath}/${lang}/pages/browse/${i}`);
                            }
                        }

                        resultPage++;
                        rlog.progress(resultPage, allPage);
                    } catch (e) {
                        rlog.error(e);
                    }
                }
                done();
            },
        });

        c.queue(`${rootPath}/${lang}/pages/browse/1`);

        c.on('drain', resolve);
    });
}

// 压缩
function compressPriceHistory(priceHistory) {
    if (!priceHistory) return [];
    let compressedPriceHistory = [];
    for (let i = 0; i < priceHistory.length; i++) {
        if (
            i === 0 ||
            priceHistory[i][1] !== priceHistory[i - 1][1]
        ) {
            compressedPriceHistory.push(priceHistory[i]);
        }
    }
    return compressedPriceHistory;
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

        if (imgUrl.startsWith('images/')) {
            newJson.push(item);
            continue;
        }

        let success = false;
        let retryCount = 0;
        while (!success && retryCount < 3) {
            try {
                rlog.info(
                    `${newJson.length + 1} / ${json.length} Fetching img for ${item['name']}...`,
                );
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
                gameList = mergeObjects(newJson, gameListOld);
                success = true;
            } catch (error) {
                retryCount++;
                rlog.warning(
                    `Error downloading image ${imgUrl}. Retrying in ${
                        800 * retryCount
                    }ms... Error:${error}`,
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

const limit = pLimit(10);

async function getInfo(gameList) {
    const promises = gameList.map((game, index) => limit(() => getInfoForGame(game, index)));
    await Promise.all(promises);
    return gameList;
}

async function getInfoForGame(game, index) {
    rlog.info(`${index + 1} / ${gameList.length} Fetching informations for ${game.name}`);
    let url = game.path;
    let infoJson = await getInfoJson(url);
    if (!infoJson) {
        return;
    }
    game.fullname = infoJson.name;
    game.category = infoJson.category;
    game.description = infoJson.description;
    game.price = infoJson.offers.price;
    game.priceCurrency = infoJson.offers.priceCurrency;
    game.priceHistory = !game.priceHistory
        ? [[getTodayDate(), game.price]]
        : game.priceHistory.concat([[getTodayDate(), game.price]]);
    game.publisher = infoJson.publisher;
    game.rate = infoJson.rate;
    game.info = infoJson.info;
    game.releaseTime = infoJson.releaseTime.split('/').reverse().join('/');
    game.platform = infoJson.platform;
    game.type = infoJson.type;
    game.rateHistory = !game.rateHistory
        ? [[getTodayDate(), game.rate]]
        : game.rateHistory.concat([[getTodayDate(), game.rate]]);
    game.rateHistory = removeDuplicateDates(game.rateHistory);
    game.priceHistory = removeDuplicateDates(game.priceHistory);
}

const getInfoJson = async (url, retryCount = 0) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        let infoJson = JSON.parse($('#mfe-jsonld-tags').text());
        infoJson.publisher = $('[data-qa="mfe-game-title#publisher"]').text();
        infoJson.rate = $('[data-qa="mfe-star-rating#overall-rating#average-rating"]').text();
        infoJson.info = $('[data-qa="mfe-game-overview#description"]')
            .html()
            .replaceAll('<br>', '\\n');
        infoJson.releaseTime = $(
            '[data-qa="gameInfo#releaseInformation#releaseDate-value"]',
        ).text();
        infoJson.platform = $('[data-qa="gameInfo#releaseInformation#platform-value"]').text();
        infoJson.type = $('[data-qa="gameInfo#releaseInformation#genre-value"] span')
            .map((_, span) => $(span).text())
            .get()
            .join(', ');
        return infoJson;
    } catch (error) {
        if (retryCount < 10) {
            rlog.warning(`Error getting info JSON from ${url}. Retrying in 1 second...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return getInfoJson(url, retryCount + 1);
        } else {
            rlog.error(`Failed to get info JSON from ${url} after 10 retries. Skipping...`);
            return null;
        }
    }
};

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
};

starter();