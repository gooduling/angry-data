var margin = {top: 70, right: 20, bottom: 20, left: 10},
    svgWidth = 1000,
    svgHeight = 700,
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom,
    radius = 30,
    innerRadius = 0.2 * radius,
    mapPosition,
    incomeData = {},
    nestedData = {},
    filterOptions = {},
    filterStates = {},
    filterRows = ["sex", "birth", "family", "education", "job", "rich", "religion"], // "voting", "politics"],
    quadrantColors = {
        //NE: "red",
        //SE: "green",
        //SW: "yellow",
        //NW: "blue",
        NE: "#2D728F",
        SE: "#70AE6E",
        SW: "#F49E4C",
        NW: "#C42021"
    },
    ua_map_labels_to_id = {
    "Dnipropetrovsk":"12",
    "Donetsk":"14",
    "Zhytomyr":"18",
    "Zakarpattia":"21",
    "Zaporizhia":"23",
    "Ivano-Frankivsk":"26",
    "Kiev City 1":"30",
    "Kyiv":"32",
    "Kirovograd":"35",
    "Sevastpol' City":"40",
    "Crimea":"43",
    "Lviv":"46",
    "Mykolaiv":"48",
    "Odessa":"51",
    "Poltava":"53",
    "Rivne":"56",
    "Sumy":"59",
    "Ternopil":"61",
    "Kharkiv":"63",
    "Kherson":"65",
    "Khmelnytsky":"68",
    "Cherkasy":"71",
    "Chernihiv":"74",
    "Chernivtsi":"77",
    "Lugansk":"09",
    "Vinnytsia":"05",
    "Volyn":"07"
    },
    ua_map_localization_UA = {
        "Dnipropetrovsk":"Дніпропетровськ",
        "Donetsk":"Донецьк",
        "Zhytomyr":"Житомир",
        "Zakarpattia":"Закарпаття",
        "Zaporizhia":"Запоріжжя",
        "Ivano-Frankivsk":"Івано-Франківськ",
        "Kiev City 1":"Київ",
        "Kyiv":"Київ",
        "Kirovograd":"Кировоград",
        "Sevastpol' City":"Севастополь0",
        "Crimea":"Крим",
        "Lviv":"Львів",
        "Mykolaiv":"Миколаїв",
        "Odessa":"Одеса",
        "Poltava":"Полтава",
        "Rivne":"Рівне",
        "Sumy":"Суми",
        "Ternopil":"Тернопіль",
        "Kharkiv":"Харків",
        "Kherson":"Херсон",
        "Khmelnytsky":"Хмельницький",
        "Cherkasy":"Черкаси",
        "Chernihiv":"Чернигів",
        "Chernivtsi":"Чернівці",
        "Lugansk":"Луганськ",
        "Vinnytsia":"Вінниця",
        "Volyn":"Луцьк"
    },
    ua_map_id_to_labels = iverseKeys(ua_map_labels_to_id),
    tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .html(createTipContent);

d3.csv("huge-united.csv", function(er, csv_data){//vox_united.csv huge-simple.csv
    incomeData = csv_data.filter(function(i){return i.location != "outside_ukraine" && i.location != "not_defined"});
    update(incomeData);
    filterOptions = collectUniqValues(incomeData);
    //add options with uniq values in filter selects
    for (var key in filterOptions) {
        if (!(filterRows.indexOf(key)+1) || key === 'birth') { continue}
        filterOptions[key].forEach(function(item){
            d3.selectAll("#svgmap-form-wrapper #" + key)
                .append("option")
                .attr("value", item)
                .text(item)
        });
    }
});

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(function (d) {return (radius - innerRadius) * (d.size) *1.5 + innerRadius;});
var outlineArc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(radius);
var svg = d3.select("#ua_map");
svg.call(tip);
var chartLayout = svg.append('g')
    .attr("class", "region-chart");
var mapRegions = svg.selectAll(".land")
    .datum(function() {return this.id.split('-')[1]})
    .on("mouseover", function(d) {
        tip.show(d);
        d3.select(this)
            .classed("selected", true) ;
        var parent = this.parentNode;
        var grandparent = this.parentNode.parentNode;
        grandparent.appendChild(parent);
        simple_tooltip(d);
    })
    .on("mouseout", function(d) {
        //svg.selectAll("path").classed('unselected', false);
        tip.hide(d);
        d3.select(this)
            .classed("selected", false) ;

        d3.selectAll('.tooltip').transition()
            .duration(500)
            .style("opacity", 0);
    });

