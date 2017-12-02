var width = window.innerWidth,
    height = window.innerHeight,
    active = d3.select(null);

var projection = d3.geoAlbersUsa() // updated for d3 v4
    .scale(2000)
    .translate([width / 2, height / 2]);

var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);
    // no longer in d3 v4 - zoom initialises with zoomIdentity, so it's already at origin
    // .translate([0, 0]) 
    // .scale(1) 

var path = d3.geoPath() // updated for d3 v4
    .projection(projection);


var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

// svg.append("rect")
//     .attr("class", "background")
//     .attr("width", width)
//     .attr("height", height)
//     .attr("fill", "#c1c1c1")
//     .on("click", reset);

var g = svg.append("g");

svg.call(zoom); // delete this line to disable free zooming
    // .call(zoom.event); // not in d3 v4
    

d3.json("usTopo.json", function(error, us) {
    
    if (error) throw error;

    var data = topojson.feature(us, us.objects.states).features;

    d3.tsv("stateNames.tsv", function(tsv){ // Added to label states
        names = {};
        tsv.forEach(function(d){
        names[d.id]   = d.name;
        });

    g.selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("class", "feature")
        .on("click", clicked)
        .attr("d", path)
        .on("mousemove", label)
        .on("mouseout", function() {
                $(this).attr("fill-opacity", "1.0");
                $("#tooltip-container").hide();
            });

    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "mesh")
        .attr("d", path);

    g.append("svg:text").on("click", clicked);

    g.on("mouseover", function(){
        
        txt // Added to show labels for each state
        .attr("class", "states-names")
        .selectAll("text")
        .data(data)
        .enter()
        .append("svg:text")
        .text(function(d){
          return names[d.id];
        })
        .attr("x", function(d){
            return path.centroid(d)[0];
        })
        .attr("y", function(d){
            return  path.centroid(d)[1];
        })
        .attr("text-anchor","middle")
        .attr('fill', 'white');
    });
        
    });
});


function label(d) {
    var html = "";

    html += "<div class=\"tooltip_kv\">";
    html += "<span class=\"tooltip_key\">";
    html += names[d.id];
    html += "</span>";
    html += "</div>";
    
    $("#tooltip-container").html(html);
    $(this).attr("fill-opacity", "0.8");
    $("#tooltip-container").show();
    
    var coordinates = d3.mouse(this);
    
    var map_width = $('.feature')[0].getBoundingClientRect().width;
    
    if (d3.event.layerX < map_width / 2) {
      d3.select("#tooltip-container")
        .style("top", (d3.event.layerY + 15) + "px")
        .style("left", (d3.event.layerX + 15) + "px");
    } else {
      var tooltip_width = $("#tooltip-container").width();
      d3.select("#tooltip-container")
        .style("top", (d3.event.layerY + 15) + "px")
        .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
    }
}

function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
      .duration(750)
      // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
      .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); // updated for d3 v4

    g.append("svg:text")
    .text("mystring")
    .attr("x", function(d){
        return path.centroid(d)[0];
    })
    .attr("y", function(d){
        return  path.centroid(d)[1];
    })
    .attr("text-anchor","middle")
    .attr('fill', 'white');

}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
      .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
}

function zoomed() {
  g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
  // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
  g.attr("transform", d3.event.transform); // updated for d3 v4
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}