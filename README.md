# PSGameSpider
自动爬取所有PlayStationStore中的所有游戏封面，支持按月分类

## 介绍
基于Github Actions的自动Python爬虫，支持自动分析最新游戏链接、自动翻页、正则自适应图片名、自动选择下载高清图片、自动删除重复文件、自动更新新文件等

### 结构
此仓库内共有两个爬虫程序:`main.py`以及`update.py`，其中`main.py`用于初次运行，运行此文件可爬取并下载PlayStationStore内的全部游戏，`update.py`用于每日运行，以更新最新游戏。  
所有游戏的封面将会存储在`./img/`内，最新的游戏将被存储在`./recent/`内

### 目录
<!-- START doctoc -->
<!-- END doctoc -->

## 使用
### 获取封面
若要查找某游戏的封面，可直接访问 https://github.com/RavelloH/PSGameSpider/find/main 并搜索。  
若需下载所有文件，可直接下载仓库压缩包或clone。  

### 运行爬虫
此程序基于Python3。
#### 安装依赖
```
pip install bs4
pip install wget
```
#### 运行文件

初次使用，需运行[main.py](https://github.com/RavelloH/PSGameSpider/blob/main/main.py)。  
注:现有游戏总量为2900左右(22-05-08)，爬取需要一定时间(Action需要大约20分钟)  

之后更新文件只需运行[update.py](https://github.com/RavelloH/PSGameSpider/blob/main/update.py)即可。
注:此程序只会更新***当月***最新游戏到总表中，要想保持列表完整性，请至少一个月运行一次。

### 使用GithubActions

## 开发
### 功能
#### 略缩图

## 关于

### 反馈

### 贡献
