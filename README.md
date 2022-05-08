# PSGameSpider
自动爬取所有PlayStationStore中的所有游戏封面，支持按月分类

## 介绍
基于Github Actions的自动Python爬虫，支持自动分析最新游戏链接、自动翻页、正则自适应图片名、自动选择下载高清图片、自动删除重复文件、自动更新新文件等

### 结构
此仓库内共有两个爬虫程序:`main.py`以及`update.py`，其中`main.py`用于初次运行，运行此文件可爬取并下载PlayStationStore内的全部游戏，`update.py`用于每日运行，以更新最新游戏。 
所有游戏的封面将会存储在`./img/`内，最新的游戏将被存储在`./recent/`内

## 使用

