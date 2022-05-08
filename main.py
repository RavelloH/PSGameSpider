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
# 设置目标路径
link = "store.playstation.com/zh-hans-hk/pages/browse/"
k = 1
while k < 200:
    # 爬取
    html = urlopen("https://"+link+str(k))
    # 解析
    obj = bs(html.read(),'html.parser')
    pic_info = obj.find_all('img')
    if len(pic_info) == 3:
        break
    j = 0 # 配置遍历
    try:   
        for i in pic_info:
            j += 1
            pic = str(i['src'])
            name = str(i['alt'])
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
            else:
                continue
            # 下载
            name = download(links,out='./img/'+name+'.jpg')
            print(name)
    except:
        pass
    for file_name in os.listdir('./img/'):    
        if '(1)' in file_name:
            os.remove('./img/' + file_name)
    k += 1
