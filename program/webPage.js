const rbuild = require('render-build');
const RLog = require('rlog-js');
const rlog = new RLog();
const fs = require('fs-extra');
const ejs = require('ejs');

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

const langList = ['zh-hans-hk', 'ja-jp', 'en-us', "en-gb", "ko-kr"];
const config = getData('./config.json');
let gameList = [];
let isCopied = false;

const i18n = getData('i18n.json');

const getRecentlyReleasedGames = (games, daysAgo = 14) => {
    const today = new Date();
    const recentGames = games.filter((game) => {
        const releaseDate = new Date(game.releaseTime);
        const diffInMs = Math.abs(releaseDate - today);
        const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365);
        return diffInYears <= daysAgo / 365;
    });

    return recentGames;
};

const expandList = (list) => {
    if (list.length == 0) return [];
    const currentDateObj = new Date();
    const currentYear = currentDateObj.getFullYear();
    const currentMonth = currentDateObj.getMonth();
    const currentDay = currentDateObj.getDate();
    const formatDate = (year, month, day) => {
        const monthStr = month < 10 ? '0' + (month + 1) : month + 1;
        const dayStr = day < 10 ? '0' + day : day;
        return `${year}/${monthStr}/${dayStr}`;
    };
    const parseDate = (dateStr) => {
        const parts = dateStr.split('/');
        return new Date(parts[0], parts[1] - 1, parts[2]);
    };
    const findIndex = (dateStr) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i][0] === dateStr) {
                return i;
            }
        }
        return -1;
    };
    const expandedList = [];
    let lastValue = null;
    let lastIndex = -1;
    let minDate = new Date(list[0][0]);
    let maxDate = new Date(list[list.length - 1][0]);
    for (let item of list) {
        const date = new Date(item[0]);
        if (date < minDate) minDate = date;
        if (date > maxDate) maxDate = date;
    }
    for (
        let date = minDate;
        date <= new Date(currentYear, currentMonth, currentDay);
        date.setDate(date.getDate() + 1)
    ) {
        const dateString = formatDate(date.getFullYear(), date.getMonth(), date.getDate());
        const index = findIndex(dateString);
        if (index !== -1) {
            expandedList.push([dateString, list[index][1]]);
            lastIndex = index;
            lastValue = list[index][1];
        } else {
            if (lastIndex !== -1) {
                expandedList.push([dateString, lastValue]);
            }
        }
    }

    return expandedList;
};

const getRecentlyDiscountedGames = (games, daysAgo = 7) => {
    const today = new Date();

    const discountedGames = games.filter((game) => {
        let priceHistory = game.priceHistory;
        priceHistory = expandList(priceHistory);

        if (priceHistory.length < 2) {
            return false;
        }

        const latestPrice = priceHistory[priceHistory.length - 1][1];
        if (latestPrice === null) {
            return false;
        }

        let previousPrice = null;
        let foundDiscount = false;

        for (let i = priceHistory.length - 2; i >= 0; i--) {
            const price = priceHistory[i][1];
            const date = new Date(priceHistory[i][0]);

            const diffInMs = Math.abs(today - date);
            const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

            if (diffInDays <= daysAgo && price > latestPrice) {
                previousPrice = price;
                foundDiscount = true;
                break;
            }
        }

        if (foundDiscount) {
            game.previousPrice = previousPrice;
            return true;
        }

        return false;
    });

    return discountedGames;
};

function convertObjectToFile(obj, outputPath) {
    const dataString = `module.exports = ${JSON.stringify(obj, null, 2)};`;
    fs.writeFileSync(outputPath, dataString, 'utf8');
    rlog.success(`Object successfully converted and saved to ${outputPath}`);
}

function getRandomItems(inputList) {
    const randomItems = [];
    if (inputList.length <= 100) {
        return inputList;
    }
    while (randomItems.length < 100) {
        const randomIndex = Math.floor(Math.random() * inputList.length);
        randomItems.push(inputList[randomIndex]);
    }

    return randomItems;
}

