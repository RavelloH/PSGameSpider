# PlayStation游戏封面爬取
# Verson:1.2.0
# Author:RavelloH
# LICENSE:MIT
# 爬取内容归索尼及相关工作室所有

from urllib.request import urlopen
from bs4 import BeautifulSoup as bs
from wget import download
import os
import re
import html
# 创建目录
os.makedirs('./img-en/',exist_ok=True)
os.makedirs('./recent-en/',exist_ok=True)
# 设置目标路径
origin_link = "https://store.playstation.com/en-us/pages/latest"
# 删除重复文件
for file_name in os.listdir('./img-en/'):
    if '(1)' in file_name or '(2)' in file_name or '(3)' in file_name:
        os.remove('./img-en/' + file_name)
        print("清除重复文件:"+file_name)
# 清空列表
for recent_file_name in os.listdir('./recent-en/'):
    os.remove('./recent-en/' + recent_file_name)
    print("清空最近更新列表:"+recent_file_name)
# 爬取最新更新列表链接
origin_html = urlopen(origin_link)
origin_obj = bs(origin_html.read(),'html.parser')
url_info = origin_obj.find('a',class_="psw-link psw-quick-action-link psw-button psw-b-0 psw-t-button psw-l-line-center psw-button-sizing psw-button-sizing--medium psw-button-sizing--icon-only psw-quick-action-button")
print("获取到最近更新列表地址:"+url_info['href'])
link = "store.playstation.com"+str(url_info['href'])[:-1]
k = 1
while k < 20:
    # 爬取
    html = urlopen("https://"+link+str(k))
    # 解析
    obj = bs(html.read(),'html.parser')
    pic_info = obj.find_all("li","psw-l-w-1/2@mobile-s")
    if len(pic_info) == 1:
        print("爬取结束，共爬取"+str(k-1)+"页内容")
        break
    j = 0 # 配置遍历  
    for i in pic_info:
        try:
            imgs = i.find('noscript','psw-layer').contents
            img = imgs[0]['src']
            names = i.find_all('section','psw-product-tile__details psw-m-t-2')
            name = re.sub("\(.*\)", "", str(names[0].contents[1].string), count=0, flags=0)
            download(img,out='./img-en/'+name+'.jpg',bar='')
            download(img,out='./recent-en/'+name+'.jpg',bar='')
            print("[I]Success: "+name)
        except:                        
            print('[E]Error: %s' %(name))
            pass
    print("爬取:第"+str(k)+"页完成")
    k += 1
# 删除重复文件
for file_name in os.listdir('./img-en/'):
    if '(1)' in file_name:
        os.remove('./img-en/' + file_name)
        print("清除总重复文件:"+file_name)
for file_name in os.listdir('./recent-en/'):
    if '(1)' in file_name:
        os.remove('./recent-en/' + file_name)
        print("清除最近重复文件:"+file_name)

for file_name in os.listdir('./recent-en/'):
    try:
        file_name_new = re.sub(r'"', "", file_name)
        file_name_new = re.sub(r",", "",file_name_new)
        os.rename("./recnet-en/"+file_name,"./recent-en/"+file_name_new)
    except:
        pass
    
for file_name in os.listdir('./img-en/'):
    try:
        file_name_new = re.sub(r'"',"",file_name)
        file_name_new = re.sub(r",","",file_name_new)
        os.rename("./img-en/"+file_name,"./img-en/"+file_name_new)
    except:
        pass
