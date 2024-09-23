const D3Node = require('d3-node');
const dataG = require('../data/gameList.js');
const fs = require('fs-extra');
const RLog = require('rlog-js');
const rlog = new RLog();

let d3n = new D3Node(); // Create a new D3Node instance outside the loop

for (let i = 0; i < dataG.length; i++) {
    rlog.info('Processing chart for', dataG[i].name, '...');
    d3n = new D3Node();
    fs.ensureDirSync(`./origin/zh-hans-hk/${dataG[i].name}`)
    fs.writeFileSync(`./origin/zh-hans-hk/${dataG[i].name}/rateHistory.svg`, generateLineChart(expandList(dataG[i].rateHistory), d3n));
    d3n = new D3Node();
    fs.writeFileSync(`./origin/zh-hans-hk/${dataG[i].name}/priceHistory.svg`, generateLineChart(expandList(dataG[i].priceHistory), d3n));
}
const expandList = (list) => {
    if (list.length == 0) return []
    const currentDateObj = new Date();
    const currentYear = currentDateObj.getFullYear();
    const currentMonth = currentDateObj.getMonth();
    const currentDay = currentDateObj.getDate();
    const formatDate = (year, month, day) => {
        const monthStr = month < 10 ? '0' + (month + 1) : month + 1;
        const dayStr = day < 10 ? '0' + day : day;
        return `${year}/${monthStr}/${dayStr}`;
    };
    const parseDate = (dateStr) => {
        const parts = dateStr.split('/');
        return new Date(parts[0], parts[1] - 1, parts[2]);
    };
    const findIndex = (dateStr) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i][0] === dateStr) {
                return i;
            }
        }
        return -1;
    };
    const expandedList = [];
    let lastValue = null;
    let lastIndex = -1;
    let minDate = new Date(list[0][0]);
    let maxDate = new Date(list[list.length - 1][0]);
    for (let item of list) {
        const date = new Date(item[0]);
        if (date < minDate) minDate = date;
        if (date > maxDate) maxDate = date;
    }
    for (
        let date = minDate;
        date <= new Date(currentYear, currentMonth, currentDay);
        date.setDate(date.getDate() + 1)
    ) {
        const dateString = formatDate(date.getFullYear(), date.getMonth(), date.getDate());
        const index = findIndex(dateString);
        if (index !== -1) {
            expandedList.push([dateString, list[index][1]]);
            lastIndex = index;
            lastValue = list[index][1];
        } else {
            if (lastIndex !== -1) {
                expandedList.push([dateString, lastValue]);
            }
        }
    }

    return expandedList;
};
function generateLineChart(data, d3n) {
    let width = 800;
    let height = 400;
    let margin = { top: 20, right: 20, bottom: 30, left: 50 };

    let svg = d3n.createSVG(width, height)
        .style('background-color', '#1e1e1e'); // Set background color

    let x = d3n.d3.scaleBand()
        .domain(data.map(d => d[0]))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    let y = d3n.d3.scaleLinear()
        .domain([0, d3n.d3.max(data, d => d[1])])
        .nice()
        .range([height - margin.bottom, margin.top]);

    let xAxis = g => g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3n.d3.axisBottom(x).tickSizeOuter(0).tickFormat(''));

    let yAxis = g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3n.d3.axisLeft(y).ticks(5));

    svg.append('g')
        .call(xAxis)
        .selectAll('text')
        .style('fill', '#ffffff'); // Set axis text color

    svg.append('g')
        .call(yAxis)
        .selectAll('text')
        .style('fill', '#ffffff'); // Set axis text color

    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#ffffff') // Set line color to white
        .attr('stroke-width', 2)
        .attr('d', d3n.d3.line()
            .x(d => x(d[0]) + x.bandwidth() / 2)
            .y(d => y(d[1]))
        );

    // 修改所有线的颜色为白色
    svg.selectAll('path')
        .attr('stroke', '#ffffff');

    return d3n.svgString();
}