async function starter() {
    for (let lang of langList) {
        gameList = [];
        // 读取文件
        let metaData, priceHistory, rateHistory, infoList;
        try {
            [metaData, priceHistory, rateHistory, infoList] = [
                'metaData',
                'priceHistory',
                'rateHistory',
                'info',
            ].map((file) => JSON.parse(fs.readFileSync(`data/${lang}-${file}.json`, 'utf8')));
        } catch (err) {
            rlog.exit(err.message);
        }

        // 重组数据
        metaData.forEach((item) => {
            item.priceHistory = priceHistory[item.name];
            item.rateHistory = rateHistory[item.name];
            item.info = infoList[item.name];
            gameList.push(item);
        });

        let template;

        // 修改默认行为
        rbuild.build = async function (rootPath) {
            // 预检查
            if (!(await this.init())) {
                return;
            }
            rlog.log('Start building...');

            if (!isCopied) {
                rlog.log('Start copying resource files...');
                let fileList;
                try {
                    fs.emptyDirSync(this.config.outputDirectory);
                    fileList = this.traversePath(
                        this.processPath(rootPath, this.config.originDirectory),
                    );
                    fileList = this.categorizeFiles(fileList);
                    fileList.otherFiles.forEach((filePath) => {
                        this.copyFiles(
                            filePath,
                            this.moveFilePath(
                                filePath,
                                this.config.originDirectory,
                                this.config.outputDirectory,
                            ),
                        );
                    });
                    rlog.success('File copying completed, start building...');
                } catch (e) {
                    rlog.exit(e);
                    return;
                }
                isCopied = true;
            }

            let preTemplate = await rbuild.singleBuild(
                fs.readFileSync('template/layout.html', 'utf-8'),
                'template/',
            );

            rlog.success('Fetched templates');

            // 创建函数
            convertObjectToFile(gameList, `data/${lang}-gameList.js`);

            // 首页构建
            let doc = fs.readFileSync('template/index.ejs', 'utf-8');
            let config = rbuild.config.page;
            config.doc = doc;
            config.title = i18n[lang].index;
            config.keywords = 'playstation';
            config.description =
                'PSGameSpider | 每日更新的PlayStation Store资讯站，支持查询评分记录/价格趋势等';
            config.pagetype = 'edge';
            config.url = "https://psgamespider.ravelloh.top/" + lang;
            config.pageJs = `<script>function main(){setTimeout(() => {virgule(document.querySelector('#page-dest'), '${i18n[lang].platform}')}, 400)}</script>`;
            config.prefetch = [];
            config.randomList = getRandomItems(gameList);
            config.gameList = gameList;
            config.recent = getRecentlyReleasedGames(gameList);
            config.discount = getRecentlyDiscountedGames(gameList);
            config.lang = lang;
            config.langList = langList;
            config.i18n = i18n[lang];
            doc = ejs.render(preTemplate, config);
            doc = ejs.render(doc, config);
            // 保存文件
            rbuild.writeFileSync(`public/${lang}/index.html`, doc);
            rlog.log('Successfully built index');

            let templateDoc = fs.readFileSync('template/item.ejs', 'utf-8');
            config = {};
            // 遍历构建
            try {
                for (let i = 0; i < gameList.length; i++) {
                    rlog.info(`Building ${gameList[i].name}...`);

                    // 配置合并
                    config = rbuild.config.page;
                    config = rbuild.mergeObjects(config, gameList[i]);
                    config.doc = templateDoc;
                    config.title = gameList[i].fullname;
                    config.keywords = gameList[i].keywords || '';
                    config.description = gameList[i].description || '';
                    config.pagetype = gameList[i].pagetype || 'edge';
                    config.url = config.siteUrl + gameList[i].lang + '/' + gameList[i].path.split("/").pop();
                    config.game = gameList[i];
                    config.game.info = gameList[i].info ? gameList[i].info.replaceAll('\\n', '<br>') : '';
                    config.pageJs = `<script>function main() {}</script>`;
                    config.prefetch = [];
                    config.lang = lang;
                    config.i18n = i18n[lang];

                    doc = ejs.render(preTemplate, config);
                    doc = ejs.render(doc, config);

                    // 保存文件
                    await rbuild.writeFileSync(
                        rbuild.processPath(
                            rbuild.config.outputDirectory,
                            lang + '/' + gameList[i].path.split('/').pop() + '/index.html',
                        ),
                        doc,
                    );
                }
                rlog.success(`Build ${lang} completed.`);
            } catch (e) {
                rlog.exit(e);
                return;
            }
        };

        await rbuild.build('.');
    }
}

starter();
