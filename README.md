# PSGameSpider
自动爬取所有PlayStationStore中的所有游戏封面，支持按月分类

## 介绍
基于Github Actions的自动Python爬虫，支持自动分析最新游戏链接、自动翻页、正则自适应图片名、自动选择下载高清图片、自动删除重复文件、自动更新新文件等

### 结构
此仓库内共有两个爬虫程序:`main.py`以及`update.py`，其中`main.py`用于初次运行，运行此文件可爬取并下载PlayStationStore内的全部游戏，`update.py`用于每日运行，以更新最新游戏。  
所有游戏的封面将会存储在`./img/`内，最新的游戏将被存储在`./recent/`内

### 目录
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [使用](#%E4%BD%BF%E7%94%A8)
  - [获取封面](#%E8%8E%B7%E5%8F%96%E5%B0%81%E9%9D%A2)
  - [运行爬虫](#%E8%BF%90%E8%A1%8C%E7%88%AC%E8%99%AB)
    - [安装依赖](#%E5%AE%89%E8%A3%85%E4%BE%9D%E8%B5%96)
    - [运行文件](#%E8%BF%90%E8%A1%8C%E6%96%87%E4%BB%B6)
  - [使用GithubActions](#%E4%BD%BF%E7%94%A8githubactions)
- [此仓库可直接fork并运行actions。  
直接fork将会保留之前更新的文件，所以无需运行`main.py`](#%E6%AD%A4%E4%BB%93%E5%BA%93%E5%8F%AF%E7%9B%B4%E6%8E%A5fork%E5%B9%B6%E8%BF%90%E8%A1%8Cactions--%0A%E7%9B%B4%E6%8E%A5fork%E5%B0%86%E4%BC%9A%E4%BF%9D%E7%95%99%E4%B9%8B%E5%89%8D%E6%9B%B4%E6%96%B0%E7%9A%84%E6%96%87%E4%BB%B6%E6%89%80%E4%BB%A5%E6%97%A0%E9%9C%80%E8%BF%90%E8%A1%8Cmainpy)
- [关于](#%E5%85%B3%E4%BA%8E)
  - [反馈](#%E5%8F%8D%E9%A6%88)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
此仓库可直接fork并运行actions。  
直接fork将会保留之前更新的文件，所以无需运行`main.py`
----
**流程:  
1.Fork此仓库  
2.前往你的仓库，在Settings>Actions  
3.前往你的仓库，在Actions中选择运行Actions运行  
4.前往你的仓库，在.github/workflows/main.yml中，修改第  

## 关于
此项目***源码***使用MIT Licence。  
爬取内容归索尼所有。  

### 反馈
发现BUG？有修改建议？欢迎[用ISSUES](https://github.com/RavelloH/PSGameSpider/issues/new)反馈
