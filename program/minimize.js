const fs = require('fs');
const sharp = require('sharp');
const RLog = require('rlog-js')
const rlog = new RLog()

const inputDir = 'public/images/';
const outputDir = 'public/mini/';

// 创建输出目录
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error('Failed to read directory', err);
        return;
    }

    files.forEach(file => {
        // 只处理图片文件
        if (file.match(/\.(jpg|jpeg|png)$/)) {
            const inputPath = inputDir + file;
            const outputPath = outputDir + file;

            sharp(inputPath)
                .resize(128, 128)
                .toFile(outputPath, (err, info) => {
                    if (err) {
                        console.error(`Failed to compress ${file}`, err);
                    } else {
                        console.log(`Compressed ${file} successfully`);
                    }
                });
        }
    });
});
