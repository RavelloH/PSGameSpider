// RPageSearch search.serverless
const gameList = require('../data/gameList')

let resultList = []
const collator = new Intl.Collator('zh-Hans-CN', {
    numeric: true,
});

function HTMLEncode(str) {
    var s = '';
    if (str.length == 0) return '';
    s = str.replace(/&/g, '&amp;');
    s = s.replace(/</g, '&lt;');
    s = s.replace(/>/g, '&gt;');
    s = s.replace(/ /g, '&nbsp;');
    s = s.replace(/\'/g, '&#39;');
    s = s.replace(/\"/g, '&quot;');
    s = s.replace(/\n/g, '<br/>');
    return s;
}

function HTMLDecode(str) {
    var s = '';
    if (str.length == 0) return '';
    s = str.replace(/&amp;/g, '&');
    s = s.replace(/&lt;/g, '<');
    s = s.replace(/&gt;/g, '>');
    s = s.replace(/&nbsp;/g, ' ');
    s = s.replace(/&#39;/g, "'");
    s = s.replace(/&quot;/g, '"');
    s = s.replace(/<br\/>/g, '\n');
    return s;
}

function fuzzySearch(list, keyWord, attribute) {
    const reg = new RegExp(keyWord, 'i');
    const arr = [];
    for (let i = 0; i < list.length; i++) {
        if (reg.test(list[i][attribute])) {
            arr.push(list[i]);
        }
    }
    return arr;
}

function fuzzyNestSearch(list, keyWord, attribute) {
    const reg = new RegExp(keyWord, 'i');
    const arr = [];
    for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < list[i][attribute].length; j++) {
            if (reg.test(list[i][attribute][j])) {
                arr.push(list[i]);
                break;
            }
        }
    }
    return arr;
}

function searchStr(str, target) {
    return str.split(target).length - 1;
}

function searchResultListChecker(objectT, value, attribute) {
    for (let i = 0; i < objectT.length; i++) {
        if (objectT[i][attribute] == value) {
            // console.log(value, i);
            return i;
        }
    }

    return false;
}

function findFirst(reg, str) {
    const match = reg.exec(str);
    return match ? match.index : -1;
}

function addToResultList(arr, attribute) {
    for (let i = 0; i < arr.length; i++) {
        let isHave = searchResultListChecker(resultList, arr[i].name, 'name');
        let element = arr[i];
        if (isHave === false || typeof element.match == 'undefined') {
            element.match = [];
            element.match.push(attribute);
            resultList.push(element);
        } else {
            resultList[isHave].match.push(attribute);
        }
    }
}

module.exports = (req,res) => {
    let { keyword } = req.query;
    let reg = new RegExp(keyword, 'ig');
    if (keyword == '' || keyword == '.') {
        return false;
    }
    resultList = [];

    // 重定义结果列表
    let name = [];
    let fullname = [];

    // 索引预处理
    name = fuzzySearch(gameList, keyword, 'name');
    fullname = fuzzySearch(gameList, keyword, 'fullname');

    // 构建标准输出
    addToResultList(name, 'name');
    addToResultList(fullname, 'fullname');

    // 结果表修饰
    resultList.forEach((e, index) => {
        e['matchTimes'] = 0;
        for (let i = 0; i < e['match'].length; i++) {
            switch (e['match'][i]) {
                case 'fullname':
                    e['fullname'] = e['fullname'].replace(reg, '<mark>$&</mark>');
                    let regResult = e['fullname'].match(reg);
                    e['match'][i] = ['fullname', regResult.length, findFirst(reg, e['fullname'])];
                    if (e['matchTimes'] !== 999999) {
                        e['matchTimes'] = regResult.length;
                    }
                    break;
                case 'name':
                    e['matchTimes'] = 999999;
                    e['name'] = e['name'].replace(reg, '<mark>$&</mark>');
                    break;
            }
        }
    });
    resultList = resultList.sort((a, b) => {
        return -collator.compare(a.matchTimes, b.matchTimes);
    });
    //  转义
    res.json(resultList);
    // console.timeEnd('search');
};
