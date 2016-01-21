var  margin = {top: 20, right: 20, bottom: 30, left: 30},
    svgWidth = 800,
    svgHeight = 500,
    generateRandomData = function() {
    "use strict";
    let arr = [],
        randomItem = function() {
            return {
                age: Math.floor(Math.random() * 100),
                weight: Math.floor(Math.random() * 100),
                color: Math.floor(Math.random() * 100),
                diameter: Math.floor(Math.random() * 500)
            }
        };
    for (let i = 0; i < 500; i++) {
        arr.push(randomItem())
    }
    //q++;
    return arr;
};
    data = generateRandomData(),
    domain = {
        x: [d3.min(data, function(d) { return d.age}), d3.max(data, function(d) { return d.age})],
        y: [d3.min(data, function(d) { return d.weight}), d3.max(data, function(d) { return d.weight})],
        diameter: [d3.min(data, function(d) { return d.diameter}), d3.max(data, function(d) { return d.diameter})],
        color: [d3.min(data, function(d) { return d.color}), d3.max(data, function(d) { return d.color})]
    },
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;

//Calculate SCALES
var x = d3.scale.linear()
    .domain(domain.x)
    .range([0, width]);
var y = d3.scale.linear()
    .domain(domain.y)
    .range([height, 0]);
var diameter = d3.scale.linear()
    .domain(domain.diameter)
    .range([2, 30]);
var color = d3.scale.category20()
    .domain(domain.color);

//Prepare AXES functions
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(50);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(30);

//START DRAWING
var svg = d3.select('#container').append('svg')
    //Draw root g-element
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Draw Axes
svg.append("g")
      .attr("class", "x-ax axis")
      .attr("transform", "translate(0," + (svgHeight - margin.bottom - margin.top) + ")")

      .call(xAxis)
      .append("text")      
      .attr("x", width)
      .attr("dy", "-10px")
      .style("text-anchor", "end")
      .text("Age");

svg.append("g")
      .attr("class", "y-ax axis")

      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Weight");

//Draw Circles
svg.append("g")
      .attr("class", "circles");

var circlegroup = d3.select('#container').selectAll('.circles'),
    circles = circlegroup.selectAll('.item')
        .data(data)
        .enter();
////Duplicated in function
//circles.append('circle')
//    .attr('class', 'item')
//    .attr("cx", function (d) {
//        return x(d.age);
//    })
//    .attr("cy", function (d) {
//        return y(d.weight);
//    })
//    .attr("r", function (d) {
//        return d.diameter > 80 ? diameter(d.diameter) : diameter(81);
//    })
//    .style("fill", function (d) {
//        return color(d.color)
//    });
//
drawCircles(circles);


function drawCircles(arg) {

        arg.append('circle')
        .attr('class', 'item')
        .attr("cx", function (d) {
            return x(d.age);
        })
        .attr("cy", function (d) {
            return y(d.weight);
        })
        .attr("r", function (d) {
            return d.diameter > 80 ? diameter(d.diameter) : diameter(81);
        })
        .style("fill", function (d) {
            return color(d.color)
        });

    return arg;
}

function newData() {
    "use strict";
    var newData = generateRandomData();
    d3.selectAll('circle')
        .data(newData, function(d) { return(d); })
        .order()
        .exit()
        .remove();

    var newCircles = circlegroup.selectAll('.item')
        .data(newData)
        .enter();

    drawCircles(newCircles);
}

function startInterval () {
     setInterval(newData, 500);
}