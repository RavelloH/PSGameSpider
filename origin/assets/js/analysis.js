// RTheme v3 - analysis.js(统计脚本)
// 注：请勿将此脚本用于你的个人博客，此脚本仅由RavelloH使用用于统计个人博客访问情况

function umamiAnalytics() {
    if (docCookies.getItem('settingEnableUmamiAnalytics') == 'false') {
        return false;
    }
    // 检测这是不是我自己的域名
    if (/rav.*h/.test(window.location.hostname) == false) {
        baiduAnalysis(true);
        return false;
    }
    (function () {
        addEvent(getUmamiEventList());
        var umami = document.createElement('script');
        umami.setAttribute('data-website-id', '9704e50f-edeb-4bee-88e2-16d4f18ab1b3');
        if (docCookies.getItem('settingEnableUmamiCache') == 'true') {
            umami.setAttribute('data-cache', 'true');
        }
        umami.src = 'https://analytics.ravelloh.top/script.js';
        var an = document.getElementsByTagName('script')[0];
        an.parentNode.insertBefore(umami, an);
    })();
}

function baiduAnalysis(force = false) {
    if (docCookies.getItem('settingEnableBaiduTongji') == 'true' || force == true) {
        var _hmt = _hmt || [];
        (function () {
            var hm = document.createElement('script');
            hm.src = 'https://hm.baidu.com/hm.js?dbfc04c30a6804002416a339a4023685';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(hm, s);
        })();
    }
}

function addEvent(list) {
    if (docCookies.getItem('settingEnableUmamiEvents') == 'false') {
        return false;
    }
    list.forEach((item) => {
        document.querySelector(item[0]).setAttribute('data-umami-event', item[1]);
    });
}

function getUmamiEventList() {
    return [
        ['#avatar', 'header-头像'],
        ['#avatarname', 'header-LOGO'],
        ['#toggle', 'ui-菜单按钮'],
        ['#infobar-toggle', 'ui-信息栏按钮'],
        ['#icon-about', 'footer-关于'],
        ['#icon-github', 'footer-Github'],
        ['#icon-studio', 'footer-工作室'],
        ['#icon-rss', 'footer-RSS'],
        ['#icons-right', 'footer-消息栏'],
        ['#email', 'menu-邮箱'],
        ['#icon-swap', 'menu-切换服务器'],
        ['#icon-color', 'menu-切换颜色'],
        ['#icon-music', 'menu-音乐栏'],
        ['#icon-fullscreen', 'menu-全屏'],
        ['#icon-setting', 'menu-设置'],
        ['#icon-share', 'menu-分享'],
    ];
}

function getRealTimeVisitors(mode = 'return') {
    let site = 'https://analytics.ravelloh.top';
    let token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3ZWJzaXRlSWQiOiI5NzA0ZTUwZi1lZGViLTRiZWUtODhlMi0xNmQ0ZjE4YWIxYjMiLCJpYXQiOjE3MDg0ODU0MDd9.yJ-qXhhSGFpr-MhT4DYk6R3Mt6l271AgfNi3YEEFOls';
    let apiURL = site + '/api/websites/9704e50f-edeb-4bee-88e2-16d4f18ab1b3/active';
    fetch(apiURL, {
        headers: {
            'x-umami-share-token': token,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (isLayoutMenuOpen() && mode == 'switch') {
                return switchMessageBarContent(structureOnlineVistor(data[0].x));
            }
            if (mode == 'return') {
                return data[0].x;
            }
        });
}

function getPageVisitors(url = window.location.pathname) {
    return new Promise((resolve, reject) => {
        let apiURL = `https://psgamespider.analytics.api.ravelloh.top/pageview?url=${url}`;
        fetch(apiURL)
            .then((response) => response.json())
            .then((data) => {
                resolve(data);
            });
    }).catch((err) => {
        throw err;
    });
}

function loadUptime() {
    if (docCookies.getItem('settingEnableUptime') == 'false') {
        return false;
    }
    if (typeof uptimeData == 'undefined') {
        return new Promise((resolve, reject) => {
            let site = 'https://uptime.api.ravelloh.top';
            fetch(site, {})
                .then((response) => response.json())
                .then((data) => {
                    resolve(data);
                    uptimeData = data;
                });
        }).catch((err) => {
            throw err;
        });
    } else {
        return Promise.resolve(uptimeData);
    }
}
