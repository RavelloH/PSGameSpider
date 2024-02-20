const Crawler = require('crawler');
const RLog = require('rlog-js');
const rlog = new RLog();
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const cheerio = require('cheerio')

const rootPath = 'https://store.playstation.com';
const langList = ['zh-hans-hk', 'en-us', 'ja-jp', 'de-de'];
let gameList = [];
let gameListOld = [];
let allGame;
let resultPage = 0;
async function starter() {
    rlog.log('Starting fetcing all informations...');
    rlog.log('Reading gameList.json...');
    gameListOld = getData('data/gameList.json');
    // 元数据获取
    for (let i = 0; i < langList.length; i++) {
        resultPage = 0
        rlog.info(`Start fetching all games in ${langList[i]}`)
        await getList(langList[i])
    }
    exportGameList(mergeObjects(gameListOld, gameList), 'data/gameList.json')
    gameList = getData('data/gameList.json');
    rlog.success('Metedata successfully fetched.');
    rlog.info('Start downloading images...');
    // 封面下载
    let newResult = await downloadImages(gameList);
    gameListOld = getData('data/gameList.json');
    exportGameList(mergeObjects(newResult, gameListOld), 'data/gameList.json')
    rlog.success('Successfully downloaded images')
    rlog.info('Start get more informations...')
    // 元数据扩充
    gameList = getData('data/gameList.json');

    let gameListNew = await getInfo(gameList)
    exportGameList(mergeObjects(gameList, gameListNew), 'data/gameList.json')
    rlog.success('All jobs finished')
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
    } catch (err) {
        rlog.error(`Export failed: ${err}`);
    }
}
// 合并文件
function mergeObjects(old, newObject) {
    const merged = {};

    old.forEach(oldItem => {
        const newItem = newObject.find(item => item.name === oldItem.name);

        if (newItem) {
            const mergedItem = {
                ...oldItem
            };
            mergedItem.img = oldItem.img; // Keep the img property from oldItem

            Object.keys(newItem).forEach(key => {
                if (key !== 'img') {
                    mergedItem[key] = newItem[key];
                }
            });

            merged[oldItem.name] = mergedItem;
        } else {
            merged[oldItem.name] = oldItem;
        }
    });

    newObject.forEach(newItem => {
        if (!old.find(item => item.name === newItem.name)) {
            merged[newItem.name] = newItem;
        }
    });

    return Object.values(merged);
}
function getData(filepath) {
    if (fs.existsSync(filepath)) {
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

        c.on('drain',
            () => {
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
        const imgUrl = item.img;;
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
                rlog.info(`${newJson.length+1} / ${json.length} Fetching img for ${item['name']}...`);
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
                exportGameList(mergeObjects(newJson, gameListOld), 'data/gameList.json')
                success = true;
            } catch (error) {
                retryCount++;
                rlog.warning(
                    `Error downloading image ${imgUrl}. Retrying in ${800 * retryCount}ms... Error:${error}`,
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

async function getInfo(gameList) {
    for (let i= 0; i< gameList.length; i++) {
        rlog.log(`${i+1} / ${gameList.length} Fetching informations for ${gameList[i].name}`)
        let url = gameList[i].path
        let infoJson = await getInfoJson(url)
        gameList[i].fullname = infoJson.name;
        gameList[i].category = infoJson.category;
        gameList[i].description = infoJson.description;
        gameList[i].price = infoJson.offers.price
        gameList[i].priceCurrency = infoJson.offers.priceCurrency
        gameList[i].priceHistory = !gameList[i].priceHistory ? [[getTodayDate(),gameList[i].price]] : gameList[i].priceHistory.concat([getTodayDate(),gameList[i].price])
    }
    return gameList
}

const getInfoJson = async (url, retryCount = 0) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    return JSON.parse($('#mfe-jsonld-tags').text());
  } catch (error) {
    if (retryCount < 30) {
      rlog.warning(`Error getting info JSON from ${url}. Retrying in 1 second...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getInfoJson(url, retryCount + 1);
    } else {
      rlog.error(`Failed to get info JSON from ${url} after 3 retries. Skipping...`);
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
