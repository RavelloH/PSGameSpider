const D3Node = require('d3-node');
const dataG = require('../data/gameList.js');
const fs = require('fs-extra');
const RLog = require('rlog-js');
const rlog = new RLog();

let d3n = new D3Node(); // Create a new D3Node instance outside the loop

for (let i = 0; i < dataG.length; i++) {
    rlog.info('Processing chart for', dataG[i].name, '...');
    d3n = new D3Node();
    fs.writeFileSync(`./public/zh-hans-hk/${dataG[i].name}/rateHistory.svg`, generateLineChart(dataG[i].rateHistory, d3n));
    d3n = new D3Node();
    fs.writeFileSync(`./public/zh-hans-hk/${dataG[i].name}/priceHistory.svg`, generateLineChart(dataG[i].priceHistory, d3n));
}

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
