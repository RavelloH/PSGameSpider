const rbuild = require('render-build')
const RLog = require('rlog-js')
const rlog = new RLog()
const fs = require('fs-extra')
const ejs = require('ejs')

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


const langList = ['zh-hans-hk', 'en-us', 'ja-jp', 'de-de'];
const config = getData('./config.json')
const gameList = getData('./data/gameList.json')

const getRecentlyReleasedGames = (games, daysAgo = 60) => {
  const today = new Date();

  const recentGames = games.filter(game => {
    const releaseDate = new Date(game.releaseTime);
    const diffInMs = Math.abs(releaseDate - today);
    const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365);

    return diffInYears <= daysAgo / 365;
  });

  return recentGames;
};

const getRecentlyDiscountedGames = (games, daysAgo = 14) => {
  const today = new Date();

  const discountedGames = games.filter(game => {
    const priceHistory = game.priceHistory;
    const latestPrice = priceHistory[priceHistory.length - 1][1];
    const previousPrice = priceHistory[priceHistory.length - 2][1];

    if (latestPrice < previousPrice) {
      const discountDate = new Date(priceHistory[priceHistory.length - 1][0]);
      const diffInMs = Math.abs(discountDate - today);
      const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365);

      return diffInYears <= daysAgo / 365;
    }

    return false;
  });

  discountedGames.forEach(game => {
    const priceHistory = game.priceHistory;
    const latestPrice = priceHistory[priceHistory.length - 1][1];
    const previousPrice = priceHistory[priceHistory.length - 2][1];

    game.previousPrice = previousPrice;
  });
  return discountedGames;
}; 


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

let template

// 修改默认行为
rbuild.build = async function (rootPath) {
    // 预检查
    if (!(await this.init())) {
        return;
    }
    rlog.log('Start building...');
    let preTemplate = await rbuild.singleBuild('{{https://raw.githubusercontent.com/RavelloH/ravelloh.github.io/master/template/layout.html}}', 'template/')
    
    rlog.success('Fetched templates')

    // 资源内容导入
    rlog.log('Start copying resource files...');
    let fileList;
    try {
        fs.emptyDirSync(this.config.outputDirectory);
        fileList = this.traversePath(this.processPath(rootPath, this.config.originDirectory));
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
    // 首页构建
    let doc = fs.readFileSync('template/index.ejs', 'utf-8');
    let config = rbuild.config.page
    config.doc = doc
    config.title = '索引'
    config.keywords = 'playstation'
    config.description = 'PSGameSpider'
    config.pagetype = 'edge'
    config.url = rbuild.config.siteUrl
    config.pageJs = `<script>${fs.readFileSync('origin/index.js', 'utf-8')}</script>`
    config.prefetch = []
    config.randomList = getRandomItems(gameList)
    config.gameList = gameList
    config.recent = getRecentlyReleasedGames(gameList)
    config.discount = getRecentlyDiscountedGames(gameList)
    doc = ejs.render(preTemplate, config);
    doc = ejs.render(doc,config)
    // 保存文件
    rbuild.writeFile('public/index.html',doc);
    rlog.log('Successfully built index')
    
    
    return
    doc = fs.readFileSync('template/item.html', 'utf-8');
    
    
    // 遍历构建
    try {
        for (let i = 0; i < gameList.length; i++) {
            rlog.log(`Building ${gameList[i].name}...`);

            
            // 配置合并
            config = rbuild.config.page;
            config = rbuild.mergeObjects(config, gameList[i]);
            config.doc = doc;
            config.title = gameList[i].fullname
            config.keywords = gameList[i].keywords || '';
            config.description = gameList[i].description || '';
            config.pagetype = gameList[i].pagetype || 'edge';
            config.url = config.siteUrl + gameList[i].lang + '/' + gameList[i].name
            config.pageJs = gameList[i].pageJsPath
            ? `<script>${fs.readFileSync(
                rbuild.convertFilePath(gameList[i], gameList[i].pageJsPath),
            )}</script>`: rbuild.config.page.defaultScript;
            config.prefetch = gameList[i].prefetch || [];

            doc = ejs.render(preTemplate, config);

            // 保存文件
            rbuild.writeFile(
                rbuild.processPath(
                    rbuild.config.outputDirectory,
                    gameList[i].lang + gameList[i].name
                ),
                doc,
            );
        }
        rlog.success('Build completed.');
    } catch (e) {
        rlog.exit(e);
        return;
    }

    // 缓存导出
    cache.set('preTemplate', preTemplate);
}

rbuild.build('.')