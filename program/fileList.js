const fs = require('fs');
const path = require('path');

const siteDomain = 'https://psgamespider.ravelloh.top/';
const targetPath = './public/';
const preserveFile = './public/urlList.txt';

function removeDuplicateBeginning(arr) {
    if (arr.length === 0) {
        return [];
    }

    const firstItem = arr[0];
    const prefix = firstItem.slice(0, firstItem.lastIndexOf('/') + 1);

    return arr.map((item) => item.replace(prefix, ''));
}

function readDirRecur(folder, callback) {
    fs.readdir(folder, function (err, files) {
        var count = 0;
        var checkEnd = function () {
            ++count == files.length && callback();
        };

        files.forEach(function (file) {
            var fullPath = folder + '/' + file;

            fs.stat(fullPath, function (err, stats) {
                if (stats.isDirectory()) {
                    return readDirRecur(fullPath, checkEnd);
                } else {
                    if (file[0] == '.') {
                    } else {
                        if (fullPath.indexOf('.html') !== -1) {
                            fileList.push(fullPath.replace('index.html', ''));
                        }
                    }
                    checkEnd();
                }
            });
        });
        files.length === 0 && callback();
    });
}

var fileList = [];
var dataStr = '';
var timeStart = new Date();
var filePath = path.resolve(targetPath);
readDirRecur(filePath, function (filePath) {
    console.log('done', new Date() - timeStart);
    removeDuplicateBeginning(fileList).forEach((e) => {
        dataStr += `${siteDomain}${e}\n`;
    });
    console.log(dataStr);
    fs.writeFile(preserveFile, dataStr, 'utf8', (err) => {});
});
