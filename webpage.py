import urllib3
import html
import re
from urllib.request import urlopen
from bs4 import BeautifulSoup as bs
import os
import time

f = open("index.html", 'w+')
def partone(f):
    txt = ''' 
<!DOCTYPE html>
<html lang="zh">

    <head>
        <meta charset="UTF-8">
        <title>PSGameSpider | RavelloH’s Blog</title>
        <meta name="keywords"
              content="RavelloH,blog,">
        <meta name="description"
              content="A Blog by RavelloH">

        <!-- CSS -->
        <link type="text/css"
              rel="stylesheet"
              href="https://ravelloh.github.io/css/common.css">
        <link type="text/css"
              rel="stylesheet"
              href="https://ravelloh.github.io/css/style.css">
        <link type="text/css"
              rel="stylesheet"
              href="https://ravelloh.github.io/css/iconfont.css">
        <style type="text/css">
            button {border: 1px solid #0099CC;
                        background-color:#1e1e1e;
                        color:#c6c9ce;
                        border-radius: 3px;
                        margin-top:1px;
                        padding: 5px 20%;
                        width:100%;
                        height:40px;
                        text-align: center; 
                        display: inline-block; 
                        font-size: 16px; 
                        -webkit-transition-duration: 0.4s; 
                        /* Safari */ transition-duration: 0.4s; 
                        cursor: pointer; 
                        text-decoration: none; 
                        text-transform: uppercase; } 
                button{border: 1px solid #008CBA; background-color:#1e1e1e:} /* 悬停样式 */ 
                button:hover { background-color: #008CBA; color:#c6c9ce;}
                input{
                background-color:#1e1e1e;
                color:#c6c9ce;
                border: 1px solid #ccc; 
                border-radius: 3px;
                padding: 0px 10% 0px 10%;
                width:100%;
                height:40px;
                font-size: 16px;
                font-weight: 700;
                }
                input:focus{
                border-color: #66afe9;
                outline: 0;
                -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);
                box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6)
                }
                .output{
                border: 1px solid #808080;
                background-color:#1e1e1e;
                color:#808080;
                border-radius: 3px;
                margin-top:1px;
                padding: 10px 1px 1px 10px;
                width:100%;
                height:15%;
                overflow:auto;
                }
                .output * {
                color:#808080
                }
                .hover-menu {
              position: relative;
              overflow: hidden;
              min-width: 80%;
              max-width: 100%;
              max-height: 100%;
              width: 100%;
              background: #000;
              text-align: center;
              box-sizing: border-box;
            }
            
            .hover-menu * {
              box-sizing: border-box;
            }
            
            .hover-menu img {
              position: relative;
              max-width: 100%;
              top: 0;
              right: 0;
              opacity: 1;
              transition: 0.3s ease-in-out;
              object-fit: cover;
            }
            
            .hover-menu div {
              position: absolute;
              top: 0;
              left: -120px;
              width: 120px;
              height: 100%;
              padding: 8px 4px;
              background: #000;
              transition: 0.3s ease-in-out;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            
            .hover-menu div a {
              display: block;
              line-height: 2;
              color: #fff;
              text-decoration: none;
              opacity: 0.8;
              padding: 5px 15px;
              position: relative;
              transition: 0.3s ease-in-out;
            }
            
            .hover-menu div a:hover {
              text-decoration: underline;
            }
            
            .hover-menu:hover img {
              opacity: 0.5;
              right: -120px;
            }
            
            .hover-menu:hover div {
              left: 0;
              opacity: 1;
            }
            .text {
             position: relative;
              width: 45%;
              height: 80%;
              overflow: auto;
            }
            .card {
              width: 10vw;
              height: 10vw;
              padding: 0;
              box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1);
              border-radius: 4px;
              box-sizing: border-box;
              overflow: hidden;
              display:inline-block;
            }
            
            .card * {
              transition: 0.3s ease all;
            }
            
            .card img {
              margin: 0;
              width: 10vw;
              height: 8vw;
              object-fit: cover;
              display: block;
            }
            
            .card .focus-content {
              display: block;
              padding: 6px 2px;
            }
            
            .card p {
              margin: 0;
              line-height: 1;
            }
            .card a {
            margin-top:5px;
            }
            .card:hover a, .card:focus-within a {
            margin-top:0;
            padding:2px 2px 0;
            }
            .card:hover img, .card:focus-within img {
              margin-top: -20px;
            }
            
            .card:hover p, .card:focus-within p {
              padding: 2px 3px 0;
            }
            .card p,.typing {
                white-space: nowrap;
                width: fit-content;
            }
            .card:hover p {
                animation: 5s wordsLoop linear infinite;
            }
            @keyframes wordsLoop {
                0%,100% {
                    transform: translateX(0px);
                }
                10%,90% {
                    transform: translateX(0px);
                }
                40%,60% {
                    transform: translateX(calc(-100% + 10vw));
                }
            }
            #circle{
                margin: 20px auto;
                width: 50px;
                height: 50px;
                border: 10px #1e1e1e solid;
                border-left-color: #c6c9ce;
                border-right-color:#c6c9ce;
                border-radius: 100%;
                animation: loading1 1s infinite linear;
                transition-property: opacity, transform;
            }
            @keyframes loading1{
                from{transform: rotate(0deg)}to{transform: rotate(360deg)}
            }
            
            .drop-in {
              opacity: 0;
              display:none;
              transition-property: opacity, transform, display;
              transition-duration: 0.3s;
              transition-timing-function: cubic-bezier(0.750, -0.015, 0.565, 1.055);
              display:inline-block;
            }
            
            .droped{
              transition-delay: calc((0.055s * var(--i)));
              opacity: 1;
              display:inline-block;
            }
            .disappear{
            display:none;
            transition-duration: 0.3s;
            }
        </style>

        <!-- JavaScript -->
        <script type="text/javascript"
                src="https://ravelloh.github.io/js/loading.js"></script>
        <script type="text/javascript"
                src="https://ravelloh.github.io/js/common.js"></script>

    </head>

    <body>

        <body>

            <section class="showcase">
                <header>
                    <h2 class="logo">
                        <a href="/">
                            <img class="logoimg"
                                 src="https://ravelloh.github.io/img/avatar.jpg"
                                 style="width: 1.5em;border-radius: 50%;"
                                 alt="avatar">
                            <img class="logoimg"
                                 src="https://ravelloh.github.io/img/RavelloH.svg"
                                 alt="RavelloH's Blog">
                        </a>

                    </h2>
                    <div class="headers">
                        <nav>
                            <a href="/">
                                HOME
                            </a>
                            <a href="/works/">
                                WORKS
                            </a>
                            <a href="/articles/">
                                ARTICLES
                            </a>
                            <a href="/tag/">
                                TAG
                            </a>
                            <a href="/about/">
                                ABOUT
                            </a>
                            </p>
                        </nav>
                    </div>
                    <div class="toggle"
                         class="header">
                    </div>

                </header>

                <div class="overlay"></div>
                <div class="text"
                     id="windowa">
                    <h3>PS</h3>
                    <h3>GameSpider</h3>
                    <div id="circle"></div>
                    <p id="tip"
                       class="center">正在获取最近更新列表...</p>
''' 
    f.write(txt)
	