function handleChoice(value, key) {
    filterStates[key] = value;
    if (value) {
        document.getElementById(key).classList.add("setted");
    } else {document.getElementById(key).classList.remove("setted");}
    update(incomeData);
}
function resetFilters() {
    filterRows.forEach(function(id) {
        console.log(id);
        var element = document.getElementById(id);
        element.classList.remove("setted");
        element.value = "";
        filterStates[id] = "";
    });
    update(incomeData);
}
function createTipContent(id) {
    var thisRegionData = _.find(nestedData, function(el){ return el.key === ua_map_id_to_labels[id]; });
    console.log(thisRegionData);
    var regionTitle = ua_map_localization_UA[ua_map_id_to_labels[id]];
    var html = "<p>" + regionTitle + "</p>" +
        "<p> Всього голосів: " + thisRegionData.values.voices + "</p>"
    return html;
}

function defineQuadrant(x, y) {
    //define quadrant in terms 'North-West-South-East'
    if (x >=0 && y >= 0) return "NE";
    if (x < 0 && y >= 0) return "NW";
    if (x >= 0 && y < 0) return "SE";
    if (x < 0 && y < 0) return "SW";
}

function collectUniqValues(arr) {
    //Return array of uniq values
    var result = {};
    arr.forEach(function(i) {
        for (var key in i) {
            //skip if key is not in setted list of filters
            if (!(filterRows.indexOf(key)+1)|| i[key] === "n/a") continue;
            if (!result[key]) result[key] = {};
            result[key][i[key]] = true;
        }
    });
    for (var key in result) {
        result[key] = d3.keys(result[key])
    }
    console.log(result);
    return result;
}

function update (csv_data) {
    chartLayout.html('');
    csv_data = csv_data.filter(function(d) {
        var filterResult = true;
        filterRows.forEach(function(key) {
            if (d[key] === 'n/a') { // if no values, skip
                filterResult = false;
                return;
            }
            if (key === 'birth') {  // if age is in filter range
                if (!filterStates[key]) return;
                var range = filterStates[key].split('-'),
                    userAge = 2016-parseInt(d.birth);
                    filterResult = (userAge >= parseInt(range[0]) && userAge <= parseInt(range[1]));
                return;
            }
            if (key !== 'birth' && (!filterStates[key] || d[key] === filterStates[key])) return; //if other parameters relies to filters
            filterResult = false
        });
        return filterResult
    });
    var nested = d3.nest()
        .key(function(d) {return d.location})
        .rollup(function(d) {
            var regionResult = {
                NE: {
                    size: 0,
                    endAngle: 1.5707963267948966,
                    padAngle: 0,
                    startAngle: 0,
                    color: "#2D728F",
                    value: "NE",

                },
                SE: {
                    size: 0,
                    endAngle: 3.141592653589793,
                    padAngle: 0,
                    startAngle: 1.5707963267948966,
                    color: "#70AE6E",
                    value: "SE"
                },
                SW: {
                    size: 0,
                    endAngle: 4.71238898038469,
                    padAngle: 0,
                    startAngle: 3.141592653589793,
                    color: "#F49E4C",
                    value: "SW"
                },
                NW: {
                    size: 0,
                    endAngle: 6.283185307179586,
                    padAngle: 0,
                    startAngle: 4.71238898038469,
                    color: "#C42021",
                    value: "NW"
                }
            };
            d.forEach(function(i) {
                ++regionResult[defineQuadrant(i.x, i.y)].size;
            });
            //Transform absolute quantity in percents
            for ( var qd in regionResult) {
                regionResult[qd].size = regionResult[qd].size/ d.length;
            }
            return {
                originalData: d,
                location: d[0].location,
                voices: d.length,
                regionDomain: [regionResult.SW.size, regionResult.NW.size, regionResult.SE.size, regionResult.NE.size],
                quadrantData: [regionResult.SW, regionResult.NW, regionResult.SE, regionResult.NE]
            };
        })
        .entries(csv_data);
    console.log(nested);
    mapPosition = document.getElementById('mapwrapper').getBoundingClientRect();
    drawSegments(nested);
    nestedData = nested;
}

