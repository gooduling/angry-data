var margin = {top: 80, right: 80, bottom: 130, left: 130},
    width = 1600 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom,
    data = itCompaniesData;

// var x = d3.scale.ordinal()
//     .domain(data.map(function(d) { return d.name; }))
//     .rangeRoundBands([0, width], .1);
var x = d3.scale.linear()
    .domain([90, d3.max(data, function(d) { return d.relations})])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([80, d3.max(data, function(d) { return d.growingup})])
    .range([height, 0]);
var diameter = d3.scale.linear()
    .domain([80, d3.max(data, function(d) { return d.salary})])
    .range([2, 25]);
var color = d3.scale.linear()
    .domain([90, d3.max(data, function(d) { return d.workconditions})])
    .range([0,190]);

    // var color = d3.scale.category20c()
    // .domain([d3.min(data, function(d) { return d.workconditions}), d3.max(data, function(d) { return d.workconditions})])

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(20);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")      
      .attr("x", width)
      .attr("dy", "-10px")
      .style("text-anchor", "end")
      .text("Отношение к сотрудникам %");

svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 5)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Перспектива роста %");

var circlegroup = svg.append("g")
      .attr("class", "circles")
      .selectAll(".company")
        .data(data)
        .enter().append("g")
      .attr("class", "circlegroup");

circlegroup
  .append("circle")
  .attr("cx", function (d) { return x(d.relations); })
  .attr("cy", function (d) { return y(d.growingup); })
  .attr("r", function (d) { return d.salary>80 ? diameter(d.salary):diameter(81); })
  .style("fill", function (d) {
    var c = d.workconditions>90 ? parseInt(color(d.workconditions)):parseInt(color(91));
    var b = ("rgb("+(190-c)+"," +c +","+ 15+") " )
    console.log(b); 
    return b
  });

circlegroup
      .append("text")
      //.attr("transform", "rotate(-90) translate(0,20)")
      .attr("x", function (d) { return x(d.relations); })
      .attr("y", function (d) { return y(d.growingup); })
      .attr("class", "textlabel")
      .style("text-anchor", "middle")
      .style("font-size", function (d) {return d.name == "DataArt" ? "1.3em":"1em"} )
      .text(function (d) {return d.name});

// function compare(z) {
// var lowest = d3.min(data, function(d) { return d.solary}),
//   high = d3.max(data, function(d) { return d.solary});
  
//     console.log(lowest);
//     console.log(high);
// }