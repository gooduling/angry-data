var margin = {top: 70, right: 20, bottom: 20, left: 10},
    svgWidth = 1000,
    svgHeight = 700,
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom,
    data = {};

d3.csv("budget16-top10.csv", function (error, csv_data) {
    console.log(csv_data);
    data.income = csv_data.filter(function(d) {return d.type === "income" && d.description != "Дефіцит бюджету"})
        //.sort(function(b, a) { return a.total16 - b.total16; });
    data.charge = csv_data.filter(function(d) {return d.type === "charges "})
       // .sort(function(b, a) { return a.total16 - b.total16; });
    var totalIncome = {
            "y15": data.income.map(function(d) {return parseFloat(d.total15)}),
            "y16": data.income.map(function(d) {return parseFloat(d.total16)})
        },
        totalOutcome = {
            "y15": data.charge.map(function(d) {return parseFloat(d.total15)}),
            "y16": data.charge.map(function(d) {return parseFloat(d.total16)})
        },
        outcomeSum = d3.sum(totalOutcome.y16),
        incomeSum = d3.sum(totalIncome.y16),
        deficite = parseInt(outcomeSum - incomeSum);
    console.log(data);
//Calculate SCALES
    var scaleY = d3.scale.linear()
        .domain([0, d3.max([incomeSum, outcomeSum])])
        .range([height, 0])
        .clamp(true);
    var scaleR = d3.scale.linear()
        .domain(d3.extent(totalIncome.y16.concat(totalOutcome.y16)))
        .rangeRound([0, 8])
        .clamp(true);

//Prepare AXES functions
    var yAxis = d3.svg.axis()
        .scale(scaleY)
        .orient("left")
        .ticks(10);

    var xTranslate = width/ 2,
        wCounter = 0;

    //To calculate transition of every nex element
    function incrementCouner (d, i){
        if (!i) wCounter = 0;
        var c = wCounter,
            dif = d.type == "income" ? height - scaleY(deficite) : 0;
        wCounter = wCounter + parseFloat(d.total16);
        return "translate( 0," + (height - scaleY(c) + dif) + ")";
    }
    //Hack to limit the width of the text labels
    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 16, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    var dyValue = lineNumber ===1 ? 0 : lineHeight;
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", dyValue  + "px").text(word);
                }
            }
        });
    }

//START DRAWING MAIN CONTAINERS
    var svg = d3.select('#container')
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append("g")
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")");

    var pyramide = svg.append("g")
        .attr("class", "pyramide");

//AXE
        var axe = pyramide.append("g")
            .attr("class", "y-ax axis")
            .attr("transform", "translate(" + xTranslate + ", 0)")
            .attr("opacity", "0");

            axe.call(yAxis);
//INCOME BAR
        pyramide.append("g")
            .attr("class", "income elementbar")
            .attr("opacity", "0")
            .attr("transform", "translate(" + (xTranslate-50) + ", 0)")
            .append("text")
            .text("Доходи")
            .attr("transform", "translate( -100, -40)")
            .attr("class", "bartitle")
            .style("text-anchor", "middle");
//CHARGES BAR
        pyramide.append("g")
            .attr("class", "charges elementbar")
            .attr("opacity", "0")
            .attr("transform", "translate(" + (xTranslate+10) + ", 0)")
            .append("text")
            .text("Видатки")
            .attr("transform", "translate( 100, -40)")
            .attr("class", "bartitle")
            .style("text-anchor", "middle");
//INCOME ELEMENTS
        var income = d3.select(".income")
            .selectAll("g")
            .data(data.income)
            .enter()
            .append("g")
            .attr("transform", incrementCouner)
            .attr("class", "item-group");

        income.append("rect")
            .attr("class", function (d) { return "income-item budget-item data-item "+ (d.description == "Інше" ? "rest":"")})
            .attr("x", "-200")
            .attr("width", "200")
            .attr("height", function (d) {return height - scaleY(d.total16)+1});
//CHARGE ELEMENTS
        var charges = d3.select(".charges")
            .selectAll("g")
            .data(data.charge)
            .enter()
            .append("g")
            .attr("transform", incrementCouner)
            .attr("class", "item-group");
        charges.append("rect")
            .attr("class", function (d) { return "charges-item budget-item data-item "+ (d.description == "Інше" ? "rest":"")})
            .attr("x", "0")
            .attr("width", "200")
            .attr("height", function (d) {return height - scaleY(d.total16)+1;});

//DEFICITE ELEMENT
     var deficiteGroup = pyramide.select(".income")
         .append("g")
         .attr("class", "deficite-group item-group")
         .attr("transform", "translate(0, 0)");
    deficiteGroup.append("rect")
         .attr("class", "deficite budget-item")
         .attr("opacity", "0")
         .attr("x", "-200")
         .attr("width", "200")
         .attr("height", function () {return height - scaleY(deficite)-2;})
         .attr("rx", "7")
         .attr("ry", "7");
//SIDE DESCRIPTION TEXTS
    axe.append("text")
        .text(function() { return Math.floor(outcomeSum) + " млрд.грн."})
        .attr("transform", "translate(0, -10)")
        .attr("opacity", 1)
        .style("text-anchor", "middle");
    deficiteGroup.append("text")
        .text(function() { return "Дефіцит бюджету: " + deficite + " млрд."})
        .attr("transform", function(d){ return "translate( -220," + (height - scaleY(deficite))/2 + ")"})
        .attr("opacity", "0")
        .attr("class", "side-label")
        .style("text-anchor", "end");
    income.append("text")
        .text(function(d) { return d.description + ": " + d.total16 + " млрд."})
        .attr("transform", function(d){ return "translate( -220," + ((height - scaleY(d.total16))/2+5) + ")"})
        .attr("opacity", "0")
        .attr("class", "side-label")
        .style("text-anchor", "end");
    charges.append("text")
        .text(function(d) { return d.description + ": " + d.total16 + " млрд."})
        .attr("transform", function(d){ return "translate( 220," + ((height - scaleY(d.total16))/2+5) + ")"})
        .attr("opacity", 0)
        .attr("class", "side-label")
        .style("text-anchor", "start");

    pyramide.selectAll(".side-label")
        .attr("dy", "0")
        .call(wrap, 200);


//ANIMATION OF APPEARANCE
    //AXE
    pyramide.selectAll('.axis').transition()
        .attr("opacity", "1")
        .duration(500)
        .delay(0);
    //BARS
    pyramide.selectAll('.elementbar').transition()
        .attr("opacity", "1")
        .duration(1000)
        .delay(500);
    //ELEMENTS
    pyramide.selectAll(".data-item").transition()
        .attr("height", function (d) {return height - scaleY(d.total16) - 2;})
        .attr("rx", "5")
        .attr("ry", "5")
        .duration(300)
        .delay(3000);
    pyramide.selectAll(".rest").transition()
        .attr("opacity", "0.4")
        .duration(300)
        .delay(3000);
    //DEFICITE
    pyramide.select(".deficite").transition()
        .attr("opacity", function () {return 1;})
        .duration(1000)
        .delay(3500);
});

