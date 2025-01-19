function main() {
    loadComment('/PSGameSpider'+location.pathname)
    setTimeout(() => {
        virgule(document.querySelector('#page-dest'), '每日定时更新的Playstation Store数据聚合平台')
    }, 400)
}