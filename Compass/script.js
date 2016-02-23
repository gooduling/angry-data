var margin = {top: 70, right: 20, bottom: 20, left: 10},
    svgWidth = 1000,
    svgHeight = 700,
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom,
    radius = 30,
    innerRadius = 0.3 * radius,
    data = {},
    zdata = {},
    filterOptions = {},
    filterStates = {},
    filterRows = ["sex", "birth", "family", "education", "job", "rich", "religion", "voting", "politics"],
    svgMap = {
    "Dnipropetrovsk":"12",
    "Donetsk":"14",
    "Zhytomyr":"18",
    "Transcarpathia":"21",
    "Zaporizhia":"23",
    "Ivano-Frankivs'k":"26",
    "Kiev City 1":"30",
    "Kyiv":"32",
    "Kirovohrad":"35",
    "Sevastpol' City":"40",
    "Crimea":"43",
    "Lviv":"46",
    "Mykolayiv":"48",
    "Odessa":"51",
    "Poltava":"53",
    "Rivne":"56",
    "Sumy":"59",
    "Ternopil'":"61",
    "Kharkiv":"63",
    "Kherson":"65",
    "Khmel'nyts'kyy":"68",
    "Cherkasy":"71",
    "Chernihiv":"74",
    "Chernivtsi":"77",
    "Luhans'k":"09",
    "Vinnytsia":"05",
    "Volyn":"07"
};

d3.csv("vox_united.csv", function(er, csv_data){
    data = csv_data.filter(function(i){return i.location != "outside_ukraine" && i.location != "not_defined"});
    update(data);
    filterOptions = collectUniqValues(data);
    //add options with uniq values in filter selects
    for (var key in filterOptions) {
        if (!(filterRows.indexOf(key)+1)) { continue}
        filterOptions[key].forEach(function(item){
            d3.selectAll("#form-wrapper ." + key)
                .append("option")
                .attr("value", item)
                .text(item)
        });
    }
});

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(function (d) {return (radius - innerRadius) * (d.size) + innerRadius;});
var outlineArc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(radius);
var svg = d3.select("#ua_map");
var chartLayout = svg.append('g')
    .attr("class", "region-chart");

function handleChoice(value, key) {
    filterStates[key] = value;
    update(data);
}

function defineQuadrant(x, y) {
    //define quadrant in terms 'North-West-South-East'
    if (x > 0 && y > 0) return "NE";
    if (x <= 0 && y > 0) return "NW";
    if (x > 0 && y <= 0) return "SE";
    if (x <= 0 && y <= 0) return "SW";
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
    return result;
}

function update (csv_data) {
    chartLayout.html('');
    csv_data = csv_data.filter(function(d) {
        var filterResult = true;
        filterRows.forEach(function(key) {
            if (!filterStates[key] || d[key] === filterStates[key]) return;
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
                    color: "#C42021",
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
                    color: "#2D728F",
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
                location: d[0].location,
                voices: d.length,
                regionDomain: [regionResult.SW.size, regionResult.NW.size, regionResult.SE.size, regionResult.NE.size],
                data: [regionResult.SW, regionResult.NW, regionResult.SE, regionResult.NE]
            };
        })
        .entries(csv_data);
    console.log(nested);
    nested.forEach(function(d){ drawSegments(d.values.data, svgMap[d.key])});
    zdata = nested;
}

function drawSegments(data, idNum, location) {
    var rootG = document.getElementById('g'+idNum),
        parentRec = rootG ? rootG.getBoundingClientRect() : {};
    //if (!parentRec.top) console.log(location);
    var chartsLayer = d3.select(".region-chart"),
        group = chartsLayer
    .append('g')
    .attr("class", location)
    .attr("transform", function(d){ return "translate(" + (parentRec.left+parentRec.width/2) + "," + parentRec.top + ")"});

    var path = group.selectAll(".solidArc")
        .data(data)
        .enter()
        .append("path")
        .attr("fill", function(d) {return d.color; })
        .attr("class", "solidArc")
        .attr("stroke", "gray")
        .attr("d", arc);
        //.on('mouseover', tip.show)
        //.on('mouseout', tip.hide);

    var outerPath = group.selectAll(".outlineArc")
        .data(data)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("class", "outlineArc")
        .attr("d", outlineArc);
}

function iverseKeys (obj) {
    var result = {};
    for (var key in obj) {
        result[obj[key]] = key;
    }
    console.log(JSON.stringify(result));
    return result;
}




