import urllib3
import html
import re
from urllib.request import urlopen
from bs4 import BeautifulSoup as bs
import os
import time

if os.path.exists("./en/index.html"):
  os.remove("./en/index.html")
else:
  print("The file does not exist")

f = open("./en/index.html", 'x')
def partone(f):
    txt = ''' 
<!DOCTYPE html>
<html lang="en">

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
              max-width: 90%;
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
              max-width: 90%;
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
              width: 50%;
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
            margin-top:20px;
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
                       class="center">Loading list of recent updates...</p>
''' 
    f.write(txt)
	
recentpartone='''
<div class="drop-in" style="--i: 
'''
recentparttwo='''
"><div class="card"><img src="../logo.jpg" onload="this.src='../img-en/
'''
recentpartthree='''
.jpg'" /><div class="focus-content"><p>
'''

recentpartfour='''</p><a onclick="quicksearch('
'''
recentpartfive='''
')">View details</a></p></div></div></div>
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
                    <h4 id="searchtitle">- Search -</h4>
                    <p>INFO - Last updated on:
'''

liststart='''
</p>
                    
                    <form onsubmit="post();return false;">
                        <input list="gamelist"
                               name="gamelist"
                               id="searchurl"
                               placeholder="Enter the game to find...">
                        <datalist id="gamelist">
                            <!-- List Start-->
'''
listend='''
<!-- List End-->
                        </datalist>
                        <br>
                        <button class="button"
                                value="Search"
                                onclick="search()">Search</button>
                    </form>

                    <h4>- Output -</h4>
                    <div class="output"
                         id="output">
                        Your browser does not support JavaScript. Please open JavaScript or change your browser to make sure this program works properly
                    </div>
                    <span onclick="document.getElementById('windowa').innerHTML = helpfordemo"
                          class="iconfontsmall icon-annotation"></span>
                    <span onclick="document.getElementById('windowa').innerHTML = aboutfordemo"
                          class="iconfontsmall icon-about"></span>
			  <br><br>

                    <div><h4>- More languages -</h4>

                    <li><a href="https://ravelloh.github.io/PSGameSpider/">中文</a></li>

                    <li><a href="https://ravelloh.github.io/PSGameSpider/en/">English</a></li>

                    </div>

                    <br>

                    <div><h4>- Comment -</h4>

                    <br>

                <div id="tcomment"></div>

<script src="https://cdn.staticfile.org/twikoo/1.5.11/twikoo.all.min.js"></script>

<script>

twikoo.init({

  envId: 'https://comment-ravelloh.vercel.app
  el: '#tcomment',
  lang: 'en-us', 

})

</script>

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
        </script>
            <script type="text/javascript"
                src="en-main.js"></script>
            <script src="https://ravelloh.github.io/js/script.js"></script>
            <script src="//instant.page/5.1.0"
                    type="module"
                    integrity="sha384-by67kQnR+pyfy8yWP4kPO12fHKRLHZPfEsiSXR8u2IKcTdxD805MGUXBzVPnkLHw"></script>
        </body>

</html>
'''
partone(f)
dt=0
for name in os.listdir('./recent-en/'): 
    f.write(recentpartone+str(dt)+recentparttwo+name[:-4]+recentpartthree+name[:-4]+recentpartfour+name[:-4]+recentpartfive+'\n')
    dt += 1
f.write(htmlbodytwo+time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(time.time()))+liststart)
for file_nameb in os.listdir('./img-en/'):
    f.write('<option value="'+file_nameb[:-4]+'">'+'\n')
f.write(listend)
for file_namec in os.listdir('./img-en/'):
    f.write('"'+file_namec[:-4]+'",'+'\n')
f.write(endofall)
f.close()

f1 = open("./en/index.html","r")
content = f1.read()
f1.close()

t = content.replace("\n","")
with open("./en/index.html","w") as f2:
    f2.write(t)
