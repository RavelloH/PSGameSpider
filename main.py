# PlayStation游戏封面爬取
# Verson:1.2.0
# Author:RavelloH
# LICENSE:MIT
# 爬取内容归索尼及相关工作室所有

from urllib.request import urlopen
from bs4 import BeautifulSoup as bs
from wget import download
import os    
os.makedirs('./img/',exist_ok=True)
# 去重
for file_name in os.listdir('./img/'):    
        if '(1)' in file_name:
            os.remove('./img/' + file_name)
            print('[W]Warning: '+file_name)
        if '.tmp' in file_name:
            os.remove('./img/' + file_name)
            print('[W]Warning: '+file_name)
        
filelist = os.listdir('./img/')
# 设置目标路径
link = "store.playstation.com/zh-hans-hk/pages/browse/"
# 预处理进度
pages = bs(urlopen("https://"+link+'1').read(),'html.parser').find_all('ol','psw-l-space-x-1 psw-l-line-center psw-list-style-none')
page = pages[0].contents[-1].contents[0].string
print('运行开始，共获取到%s个页面' %(page))
k = 1
error = 0
pageerror = 0
while k <= int(page):
    try:
        print('[Prograss]解析页面: %s / %s' %(k,page)) 
        # 爬取
        html = urlopen("https://"+link+str(k))
        # 定位主列表
        obj = bs(html.read(),'html.parser')
        pic_info = obj.find_all("li","psw-l-w-1/2@mobile-s")
        # 遍历解析主列表
        for child in pic_info:
            imgs = child.find('noscript','psw-layer').contents
            img = imgs[0]['src']
            print(img)
            names = child.find_all('section','psw-product-tile__details psw-m-t-2')
            name = names[0].contents[1].string
            
            #下载图片
            if name+'.jpg' not in filelist and name+'.png' not in filelist:
                try: 
                    downloadname = download(img,out='./img/'+name+'.jpg',bar='')
                    print('[I]Success: '+name)
                except:
                    
                    print('[E]Error: '+name)
                    error += 1 
            else:
                print('[I]Skip: '+name)
        k+=1
        pageerror = 0
    except:
        pageerror += 1
        if pageerror <= 3:
            print('[E]Error: 第%s页解析失败，正在重试，重试次数: %s' %(k,pageerror))
        else:
            print('[CRASH]第%s页解析失败。已跳过' %(k))
            k+=1
            pageerror = 0
        pass 
# 二次去重

for file_name in os.listdir('./img/'):    
        if '(1)' in file_name:
            os.remove('./img/' + file_name)
            print('[W]Warning: '+file_name)
        if '.tmp' in file_name:
            os.remove('./img/' + file_name) 
            print('[W]Warning: '+file_name)