recentpartone='''
<div class="drop-in" style="--i: 
'''
recentparttwo='''
"><div class="card"><img src="https://ravelloh.github.io/PSGameSpider/img/loading.gif" onload="this.src='https://ravelloh.github.io/PSGameSpider/img/
'''
recentpartthree='''
.jpg'" /><div class="focus-content"><p>
'''

recentpartfour='''</p><a onclick="quicksearch('
'''
recentpartfive='''
')">查看详情</a></p></div></div></div>
'''

htmlbodytwo='''
</div>
                <ul class="social">
                    <li>
                        <a href="/about/">
                            <span class="iconfont icon-about"></span>
                        </a>
                    </li>
                    <li>
                        <a href="http://github.com/ravelloh"
                           target="_blank"
                           rel="noreferrer">
                            <span class="iconfont icon-github"></span>
                        </a>
                    </li>
                    <li>
                        <a href="http://xeocnet-studio.github.io"
                           target="_blank"
                           rel="noreferrer">
                            <span class="iconfont icon-home">
                            </span>
                        </a>
                    </li>
                </ul>
                <div class="text"
                     id="text">
                    <h4 id="searchtitle">- 搜索 -</h4>
                    <p>INFO - 上次更新于:
'''

liststart='''
</p>
                    
                    <form onsubmit="post();return false;">
                        <input list="gamelist"
                               name="gamelist"
                               id="searchurl"
                               placeholder="输入要查找的游戏...">
                        <datalist id="gamelist">
                            <!-- List Start-->
'''
listend='''
<!-- List End-->
                        </datalist>
                        <br>
                        <button class="button"
                                value="搜索"
                                onclick="search()">搜索</button>
                    </form>

                    <h4>- 输出 -</h4>
                    <div class="output"
                         id="output">
                        您的浏览器不支持JavaScript。请打开JavaScript或更换浏览器以确保此程序正常运行
                    </div>
                    <span onclick="document.getElementById('windowa').innerHTML = helpfordemo"
                          class="iconfontsmall icon-annotation"></span>
                    <span onclick="document.getElementById('windowa').innerHTML = aboutfordemo"
                          class="iconfontsmall icon-about"></span>

            </section>
            <div class="menu">
                <ul>
                    <script type="text/javascript"
                            src="https://ravelloh.github.io/js/menu.js"></script>
                </ul>
            </div>
            <script language="javascript">
                var totalgamelist=[
'''
endofall ='''
"RavelloH "];
        var helpfordemo ='<h4><a name="无法找到游戏" href="#无法找到游戏">#无法找到游戏</a></h4><p>输入游戏名时是否有自动补全候选？<br>输入框自带候选，所有能被索引到的游戏都在候选框中。若候选框中有需要查找的游戏，请直接点击将其输入并搜索。</p><p>搜索内容是否正确？<br>请检查输入的内容是否正确。输入的内容将回显在输出框中。</p><p>游戏名是否为其他语言？<br>目前程序只支持官方中文翻译（若无中文翻译则自动使用英文）。</p><p>游戏是否在PlayStation中发布？<br>其他平台的爬虫正在制作中，请确认PlayStationStore中是否有要搜索的游戏</p><p>发布时间是否晚于此页面生成时间？(生成时间见右上)<br>此爬虫默认一天爬取一次，如需现在更新，请<a href="https://github.com/ravelloh/PSGameSpider" class="linkline">转到Github仓库</a>中，Star此仓库（在触发Workflows后，可将Star收回）</p>'
        var aboutfordemo='<h4><a name="关于" href="#关于">#关于</a></h4><p>项目名:PSGameSpider</p><p>作者:RavelloH</p><p>代码许可:MIT</p><p>开源:<a href="https://github.com/ravelloh/PSGameSpider" class="linkline">转到Github仓库</a></p>'
        document.getElementById('output').innerHTML = "终端正在等待数据输入...";
        var innerimghead='<figure class="hover-menu"><img src="https://ravelloh.github.io/PSGameSpider/img/';
        var innerimgparta='.jpg"/><div><a href="https://ravelloh.github.io/PSGameSpider/img/';
        var innerimgpartaend='.jpg">预览图片</a><a href="https://github.com/RavelloH/PSGameSpider/blob/main/img/'
        var innerimgpartb='.jpg">查看源</a><a href="https://store.playstation.com/zh-hans-cn/search/';
        var innerimgpartc='">转到Store</a></div></figure>';
        function search(){
        var innerimgurl=document.getElementById("searchurl").value;
        if(totalgamelist.includes(innerimgurl)){ innerover=innerimghead+innerimgurl+innerimgparta+innerimgurl+innerimgpartaend+innerimgurl+innerimgpartb+innerimgurl+innerimgpartc;
        document.getElementById('windowa').innerHTML = innerover;
        document.getElementById('searchtitle').innerHTML = "- 搜索 "+innerimgurl+" -";
        document.getElementById('output').innerHTML = '查询成功('+innerimgurl+')。触摸左侧封面查看更多内容。';
        } else {
        var timedata = new Date();
        var errora='未找到相应数据('+innerimgurl+')。请确认:<br>1.输入游戏名时是否有自动补全？<br>2.搜索内容是否正确？<br>3.游戏名是否为其他语言？<br>4.游戏是否在PlayStation中发布？<br>5.发布时间是否晚于此页面生成时间？(生成时间见上)<br>点击下方功能栏查看帮助';
        var timenow = "["+timedata.getHours()+":"+timedata.getMinutes()+":"+timedata.getSeconds()+"]";
        document.getElementById('output').innerHTML = timenow+errora;
        }
        function help(){
        alert("aaa");
        }
        } 
        function post(){
        return false;
        }
        function quicksearch(name){
        var innerimgurl = name; innerover=innerimghead+innerimgurl+innerimgparta+innerimgurl+innerimgpartaend+innerimgurl+innerimgpartb+innerimgurl+innerimgpartc;
        document.getElementById('windowa').innerHTML = innerover;
        document.getElementById('searchtitle').innerHTML = "- 搜索 "+innerimgurl+" -";
        }
        
        function drop(){
        document.getElementById("tip").classList.add('disappear');
        document.getElementById("circle").classList.add('disappear');
        setTimeout("1000")
        for(i = 0; i < 100; i++){
        document.getElementsByClassName('drop-in')[i].classList.add('droped');
        }}
        setTimeout("drop()","2000");
        </script> 


            <script src="https://ravelloh.github.io/js/script.js"></script>
            <script src="//instant.page/5.1.0"
                    type="module"
                    integrity="sha384-by67kQnR+pyfy8yWP4kPO12fHKRLHZPfEsiSXR8u2IKcTdxD805MGUXBzVPnkLHw"></script>
        </body>

</html>
'''
partone(f)

