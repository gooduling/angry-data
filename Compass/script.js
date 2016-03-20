//Global functions for using in templates
var handleChoice,
    resetFilters;

(function(){
    "use strict";
//Initial variables
    {
        handleChoice = handleChoiceFn
        resetFilters = resetFiltersFn;
        var margin = {top: 70, right: 20, bottom: 20, left: 10},
            svgWidth = 1000,
            svgHeight = 700,
            width = svgWidth - margin.left - margin.right,
            height = svgHeight - margin.top - margin.bottom,
            radius = 35,
            innerRadius = 0.4 * radius,
            incomeData = {},
            nestedData = {},
            filteredData = {},
            filterOptions = {},
            filterStates = {},
            allUApercents = {},
            lang = 0,// default language of UI:  0 - UA, 1 - RU, 2 - EN
            filterRows = ["sex", "birth", "family", "education", "job", "rich", "religion", "voting", "politics", "lang"], // "quadrant"],
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
                "Dnipropetrovsk": "12",
                "Donetsk": "14",
                "Zhytomyr": "18",
                "Zakarpattia": "21",
                "Zaporizhia": "23",
                "Ivano-Frankivsk": "26",
                "Kiev City 1": "30",
                "Kyiv": "32",
                "Kirovograd": "35",
                "Sevastpol' City": "40",
                "Crimea": "43",
                "Lviv": "46",
                "Mykolaiv": "48",
                "Odessa": "51",
                "Poltava": "53",
                "Rivne": "56",
                "Sumy": "59",
                "Ternopil": "61",
                "Kharkiv": "63",
                "Kherson": "65",
                "Khmelnytsky": "68",
                "Cherkasy": "71",
                "Chernihiv": "74",
                "Chernivtsi": "77",
                "Lugansk": "09",
                "Vinnytsia": "05",
                "Volyn": "07"
            },
            ua_map_localization_UA = {
                "Dnipropetrovsk": "Дніпропетровськ",
                "Donetsk": "Донецьк",
                "Zhytomyr": "Житомир",
                "Zakarpattia": "Закарпаття",
                "Zaporizhia": "Запоріжжя",
                "Ivano-Frankivsk": "Івано-Франківськ",
                "Kiev City 1": "Київ",
                "Kyiv": "Київ",
                "Kirovograd": "Кировоград",
                "Sevastpol' City": "Севастополь0",
                "Crimea": "Крим",
                "Lviv": "Львів",
                "Mykolaiv": "Миколаїв",
                "Odessa": "Одеса",
                "Poltava": "Полтава",
                "Rivne": "Рівне",
                "Sumy": "Суми",
                "Ternopil": "Тернопіль",
                "Kharkiv": "Харків",
                "Kherson": "Херсон",
                "Khmelnytsky": "Хмельницький",
                "Cherkasy": "Черкаси",
                "Chernihiv": "Чернигів",
                "Chernivtsi": "Чернівці",
                "Lugansk": "Луганськ",
                "Vinnytsia": "Вінниця",
                "Volyn": "Луцьк"
            },
        // ua_map_id_to_labels = iverseKeys(ua_map_labels_to_id),
            localization_map = {
                "sex": {
                    m: ["Чоловіча", "Мужчина"],
                    f: ["Жіноча", "Женщина"]
                },
                "education": {
                    1: ["Повна вища освіта", "Полное высшее образование"],
                    2: ["Кандидат/доктор наук", "Кандидат/доктор наук"],
                    3: ["Неповна вища освіта", "Неполное высшее обращование"],
                    4: ["Не має освіти", "Без образования"],
                    5: ["Середня освіта", "Среднее образование"],
                    6: ["Інше", "Другое"]
                },
                "family": {
                    1: ["У шлюбі", "В браке"],
                    2: ["Неодружений/незаміжня", "Холост/незамужняя"],
                    3: ["У розлученні", "В разводе"],
                    4: ["Інше", "Другое"]
                },
                "job": {
                    1: ["Охорона здоров'я", "Здравоохранение"],
                    2: ["Мистецтво, культура, відпочинок і спорт", "Искусство, культура, отдых и спорт"],
                    3: ["Освіта, юриспруденція, громадські та державні послуги", "Образование, юриспруденция, общественные и государственные услуги"],
                    4: ["Виробництво", "Производство"],
                    5: ["На пенсії", "На пенсии"],
                    6: ["IT-сфера", "IT-сфера"],
                    7: ["Бізнес, фінанси та управління", "Бизнес, финансы и управление"],
                    8: ["Продажі та послуги", "Продажи и услуги"],
                    9: ["Студент", "Студент"],
                    10: ["Наука та дослідження", "Наука и исследования"],
                    11: ["Управлінський персонал", "Управленческий персонал"],
                    12: ["Домогосподарка", "Домохозяйка"],
                    13: ["Безробітний", "Безработный"],
                    14: ["Торгівля, транспорт і логістика", "Торговля, транспорт и логистика"],
                    15: ["Сільське господарство", "Сельское хозяйство"],
                    16: ["Інше", "Другое"],
                },
                "rich": {
                    1: "< 3000",
                    2: "3 000 - 6 000",
                    3: "6 000 - 10 000",
                    4: "10 000 - 15 000",
                    5: "15 000 - 25 000",
                    6: "25 000 - 50 000",
                    7: "> 50 000"
                },
                "religion": {
                    1: ["Православ'я", "Православие"],
                    2: ["Католицизм", "Католичество"],
                    3: ["Буддизм", "Буддизм"],
                    4: ["Протестантизм", "Протестантизм"],
                    5: ["Іудаїзм", "Иудаизм"],
                    6: ["Іслам", "Ислам"],
                    7: ["Баптизм", "Баптизм"],
                    8: ["Не маю релігійної приналежності", "Нет религиозной принадлежности"],
                    9: ["Інше", "Другое"],
                },
                "voting": {
                    1: ["Блок Петра Порошенка", "Блок Петра Порошенка"],
                    2: ["Самопоміч", "Самопомощь"],
                    3: ["Свобода", "Свобода"],
                    4: ["Радикальна партія Олега Ляшка", "Радикальная партия Олега Ляшка"],
                    5: ["Народний Фронт", "Народный Фронт"],
                    6: ["Складно відповісти", "Затрудняюсь ответить"],
                    7: ["Опозиційний блок", "Оппозиционный блок"],
                    8: ["Батьківщина", "Батькивщина"],
                    9: ["Сила Людей", "Сила Людей"],
                    10: ["Інша партія", "Другая партия"],
                    11: ["Я не голосував", "Я не голосовал"]
                },
                "politics": {
                    1: ["Цікавлюсь", "Интересуюсь"],
                    2: ["Дуже цікавлюсь", "Очень интересуюсь"],
                    3: ["Трохи цікавлюсь", "Немного интересуюсь"],
                    4: ["Зовсім не цікавлюсь", "Совсем не интересуюсь"]
                },
                "location": {
                    "12": [
                        "Дніпропетровськ",
                        "Днепропетровск",
                        "Dnipropetrovsk"
                    ],
                    "14": [
                        "Донецьк",
                        "Донецк",
                        "Donetsk"
                    ],
                    "18": [
                        "Житомир",
                        "Житомир",
                        "Zhytomyr"
                    ],
                    "21": [
                        "Закарпаття",
                        "Закарпатье",
                        "Zakarpattia"
                    ],
                    "23": [
                        "Запоріжжя",
                        "Запорожье",
                        "Zaporizhia"
                    ],
                    "26": [
                        "Івано-Франківськ",
                        "Ивано-Франковск",
                        "Ivano-Frankivsk"
                    ],
                    "30": [
                        "Київ",
                        "Киев",
                        "Kiev City 1"
                    ],
                    "32": [
                        "Київ",
                        "Киев",
                        "Kyiv"
                    ],
                    "35": [
                        "Кировоград",
                        "Кировоград",
                        "Kirovograd"
                    ],
                    "40": [
                        "Севастополь",
                        "Севастополь",
                        "Sevastpol' City"
                    ],
                    "43": [
                        "Крим",
                        "Крым",
                        "Crimea"
                    ],
                    "46": [
                        "Львів",
                        "Львов",
                        "Lviv"
                    ],
                    "48": [
                        "Миколаїв",
                        "Николаев",
                        "Mykolaiv"
                    ],
                    "51": [
                        "Одеса",
                        "Одесса",
                        "Odessa"
                    ],
                    "53": [
                        "Полтава",
                        "Полтава",
                        "Poltava"
                    ],
                    "56": [
                        "Рівне",
                        "Ровно",
                        "Rivne"
                    ],
                    "59": [
                        "Суми",
                        "Сумы",
                        "Sumy"
                    ],
                    "61": [
                        "Тернопіль",
                        "Тернополь",
                        "Ternopil"
                    ],
                    "63": [
                        "Харків",
                        "Харьков",
                        "Kharkiv"
                    ],
                    "65": [
                        "Херсон",
                        "Херсон",
                        "Kherson"
                    ],
                    "68": [
                        "Хмельницький",
                        "Хмельницкий",
                        "Khmelnytsky"
                    ],
                    "71": [
                        "Черкаси",
                        "Черкасы",
                        "Cherkasy"
                    ],
                    "74": [
                        "Чернігів",
                        "Чернигов",
                        "Chernihiv"
                    ],
                    "77": [
                        "Чернівці",
                        "Черновцы",
                        "Chernivtsi"
                    ],
                    "09": [
                        "Луганськ",
                        "Луганск",
                        "Lugansk"
                    ],
                    "05": [
                        "Вінниця",
                        "Винница",
                        "Vinnytsia"
                    ],
                    "07": [
                        "Луцьк",
                        "Луцк",
                        "Volyn"
                    ],
                    "0": [
                        "За кордоном",
                        "За границей",
                        "Out of Ukraine"
                    ]
                }
            },
            chartObjTemplate = {
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
            },
            scatterplotConfig = {
                target: "#scatterplot1",
                x_param: "x",
                y_param: "y",
                x_title: "",
                y_title: "",
                scat_title: "Test",
                location: ""
            },
            heavyChartSaved = '';
    }
//Itial elements
{
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .html(createTipContent);
    var opacityScale = d3.scale.linear()
        .range([0.3, 1])
        .clamp(true);
    var arc = d3.svg.arc()
        .innerRadius(function(d){
            //debugger;
            return innerRadius;
        })
        .outerRadius(function (d) {
            //debugger;
            return (radius - innerRadius) * (d.size) * 1 + innerRadius;
        });
    var outlineArc = d3.svg.arc()
        .innerRadius(function(d){
            //debugger;
            return innerRadius;
        })
        .outerRadius(function(d){
            //debugger;
            return radius;
        });
    var svg = d3.select("#ua_map");
    svg.on("mouseover", function () {
        if (d3.event.toElement.id === 'ua_map') {
            //console.log(d3.event.toElement.id);
            //setTimeout( function() {d3.select('#scatterplot1').html(heavyCharttml)} , 0);
            toggleScatterplots(filteredData, true);
        }
    });
    var chartLayout = svg.append('g')
        .attr("class", "region-chart");
    var mapRegions = svg.selectAll(".land")
        .datum(function () {
            return this.id.split('-')[1]
        })
        .on("mouseover", function (id) {
            // tip.show(id);
            d3.select(this)
                .classed("selected", true);
            var parent = this.parentNode;
            var grandparent = this.parentNode.parentNode;
            grandparent.appendChild(parent);
            simple_tooltip(id);
        })
        .on("mouseout", function (id) {
            //svg.selectAll("path").classed('unselected', false);
            // tip.hide(id);
            d3.select(this)
                .classed("selected", false);

            //d3.selectAll('.tooltip').transition()
            //    .duration(500)
            //    .style("opacity", 0);
        });
}
//Bind data from file
d3.csv("global_dataset.csv", function(er, csv_data){//vox_united.csv huge-simple.csv
    incomeData = csv_data.filter(function(i){return i.location != "0" && i.location != ""});
    update(incomeData);
    filterOptions = collectUniqValues(incomeData);
    //add options with uniq values in filter selects
    for (var key in filterOptions) {
        if (!(filterRows.indexOf(key)+1) || key === 'birth' || key === 'lang' || key === 'quadrant') { continue}
        filterOptions[key].forEach(function(item){
            var text = key === 'rich' ? localization_map[key][item]:localization_map[key][item][lang];
            d3.selectAll("#svgmap-form-wrapper #" + key)
                .append("option")
                .attr("value", item)
                .text(text)
        });
    }
});

function update (csv_data) {
    var uaPercentsArr = {
        SW:[],
        NW:[],
        NE:[],
        SE:[]
    };
    csv_data = csv_data.filter(function(d) {
        var filterResult = true;
        filterRows.forEach(function(key) {
            if (d[key] === 'n/a') { // if no values, skip
                filterResult = false;
                return;
            }
            if (key === 'quadrant') {  // skip
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
    filteredData = csv_data;
    nestedData = d3.nest()
        .key(function(d) {return d.location.length == 1 ? "0"+d.location:d.location })
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
                //calculate amount of voices in every quadrant by increasing quadrant's counter on every match

                ++regionResult[defineQuadrant(i.x, i.y)].size;
            });
            //Transform absolute quantity in percents
            var calculatedLength = d.length - (filterStates.quadrant ?  regionResult[filterStates.quadrant].size : 0);

            for ( var qd in regionResult) {
                // if setted, exclude quadrant from the range
                regionResult[qd].originalSize  = regionResult[qd].size;
                regionResult[qd].size = qd === filterStates.quadrant ? 0 : regionResult[qd].size/calculatedLength;
                uaPercentsArr[qd].push(regionResult[qd].size);
            }
            //console.log(d.length + " " + calculatedLength);
            return {
                originalData: d,
                location: d[0].location,
                voices: d.length,
                voices2: regionResult.SW.size+ regionResult.NW.size+ regionResult.SE.size+ regionResult.NE.size,
                regionDomain: {
                    SW: d3.round(regionResult.SW.size, 2),
                    NW: d3.round(regionResult.NW.size, 2),
                    SE: d3.round(regionResult.SE.size, 2),
                    NE: d3.round(regionResult.NE.size, 2)
                },
                quadrantData: [regionResult.SW, regionResult.NW, regionResult.SE, regionResult.NE]
            };
        })
        .entries(csv_data);

    var mapPosition = document.getElementById('mapwrapper').getBoundingClientRect();

    chartLayout.html('');

    drawUAchart(csv_data, uaPercentsArr);
    drawSegments(nestedData, mapPosition);
    {
        //Set opacity of regions depending on amount of voices
        var voices = nestedData.map(function (el) {
            return el.values.voices
        }).sort(d3.descending);
        voices.shift(); //Remove the biggest value to make scale less contrast
        var opacityDomain = d3.extent(voices);
        opacityScale.domain(opacityDomain);
        var mapRegions = svg.selectAll(".land")
            .datum(function () {
                return this.id.split('-')[1]
            })
            .style("fill-opacity", function (id) {
                var thisData = _.find(nestedData, function (el) {
                    return el.key === id;
                });
                if (!thisData) return 0.2;
                return opacityScale(thisData.values.voices);
            });
    }
    heavyChartSaved = false;
    toggleScatterplots(csv_data, true);
}

function toggleScatterplots(data, allUA) {
    var idShow = allUA ? "scatterplot2" : "scatterplot1",
        idHide = allUA ? "scatterplot1" : "scatterplot2";
    document.getElementById(idHide).style.display = 'none';
    document.getElementById(idShow).style.display = 'block';
    if (allUA && heavyChartSaved) return;
    scatterplotConfig.target = '#' + idShow;
    setTimeout(function() {scatterplot(data, scatterplotConfig, allUA)}, 0);
}

function drawUAchart(csv_data, uaPercentsArr) {
    radius = 64;
    innerRadius = 0.3*radius;
    var tpl = chartObjTemplate,
        array;
    for ( var qd in tpl) {
        tpl[qd].size = allUApercents[qd] = d3.round(d3.mean(uaPercentsArr[qd]), 2);
    }
    array = [tpl.NE, tpl.SE, tpl.NW, tpl.SW];

    d3.select(".total-voices").html('')
        .append("p").text("Вся Україна: " + csv_data.length + " голосів.");

    var allUasvg = d3.select("#ua-chart .total-chart")
        .attr('width', 250)
        .attr('height', 130)
        .html('')
        .append('g')
        .attr("class", "allua-chart")
        .attr("transform", "translate(125, 65)");

    var path = allUasvg.selectAll(".solidArc")
        .data(array)
        .enter()
        .append("path")
        .attr("fill", function(d) {return d.color; })
        .attr("class", "solidArc")
        //.attr("stroke", "gray")
        .attr("d", arc);

    var outpath = allUasvg.selectAll(".outlineArc")
        .data(array)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("class", "outlineArc-all")
        .attr("d", outlineArc);
}
function drawSegments(data, mapPosition) {
    radius = 35;
    innerRadius = 0.4 * radius;
    var findGroupCoordinates = function(d) {
        var rootG = document.getElementById('g'+d.key),
            parentRec = rootG ? rootG.getBoundingClientRect() : {},
            correction = d.key == "77" ? {x: 5, y: -30} : {x:0, y:0}; //if Chernivtsi region - move chart
        return "translate(" + (parentRec.left - mapPosition.left + parentRec.width/2 + correction.x) + "," + (parentRec.top - mapPosition.top + 50 + correction.y) + ")"
    };

    var group = d3.select(".region-chart")
        .selectAll('g')
        .data(data)
        .enter();

    var circle = group
        .append('g')
        .attr("class", function(d) { return localization_map.location[d.key][2] + " quadrants-ring"})
        .attr("transform", findGroupCoordinates)
        .on("mouseover", function(d) {
            //d3.select(this).attr("transform", function(d) { return findGroupCoordinates(d) + " scale(1.7, 1.7)"});
            var id = d.key;
            //tip.show(id);
            d3.select(this)
                .classed("selected", true) ;
            var parent = this.parentNode;
            var grandparent = this.parentNode.parentNode;
            grandparent.appendChild(parent);
            simple_tooltip(id);
        })
        .on("mouseout", function(d) {
            //d3.select(this).attr("transform", function(d) { return findGroupCoordinates(d)});
            var id = d.key;
           // tip.hide(id);
            d3.select(this)
                .classed("selected", false) ;

            //d3.selectAll('.tooltip').transition()
            //    .duration(500)
            //    .style("opacity", 0);
        });
        //.on('mouseover', tip.show)
        //.on('mouseout', tip.hide);

    //Number of voices inside circle
    circle.append('text')
        .attr("class", "number-in-ring")
        .attr("transform", "translate(0,3)")
        .style("text-anchor", "middle")
        .text(function(d){ return d.values.voices});

    var outerPath = circle.selectAll(".outlineArc")
        .data(function(d) {return d.values.quadrantData})
        .enter()
        .append("path")
        //.attr("fill", "none")
        .attr("class", "outlineArc")
        .attr("d", outlineArc);

    var path = circle.selectAll(".solidArc")
        .data(function(d) {return d.values.quadrantData})
        .enter()
        .append("path")
        .attr("fill", function(d) {return d.color; })
        .attr("class", "solidArc")
        //.attr("stroke", "gray")
        .attr("d", arc);
}

function simple_tooltip(id) {
    var thisRegionData = _.find(nestedData, function(el){ return el.key === id; });
    if (!thisRegionData) return;
    scatterplotConfig.location = thisRegionData.key;
    //= {
    //    target: "#scatterplot1",
    //    x_param: "x",
    //    y_param: "y",
    //    x_title: "",
    //    y_title: "",
    //    scat_title: "Test",
    //    location: thisRegionData.key
    //};
    //scatterplot(thisRegionData.values.originalData, scatterplotConfig);
    thisRegionData.values.originalData.percents = thisRegionData.values.regionDomain;
    toggleScatterplots(thisRegionData.values.originalData);

    var divTooltip = d3.select('#customtooltip');

    //divTooltip.transition()
    //    //.delay(400)
    //    .duration(200)
    //    .style("opacity", 0.7)
    //    //.style("left", "0px"  )
    //    //.style("top", "0px");

    divTooltip.select('.tooltip-text')
        .html('');

}
function scatterplot (data, config, allUkraine) {
    var spMargin = {top: 0, right:0, bottom: 0, left: 0},
        spWidth = 250,
        spHeight = 250,
        width = spWidth - spMargin.left - spMargin.right,
        height = spHeight - spMargin.top - spMargin.bottom,
        regionTipLabel = !allUkraine ? localization_map.location[config.location][lang] + ': ': 'Вся Україна.',
        percents = allUkraine ? allUApercents : data.percents,
        domain = {
            x: [-1, 0, 1],
            y: [-1, 0, 1]
        };
percents.SW = d3.round((1 - (percents.NW + percents.NE + percents.SE)), 2);

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

    var target = d3.select(config.target);

//START DRAWING
    target.html('') // clean html to avoid multiplication
    var legendGroup = target.append("div").attr("class", "legendgroup" );
    //legendGroup
      //  .append("p")
        //.attr("class", "scatterplot-title" )
        //.attr('width', spWidth+"px")
        //.text("Розподіл голосів по квадрантах");

    legendGroup
        .append("p")
        .attr("class", "scatterplot-title" )
        .attr('width', spWidth+"px")
        .text(regionTipLabel + data.length + " голосів.");
    var root = target
        .append('svg')
        .attr('width', spWidth)
        .attr('height', spHeight)
        .append("g")
        .attr("transform", "translate(" + spMargin.left + "," + spMargin.top + ")");

    root.append("text")
        .attr("class", "scatterplot-percents" )
        .attr("transform", "translate(10, 20)")
        .text(d3.round(percents.NW * 100) + '%');
    root.append("text")
        .attr("class", "scatterplot-percents" )
        .attr("transform", "translate(" + (spWidth - 30) + ", 20)")
        .text(d3.round(percents.NE * 100) + '%');
    root.append("text")
        .attr("class", "scatterplot-percents" )
        .attr("transform", "translate(" + (spWidth - 30) + ", " + (spHeight - 10) +")")
        .text(d3.round(percents.SE * 100) + '%');
    root.append("text")
        .attr("class", "scatterplot-percents" )
        .attr("transform", "translate(10," + (spHeight - 10) +")")
        .text(d3.round(percents.SW * 100) + '%');

//Draw Circles
    root.append("g")
        .attr("class", "circles");

    var circlegroup = target.selectAll('.circles'),
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

    heavyChartSaved = allUkraine;
}
function handleChoiceFn(value, key) {
    filterStates[key] = value;
    if (value) {
        document.getElementById(key).classList.add("setted");
    } else {document.getElementById(key).classList.remove("setted");}
    update(incomeData);
}
function resetFiltersFn() {
    filterRows.forEach(function(id) {
        var element = document.getElementById(id);
        element.classList.remove("setted");
        element.value = "";
        filterStates[id] = "";
    });
    update(incomeData);
}
function createTipContent(id) {
    var thisRegionData = _.find(nestedData, function(el){ return el.key === id; });
    var regionTitle = localization_map.location[id][lang];
    var html = "<p>" + regionTitle + "</p>";
    // +"<p> Всього голосів: " + thisRegionData.values.voices + "</p>"
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
            if (!(filterRows.indexOf(key)+1)|| i[key] === "n/a" || !i[key]) continue;
            if (!result[key]) result[key] = {};
            result[key][i[key]] = true;
        }
    });
    for (var key in result) {
        result[key] = d3.keys(result[key])
    }
    // console.log( JSON.stringify(result, null, '\t'));
    return result;
}
function iverseKeys (obj) {
    var result = {};
    for (var key in obj) {
        result[obj[key]] = key;
    }
    return result;
}
})();