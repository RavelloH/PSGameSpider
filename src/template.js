const rbuild = require('render-build')
const RLog = require('rlog-js')
const fs = require('fs-extra')

let template

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

const config = getData('./config.json')

async function getTemplate() {
    if (!template) {
        rbuild.setConfig(config)
        template = await rbuild.singleBuild('{{https://raw.githubusercontent.com/RavelloH/ravelloh.github.io/master/template/layout.html}}', 'template/')
    }
    return template
}

module.exports = getTemplate