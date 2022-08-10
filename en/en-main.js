var helpfordemo = '<h4><a name="Unable" href="#Unable">#Unable to find the required game</a></h4><p>Does auto completion appear when entering the file name?<br>The input box has its own candidate, and all games that can be indexed are in the candidate box. If there is a game to be found in the candidate box, please directly click to enter it and search.</p><p>Is the search content correct?<br>Please check whether the input is correct. The input is echoed in the output box.</p><p>Is the game name in another language?<br>The program supports both Chinese and English, and is currently in the English version. Please comment below if you need other languages.</p><p>Is the game released in Playstation?<br>Crawlers of other platforms are being made. Please confirm whether there are games to search in playstationstore.</p><p>Is the game released later than this page generation time? (see the top right for generation time) <br> this crawler crawls once a day by default. If you need to update now, please<a href="https://github.com/ravelloh/PSGameSpider" class="linkline">Go to GitHub</a>Star this repo（After triggering workflows, star can be retracted）</p>'
var aboutfordemo = '<h4><a name="about" href="#about">#About</a></h4><p>Project name:PSGameSpider</p><p>Author:RavelloH</p><p>LICENCE:MIT</p><p>OpenSourceRepo:<a href="https://github.com/ravelloh/PSGameSpider" class="linkline">Go to github</a></p>'
document.getElementById('output').innerHTML = "The terminal is waiting for data input...";
var innerimghead = '<figure class="hover-menu"><img src="../img-en/';
var innerimgparta = '.jpg"/><div><a href="../img-en/';
var innerimgpartaend = '.jpg">Preview pictures</a><a href="https://github.com/RavelloH/PSGameSpider/blob/main/img-en/'
var innerimgpartb = '.jpg">View source</a><a href="https://store.playstation.com/en-us/search/';
var innerimgpartc = '">Go to store</a></div></figure>';
function search() {
        var innerimgurl = document.getElementById("searchurl").value;
        if (totalgamelist.includes(innerimgurl)) {
                innerover = innerimghead + innerimgurl + innerimgparta + innerimgurl + innerimgpartaend + innerimgurl + innerimgpartb + innerimgurl + innerimgpartc;
                document.getElementById('windowa').innerHTML = innerover;
                document.getElementById('searchtitle').innerHTML = "- Search " + innerimgurl + " -";
                document.getElementById('output').innerHTML = 'Success(' + innerimgurl + ') Touch the left cover to see more. <br> If there is no display, please wait for the picture to load.';
        } else {
                var timedata = new Date();
                var errora = 'Fail(' + innerimgurl + ')。Please confirm:<br>1. Whether there is automatic completion when entering the game name？<br>2.Whether the search content is correct？<br>3.游戏名是否为其他语言？<br>4.Whether the game is released in Playstation？<br>5.Is the publishing time later than the generation time of this page? (see above for generation time)<br>Click the function bar below to view help';
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
        document.getElementById('searchtitle').innerHTML = "- Search " + innerimgurl + " -";
        document.getElementById('output').innerHTML = 'Success(' + innerimgurl + ') Touch the left cover to see more. <br> If there is no display, please wait for the picture to load.';
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
  envId: 'https://comment-ravelloh.vercel.app/',
  el: '#tcomment',
  lang: 'en-us',
})
