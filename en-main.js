var helpfordemo = '<h4><a name="Cannot find the game" href="#Cannot find the game">#Cannot find the game</a></h4><p>Whether there are auto-completion candidates when entering the game name ? <br>The input box comes with candidates, and all games that can be indexed are in the candidate box. If there is a game you want to find in the candidate box, please click to enter it and search. </p><p>Is the search correct? <br>Please check that your input is correct. What is entered will be echoed in the output box. </p><p>Is the game name in another language? <br>Currently the program only supports official Chinese translation (if there is no Chinese translation, English will be used automatically). </p><p>Is the game released on PlayStation? <br>Crawler for other platforms is under development, please confirm if there is a game to be searched in PlayStationStore</p><p>Is the release time later than the generation time of this page? (See the upper right for the generation time)<br>This crawler crawls once a day by default. If you want to update it now, please <a href="https://github.com/ravelloh/PSGameSpider" class="linkline">Go to the Github repository </a>, Star this warehouse (after triggering Workflows, Star can be recovered) </p>'
var aboutfordemo = '<h4><a name="About" href="#About">#About </p>'
var aboutfordemo = '<h4><a name="About" a></h4><p>Project Name:PSGameSpider</p><p>Author:RavelloH</p>'
var innerimghead = '<figure class="hover-menu"><img src="img/';
var innerimgparta = '.jpg"/><div><a href="img/';
var innerimgpartaend = '.jpg ">Preview image</a><a href="https://github.com/RavelloH/PSGameSpider/blob/main/img/'
var innerimgpartb = '.jpg">View source</a><a href= "https://store.playstation.com/zh-hans-cn/search/';
var innerimgpartc = '">Go to Store</a></div></figure>';
function search() {
        var innerimgurl = document.getElementById("searchurl").value;
        if (totalgamelist.includes(innerimgurl)) {
                innerover = innerimghead + innerimgurl + innerimgparta + innerimgurl + innerimgpartaend + innerimgurl + innerimgpartb + innerimgurl + innerimgpartc;
                document.getElementById('windowa').innerHTML = innerover;
                document.getElementById('output').innerHTML = 'The query succeeded(' + innerimgurl + ') Touch the left cover to see more content. <br>If nothing appears, please wait for the image to load. ';
        } else {
                var timedata = new Date();
                var errora = 'Data not found (' + innerimgurl + '). Please confirm:<br>1. Is there auto-completion when entering the game name? <br>2. Is the search content correct? <br>3. Is the game name in another language? <br>4. Is the game released in PlayStation? <br>5. Is the publication time later than the generation time of this page? (See above for generation time)<br>Click the function bar below to view help';
                var timenow = "[" + timedata.getHours() + ":" + timedata.getMinutes() + ":" + timedata.getSeconds() + "]";
                document.getElementById('output').innerHTML = timenow + errora;
        }
        function post() {
                return false;
        }
        function quicksearch(name) {
                var innerimgurl = name;
                innerover = innerimghead + innerimgurl + innerimgparta + innerimgurl + innerimgpartaend + innerimgurl + innerimgpartb + innerimgurl + innerimgpartc;
                document.getElementById('windowa').innerHTML = innerover;
                document.getElementById('searchtitle').innerHTML = "- search" + innerimgurl + " -";
                document.getElementById('output').innerHTML = 'Search success(' + innerimgurl + ') touch left cover See more. <br>If nothing appears, please wait for the image to load. ';
        }

        function drop() {
                document.getElementById("tip").classList.add('disappear');
                document.getElementsByClassName('drop-in')[i].classList.add('droped');
        }
}
setTimeout("drop()", "2000");
twikoo.init({
        envId: 'https:// comment-ravelloh.vercel.app/', // Fill in envId for Tencent cloud environment; fill in address for Vercel environment (https://xxx.vercel.app) 
        el: '#tcomment',
        lang: 'en-us'
})
