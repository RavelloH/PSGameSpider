var helpfordemo = '<h4><a name="无法找到游戏" href="#无法找到游戏">#无法找到游戏</a></h4><p>输入游戏名时是否有自动补全候选？<br>输入框自带候选，所有能被索引到的游戏都在候选框中。若候选框中有需要查找的游戏，请直接点击将其输入并搜索。</p><p>搜索内容是否正确？<br>请检查输入的内容是否正确。输入的内容将回显在输出框中。</p><p>游戏名是否为其他语言？<br>目前程序中英双语（可在右侧自行选择使用英文）。</p><p>游戏是否在PlayStation中发布？<br>其他平台的爬虫正在制作中，请确认PlayStationStore中是否有要搜索的游戏</p><p>发布时间是否晚于此页面生成时间？(生成时间见右上)<br>此爬虫默认一天爬取三次，如需现在更新，请<a href="https://github.com/ravelloh/PSGameSpider" class="linkline">转到Github仓库</a>中，Star此仓库（在触发Workflows后，可将Star收回）</p>'
var aboutfordemo = '<h4><a name="关于" href="#关于">#关于</a></h4><p>项目名:PSGameSpider</p><p>作者:RavelloH</p><p>代码许可:MIT</p><p>源代码:<a href="https://github.com/ravelloh/PSGameSpider" class="linkline">转到Github仓库</a></p>'
document.getElementById('output').innerHTML = "终端正在等待数据输入...";
var innerimghead = '<figure class="hover-menu"><img src="img/';
var innerimgparta = '.jpg"/><div><a href="img/';
var innerimgpartaend = '.jpg">预览图片</a><a href="https://github.com/RavelloH/PSGameSpider/blob/main/img/'
var innerimgpartb = '.jpg">查看源</a><a href="https://store.playstation.com/zh-hans-hk/search/';
var innerimgpartc = '">转到Store</a></div></figure>';
function search() {
        var innerimgurl = document.getElementById("searchurl").value;
        if (totalgamelist.includes(innerimgurl)) {
                innerover = innerimghead + innerimgurl + innerimgparta + innerimgurl + innerimgpartaend + innerimgurl + innerimgpartb + innerimgurl + innerimgpartc;
                document.getElementById('windowa').innerHTML = innerover;
                document.getElementById('searchtitle').innerHTML = "- 搜索 " + innerimgurl + " -";
                document.getElementById('output').innerHTML = '查询成功(' + innerimgurl + ') 触摸左侧封面查看更多内容。<br>若无显示，请稍等以使图片加载。';
        } else {
                var timedata = new Date();
                var errora = '未找到相应数据(' + innerimgurl + ')。请确认:<br>1.输入游戏名时是否有自动补全？<br>2.搜索内容是否正确？<br>3.游戏名是否为其他语言？<br>4.游戏是否在PlayStation中发布？<br>5.发布时间是否晚于此页面生成时间？(生成时间见上)<br>点击下方功能栏查看帮助';
                var timenow = "[" + timedata.getHours() + ":" + timedata.getMinutes() + ":" + timedata.getSeconds() + "]";
                document.getElementById('output').innerHTML = timenow + errora;
        }
        function help() {
                alert("aaa");
        }
}
function post() {
        return false;
}

function quicksearch(name) {
        var innerimgurl = name;
        innerover = innerimghead + innerimgurl + innerimgparta + innerimgurl + innerimgpartaend + innerimgurl + innerimgpartb + innerimgurl + innerimgpartc;
        document.getElementById('windowa').innerHTML = innerover;
        document.getElementById('searchtitle').innerHTML = "- 搜索 " + innerimgurl + " -";
        document.getElementById('output').innerHTML = '查询成功(' + innerimgurl + ') 触摸左侧封面查看更多内容。<br>若无显示，请稍等以使图片加载。';
}

function drop() {
        document.getElementById("tip").classList.add('disappear');
        document.getElementById("circle").classList.add('disappear');
        setTimeout("1000")
        for (i = 0; i < 200; i++) {
                document.getElementsByClassName('drop-in')[i].classList.add('droped');
        }
}
setTimeout("drop()", "2000");
twikoo.init({
  envId: 'https://comment-ravelloh.vercel.app/', // 腾讯云环境填 envId；Vercel 环境填地址（https://xxx.vercel.app）
  el: '#tcomment',
})
