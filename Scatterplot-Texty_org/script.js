var months,
    monthFormat = d3.time.format("%Y-%m");

var dates = ["1012009", "1072009", "1012010", "1072010", "1012011", "1072011", "1012012", "1072012",
    "1012013", "1072013", "1012014", "1072014"];
var nested_data;

var margin = {top: 20, right: 10, bottom: 160, left: 40},          // margins for whole picture
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    margin_group = {top: 5, right: 5, bottom: 10, left: 2},      // margins for small charts for each group of banks
    width_group = 150 - margin_group.left - margin_group.right,
    height_group = 200 - margin_group.top - margin_group.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.sqrt()
    .range([height, 0]);


var x_group = d3.scale.ordinal()
    .domain(dates)
    .rangeRoundBands([0, width_group], .1);

var y_group = d3.scale.sqrt()
    .domain([0,  25]) // this domain is trend for bank's actives, related to first year value. Minimum is 0, maximum - 3
    // if grouth was bigger then 3 times we should truncate a chart and make a note about situation
    .range([height_group, 0]);


var line = d3.svg.line()
    .x(function(d) { return x_group(d.date); })
    .y(function(d) { return y_group(d.value); })
    .interpolate("basis");


var svg = d3.select("#chart").append("svg")
    .attr('class', 'bank-lines')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.select(".nodet")
    .on("mouseover", function(d){
        d3.selectAll("div.nodet").classed("unselectedt", true);
        var name = d3.select(this).attr("id");
        d3.select(this).classed("unselectedt", false);
        svg.selectAll("path").classed("unselected", true);
        svg.selectAll("." + name).selectAll("path").classed("unselected", false);
    });

d3.csv("vis_data2.csv", function(error, csv_data) {
   console.log("old data");
   console.log(csv_data[20]);
});
d3.csv("banks2015.csv", function(error, csv_data) {
    csv_data.forEach(function(d){
        d["group.x"] = "4";
        d["group.y"] = "ukraine";
        d.groups = "3";
        d.income = d.Income;
        d.rating = "79";
        d.index = "21";
        d.owner = "Test";
        d.deposits_all = d.depos_all;
        d.y = "46"
    });
    console.log(csv_data[20]);
    /* construct set from group_owner column in csv data and find unique values from set of string */
    //var uniq_groups = d3.set(csv_data.map(function(d){return d.group_owner;})).values();
    var actives = d3.extent(csv_data.map(function(d){return +d.actives;}));
    var incomes = d3.extent(csv_data.map(function(d){return +d.income;}));
    var uniq_groups = d3.set(csv_data.map(function(d){return d.groups;})).values();
    var ratings = csv_data.map(function(d){return +d.rating;});
    x.domain(actives); // amount of different groups to which banks belong
    y.domain(incomes); // y domain depends on rating's interval of values

    var treemap_data = {
        "name": "market",
        "children": [
            {"name": "AgglomerativeCluster", "size": 3938},
        ]
    };
    treemap_data.children = d3.nest()
        .key(function(d) {return d["group.y"];}) // by group

        .rollup(function(leaves) {  // make summary for each group
            var share = leaves.reduce(function(memo, e) {
                return memo + parseFloat(e.actives);
            },0.);
            return share;
        })
        .entries(csv_data)
    treemap_data.children.map(function(d){
        return {name: d.key, value: d.values}
    });

    treemap(treemap_data);

    /* change data from flat to ierarchic form
     // group
     //   --> bank_name
     //     --> {date, val1, ...}  */
    parseDate = d3.time.format("%d%m%Y").parse;
    nested_data = d3.nest()

        //.key(function(d) {return d.group_owner;}) // by group
        //   .key(function(d) {return d.groups;}) // by group
        .key(function(d) {return d.name;})        // by bank's name

        .rollup(function(leaves) {  // make summary for each bank
            leaves.sort( function(a,b) { return parseDate('0'+a.date) - parseDate('0'+b.date); } ) // sort objects by date
            var base_val = leaves[0].actives; // base value for each bank - amount of actives in year first
            var incomes = leaves.map(function(d){return +d.income;}); //reduce(function(memo, m){ return memo + m.income }, 0);
            var av_income = d3.sum(incomes) / incomes.length;
            //var actives = leaves.map(function(d){return +d.actives;}); //reduce(function(memo, m){ return memo + m.income }, 0);
            //var av_active = d3.sum(actives) / actives.length;
            return {
                // common info for bank
                "name": leaves[0].name,
                "group_owner": leaves[0]["group.y"],
                "owner": leaves[0].owner,
                "rank": leaves[0].y,
                "status": leaves[0].status,
                "base_val": +base_val,
                "av_income": av_income,
                "credits_all":leaves[leaves.length-1].credits_all,
                "deposits_all": leaves[leaves.length-1].deposits_all,
                "data": leaves.map(function(o){ return {date: o.date, value: +o.actives / (base_val) }; } ) } })

        .entries(csv_data);
    var groups = svg.selectAll('g')
        .data(nested_data)
        .enter().append("g") // chart arrangement: by_x - starting value of actives, by y - average income
        .attr("transform", function(d, i){ return "translate(" + x(d.values.base_val) + "," + y(d.values.av_income) + ")"; } )
        .attr("class", function(d){ return "groups " + d.values.group_owner;});

    groups
        .append("text")
        .attr("x", 4)
        .attr("y", height_group + 20)
        .attr("dy", ".35em")
        //.style("font-weight", "bold")
        .style("font-size", "8px")
    //.text(function(d){ return d.key})

    var lines =  groups
        .selectAll("path")
        .data(function(d){   return [d.values]; })
        .enter()

    lines.append("path")
        //.attr("d", function(d) { if(d.values.group_owner == 6){return line(d.values.data.map(
        //	function(d){return {date:d.date, value: 1+d.value/10}}))}; return line(d.values.data); });
        .attr("d", function(d) { return line(d.data) })
        .attr("class", "background_line")

    lines.append("path")
        .attr("d", function(d) { return line(d.data) })
        .on("mouseover", function(d) {

            d3.select(this)
                .classed("selected", true) ;
            var parent = this.parentNode;
            var grandparent = this.parentNode.parentNode;
            grandparent.appendChild(parent);
            simple_tooltip(d);
        })
        .on("mouseout", function(d) {
            //svg.selectAll("path").classed('unselected', false);
            d3.select(this)
                .classed("selected", false) ;

            d3.selectAll('.tooltip').transition()
                .duration(500)
                .style("opacity", 0);
        })
});

