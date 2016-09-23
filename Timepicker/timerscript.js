var width = 800,
    height = 400,
    radius = 150,
    data15 = makeArray(48),
    data30 = makeArray(24);
console.debug(d3);
var color = d3.scaleOrdinal()
    .domain([0, 1])
    //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", "#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);
    .range(['#bbb', '#ddd']);


var arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 50);

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return 1});
var pieHours = d3.pie()
    .sort(null)
    .value(function(d) { return d});

var svgfill = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var svg15 = svgfill
    .append("g")
    .attr("transform", "translate(" + width / 4 + "," + height / 2 + ")");

var svg30 = svgfill
    .append("g")
    .attr("transform", "translate(" + width / 1.5 + "," + height / 2 + ")");

//		var hourgroup = svg.selectAll('.hours')
//				.data(pie([1,2,3,4]))
//				.enter().append("g")
//				.attr("class", function(d, i) {console.log(d); return (i +1) + '-hour'});
//		hourgroup.append("text")
//				.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
//				.attr("dy", "0.35em")
//				.text(function(d, i) { return ((i % 4) + 1) * 15; })
//				.style("fill", '#777');

var g15 = svg15.selectAll(".arc")
    .data(pie(data15))
    .enter().append("g")
    .attr("class", function(d, i) { return 'arc ' + (Math.floor(i /4) + 1) + '-hour'});

g15.append("path")
    .attr("d", arc)
    //.style("fill", function(d, i) { return color(Math.floor(i /4)); });
    .style("fill", function(d, i) { return color((Math.floor(i /4)) % 2)});
//.style("fill", function(d, i) {console.log(i%4, !(i % 4), +(!i % 4), color(+(!i % 4))); return color(+!(i % 4)); });

g15.append("text")
    .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .text(function(d, i) { return ((i % 4) + 1) * 15; })
    .style("fill", '#777');

var g30 = svg30.selectAll(".arc2")
    .data(pie(data30))
    .enter().append("g")
    .attr("class", function(d, i) { return 'arc ' + (Math.floor(i /2) + 1) + '-hour'});

g30.append("path")
    .attr("d", arc)
    //.style("fill", function(d, i) { return color(Math.floor(i /4)); });
    .style("fill", function(d, i) { return color((Math.floor(i /2)) % 2)});
//.style("fill", function(d, i) {console.log(i%4, !(i % 4), +(!i % 4), color(+(!i % 4))); return color(+!(i % 4)); });

g30.append("text")
    .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .text(function(d, i) { return ((i % 2) + 1) * 30; })
    .style("fill", '#777');


function makeArray(n) {
    var arr = [];
    for (var i = 0; i < n; i ++) {
        arr.push(1)
    };
    return arr;
}