origin_link = "https://store.playstation.com/zh-hans-hk/pages/latest"
origin_html = urlopen(origin_link)
origin_obj = bs(origin_html.read(),'html.parser')
url_info = origin_obj.find('a',class_="psw-link psw-quick-action-link psw-button psw-b-0 psw-t-button psw-l-line-center psw-button-sizing psw-button-sizing--medium psw-button-sizing--icon-only psw-quick-action-button")
print("获取到最近更新列表地址:"+url_info['href'])
link = "store.playstation.com"+str(url_info['href'])[:-1]
k = 1
while k < 20:
    k = k+1
    # 爬取
    html = urlopen("https://"+link+str(k))
    # 解析
    obj = bs(html.read(),'html.parser')
    pic_info = obj.find_all('img')
    print(pic_info)
    if pic_info == []:
        print("爬取结束，共爬取"+str(k-1)+"页内容")
        break
    j = 0 # 配置遍历   
    for i in pic_info:
        j += 1
        pic = str(i['src'])
        name = re.sub("\(.*\)", "", str(i['alt']), count=0, flags=0) # 正则规范图片名
        # 自适应规范url
        if 'image-no-js' in str(i): 
            if "http" not in pic:
                if "data" in pic:
                    continue
                else:
                    if "//" in pic:
                        links = "http:"+pic
                    else:
                        if pic[0] == "/":
                            links = "http://"+link+pic
                        else:
                            links = "http://"+link+"/"+pic
        
            else:
                links = pic
    f.write(str(recentpartone)+str(j)+str(recentparttwo)+str(name)+str(recentpartthree)+str(name)+str(recentpartfour)+str(name)+str(recentpartfive))
f.write(str(htmlbodytwo)+str(time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(time.time())))+str(liststart))
for file_name in os.listdir('./img/'):
    f.write('<option value="'+file_name+'">')
f.write(listend)
for file_name in os.listdir('./img/'):
    f.write('"'+file_name+'",')
f.write(endofall)
f.close()