function simple_tooltip(d){
    console.log(d);
    var last_point = d.data[d.data.length - 1];

    var x_left = x(d.base_val), x_right = x_left +  x_group(last_point.date);
    var y_bottom = y(d.av_income), y_top = y_bottom + y_group(last_point.value);

    var config1 = {
        activeBankName: d.name,
        target: "#scatterplot1",
        x_param: "credits_all",
        y_param: "deposits_all",
        x_title: "Credits",
        y_title: "Deposits",
        scat_title: "Deposits/Credits UAH"
    };
    var config2 = {
        activeBankName: d.name,
        target: "#scatterplot2",
        x_param: "av_income",
        y_param: "base_val",
        x_title: "Income",
        y_title: "Base",
        scat_title: "Actives"
    };
    scatterplot(nested_data, config1);
    scatterplot(nested_data, config2);
    var divTooltip = d3.select('#tt1');

    divTooltip.transition()
        //.delay(400)
        .duration(200)
        .style("opacity", 0.7)
        .style("left",  (x_right+53)  + "px"  )
        .style("top", ( y_top ) + "px");

    divTooltip.select('.tooltip-text')
        .html('<center><b>' + (d.name)  + "<br/>" +
            (last_point.value < 1 ? 'падіння: ' : 'зростання: ') +
            (last_point.value < 1 ? '': '+')  +  parseInt((last_point.value-1)*100)  +
            "%</b></center>" )

    /*  TODO: second tooltip */
    var divTooltip2 = d3.select('#tt2');
    divTooltip2.transition()
        .duration(200)
        .style("opacity", 0.7);
    divTooltip2.html('<center><b>'+(d.av_income > 0 ? 'дохід: ' : 'збитки: ') + Math.floor(d.av_income/1000)  + ' млн.' +
        '</br>розмір: ' + Math.floor(d.base_val/1000) +  " млн." +
        "</center>" ) ;


    var dims = divTooltip2.node().getBoundingClientRect();


    divTooltip2
        .style("left",  (x_left+50-dims.width)  + "px"  )
        .style("top", ( y_bottom + height_group+20 ) + "px");
}
/*





 .on("mouseover", function(d) {
 d3.select(this).classed('hover', true);
 this.parentNode.appendChild(this);
 })
 .on("mouseout", function(d) {
 d3.select(this).classed('hover', false);
 })

 svg.append("g")
 .attr("class", "axis axis--x")
 .attr("transform", "translate(0," + height + ")")
 .call(d3.svg.axis()
 .scale(x)
 .orient("bottom"));

 svg.append("g")
 .attr("class", "axis axis--y")
 .call(d3.svg.axis()
 .scale(y)
 .orient("left")
 .ticks(10, "%"))
 .append("text")
 .attr("x", 4)
 .attr("y", 7)
 .attr("dy", ".35em")
 .style("font-weight", "bold")
 .text("Unemployment Rate");
 */
