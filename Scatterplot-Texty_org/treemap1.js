function select_group(d){
  svg.selectAll("path").classed("unselected", true);
  svg.selectAll("." + d.name).selectAll("path").classed("unselected", false);

  d3.selectAll(".nodet").classed("unselectedt", true);
  d3.select("div#" + d.name).classed("unselectedt", false);
}

function treemap(data){

  var margin = {top: 5, right: 5, bottom: 5, left: 5},
      width = 200 - margin.left - margin.right,
      height = 30 - margin.top - margin.bottom;
  
    var z = d3.scale.ordinal()
    .domain(["NA", "family", "regionals", "ukraine", "world", "russia", "state"])
    .range(["#bebebe", "#dc7889", "#32699e", "#ffcc32", "#de4406", "#777", "#98bcde"]
    //.range(["#777","#536d7a","#7da8af","#f9a962","#e24c4b","#414b54","#893b27"]  
	.map(function(c){ // add a lil bit transparency
		var tmp_color = d3.rgb(c);			
                return "rgba("+tmp_color.r+","+tmp_color.g+","+tmp_color.b+",0.9)";
	     }));
  
  var treemap = d3.layout.treemap()
      .size([width, height])
      .sticky(true)
      .mode("slice")
      //.value(function(d) { return d.size; });

  
  var div = d3.select("body").select("div#color_legend").append("div")
      .attr("class", "color-blocks")
      .style("position", "relative")
      .style("width", (width + margin.left + margin.right) + "px")
      .style("height", (height + margin.top + margin.bottom) + "px")
      .style("left", margin.left + "px")
      .style("top", margin.top + "px");

    var node = div.datum(data).selectAll(".node");
 // debugger;
  node.data(treemap.nodes)
      .enter().append("div")
        .attr("class", "node test")
        .call(position)
        .style("background", function(d) { return  z(d.name); })
        .on("mouseover", select_group)
        //.html(function(d) { return d.children ? null :  d.name; });
  
  
      node
          .data(treemap.nodes)
        .transition()
          .duration(1500)
          .call(position);
  
  function position() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
  }
}  