function drawSegments(data) {
    var findGroupCoordinates = function(d) {
        var rootG = document.getElementById('g'+ua_map_labels_to_id[d.key]),
            parentRec = rootG ? rootG.getBoundingClientRect() : {};
        console.log(parentRec.left - mapPosition.left);
        console.log(parentRec.top - mapPosition.top);
        return "translate(" + (parentRec.left - mapPosition.left + parentRec.width/2) + "," + (parentRec.top - mapPosition.top + 50) + ")"
    };
    //if (!parentRec.top) console.log(location);
    var group = d3.select(".region-chart")
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr("class", function(d) { return d.key})
        .attr("transform", findGroupCoordinates)
        .on("mouseover", function(d) {
            var id = ua_map_labels_to_id[d.key];
            tip.show(id);
            d3.select(this)
                .classed("selected", true) ;
            var parent = this.parentNode;
            var grandparent = this.parentNode.parentNode;
            grandparent.appendChild(parent);
            simple_tooltip(id);
        })
        .on("mouseout", function(d) {
            var id = ua_map_labels_to_id[d.key];
            tip.hide(id);
            d3.select(this)
                .classed("selected", false) ;

            d3.selectAll('.tooltip').transition()
                .duration(500)
                .style("opacity", 0);
        });
        //.on('mouseover', tip.show)
        //.on('mouseout', tip.hide);

    var path = group.selectAll(".solidArc")
        .data(function(d) {return d.values.quadrantData})
        .enter()
        .append("path")
        .attr("fill", function(d) {return d.color; })
        .attr("class", "solidArc")
        .attr("stroke", "gray")
        .attr("d", arc);

    var outerPath = group.selectAll(".outlineArc")
        .data(function(d) {return d.values.quadrantData})
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("class", "outlineArc")
        .attr("d", outlineArc);
}

function iverseKeys (obj) {
    var result = {};
    for (var key in obj) {
        result[obj[key]] = key;
    }
    return result;
}

function simple_tooltip(d) {
    var thisRegionData = _.find(nestedData, function(el){ return el.key === ua_map_id_to_labels[d]; });
    var scatterplotConfig = {
        target: "#scatterplot1",
        x_param: "x",
        y_param: "y",
        x_title: "",
        y_title: "",
        scat_title: "Test",
        location: thisRegionData.key
    };
    scatterplot(thisRegionData.values.originalData, scatterplotConfig);

    var divTooltip = d3.select('#tt1');

    divTooltip.transition()
        //.delay(400)
        .duration(200)
        .style("opacity", 0.7)
        .style("left", "470px"  )
        .style("top", "-170px");

    divTooltip.select('.tooltip-text')
        .html('');

}

function scatterplot (data, config) {
    var spMargin = {top: 0, right:0, bottom: 0, left: 0},
        spWidth = 200,
        spHeight = 200,
        width = spWidth - spMargin.left - spMargin.right,
        height = spHeight - spMargin.top - spMargin.bottom,
        domain = {
            x: [-1, 0, 1],
            y: [-1, 0, 1]
        };

//Calculate SCALES
    var x = d3.scale.linear()
        .domain(domain.x)
        .range([0, width/2, width]);

    var y = d3.scale.linear()
        .domain(domain.y)
        .range([height, height/2, 0]);

    var opacityScale = d3.scale.linear()
        .domain([100, 10000])
        .range([0.7, 0.3]);
    var circleOpacity = opacityScale(data.length);

//Prepare AXES functions
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(0, ",.1s");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(0, ",.1s");

//START DRAWING
    //Add title
    d3.select(config.target)
        .html('') // clean html to avoid multiplication
        .append("p")
        .attr("class", "scatterplot-title" )
        .attr('width', spWidth+"px")
        .text("Розподіл голосів по квадрантах — " + ua_map_localization_UA[config.location]);

    var root = d3.select(config.target)
        .append('svg')
        .attr('width', spWidth)
        .attr('height', spHeight)
        .append("g")
        .attr("transform", "translate(" + spMargin.left + "," + spMargin.top + ")");

//Draw Circles
    root.append("g")
        .attr("class", "circles");

    var circlegroup = d3.select(config.target).selectAll('.circles'),
        circles = circlegroup.selectAll('.item')
            .data(data)
            .enter();

    circles.append('circle')
        .attr('class', 'item')
        .attr("cx", function (d) { return x(parseFloat(d[config.x_param])) || 0; })
        .attr("cy", function (d) { return y(parseFloat(d[config.y_param])) || 0; })
        .attr("r", "3")
        .style("fill", function (d) { return quadrantColors[defineQuadrant(d[config.x_param], d[config.y_param])]})
        .style("opacity", circleOpacity);

    //Draw Axes
    root.append("g")
        .attr("class", "x-ax axis")
        .attr("transform", "translate(0," + (y(0)) + ")")
        .call(xAxis)
        .append("text")
        .attr("x", width)
        .attr("dy", "-10px")
        .style("text-anchor", "end")
        .text(config.x_title);

    root.append("g")
        .attr("class", "y-ax axis")
        .attr("transform", "translate(" + (x(0)) + ", 0)")
        .call(yAxis)
        .append("text")
        .attr("y", 0)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(config.y_title);
}





