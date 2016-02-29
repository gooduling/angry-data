//EXAMPLE of config object
//var config1 = {
//    activeBankName: d.name,
//    target: "#scatterplot1",
//    x_param: "credits_all",
//    y_param: "deposits_all",
//    x_title: "Credits",
//    y_title: "Deposits",
//    scat_title: "Deposits/Credits UAH"
//};
function scatterplot (data, config) {
    var data = data.filter(function(d) {   //Filter emty values
        return parseInt(d.values[config.x_param]) > 0 & parseInt(d.values[config.y_param]) > 0;
        }),
        margin = {top: 5, right: 5, bottom: 35, left: 35},
        svgWidth = 300,
        svgHeight = 200,
        width = svgWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom,
        domain = {
            x: [d3.min(data, function (d) {
                return parseInt(d.values[config.x_param]);
            }), d3.max(data, function (d) {
                return parseInt(d.values[config.x_param]);
            })],
            y: [d3.min(data, function (d) {
                return parseInt(d.values[config.y_param]);
            }), d3.max(data, function (d) {
                return parseInt(d.values[config.y_param]);
            })]
        };

//Calculate SCALES
    var x = d3.scale.log()
        .domain(domain.x)
        .range([0, width])
        .clamp(true);

    var y = d3.scale.log()
        .domain(domain.y)
        .range([height, 0])
        .clamp(true);

//Prepare AXES functions
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(10, ",.1s");
        //.tickFormat(1, "+%");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10, ",.1s");

//START DRAWING
    //Add title
    d3.select(config.target)
        .html('') // clean html to avoid multiplication
        .append("p")
        .attr("class", "scatterplot-title" )
        .attr('width', svgWidth+"px")
        .text(config.scat_title);

    var root = d3.select(config.target)
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Draw Axes
    root.append("g")
        .attr("class", "x-ax axis")
        .attr("transform", "translate(0," + (svgHeight - margin.bottom - margin.top) + ")")
        .call(xAxis)
        .append("text")
        .attr("x", width)
        .attr("dy", "-10px")
        .style("text-anchor", "end")
        .text(config.x_title);

    root.append("g")
        .attr("class", "y-ax axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(config.y_title);

//Draw Circles
    root.append("g")
        .attr("class", "circles");

    var circlegroup = d3.select(config.target).selectAll('.circles'),
        circles = circlegroup.selectAll('.item')
            .data(data)
            .enter();

        circles.append('circle')
            .attr('class', 'item')
            .attr("cx", function (d) { return x(parseInt(d.values[config.x_param])) || 0; })
            .attr("cy", function (d) { return y(parseInt(d.values[config.y_param])) || 0; })
            .attr("r", function (d) { return d.values.name == config.activeBankName ? 5 : 3 })
            .classed("active-bank", function (d) { return d.values.name == config.activeBankName })
            .style("fill", "red");

    root.selectAll("circle").sort(function(a){return a.values.name == config.activeBankName ? 1 : 0})

}
