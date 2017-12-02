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

// svg.call(zoom); // delete this line to disable free zooming
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
        .on("mousemove", function(d) {
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
        })
        .on("mouseout", function() {
                $(this).attr("fill-opacity", "1.0");
                $("#tooltip-container").hide();
            });

    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "mesh")
        .attr("d", path);

    g.append("svg:text").on("click", clicked);
    
    console.log(path.centroid("M742.8645443582863,399.6072798101868L766.0288623142962,401.5720857515164L778.5065633609491,402.58696967169703L783.5094365459391,402.96246210552204L802.5030579163972,404.36557455774005L803.3452263883506,404.4206912699426L818.1656760431589,405.41406192153863L817.627703250161,414.2941613965347L817.5111084624081,416.12291948080315L816.9340730600645,425.1735655455425L816.7306674574194,428.36392805995706L815.9454608879523,440.53021484555234L815.0409906015824,455.6178854221869L815.0278683780423,455.82376521288575L814.119995785494,471.1270669154196L813.9461697563067,474.1585800475923L813.1921208485404,486.4524669073644L813.0171909701085,489.35149697129987L812.2508398459198,501.5376502776105L812.2269180286153,501.76000031019817L811.1315332123048,520.194189247035L810.9303545576329,523.5091499966052L810.3591569427338,532.4826412520829L809.4633537103992,546.3996602387335L783.031489194289,544.3514669443955L780.7193566442356,544.1740919318204L755.3390707926808,542.2969211320697L723.7912471652764,539.4749118306117L721.9857146536125,539.3036284758166L708.3202991407165,537.912843541005L700.3931417088552,537.1063246665583L687.4992911615105,535.7667515228834L661.613472025424,532.5504815856889L659.9508340690086,532.3491841279711L635.3589691374036,529.2631165515331L617.1380682255235,526.826691036976L619.528609137569,509.8790712241473L621.4892504325594,496.0400469242545L622.7806905207422,486.54482188869474L623.9822622734953,474.3653008206095L628.4038961550524,444.1405987007224L629.0263251335984,439.56628158661783L629.8115859510422,433.88372131262736L632.531892840211,414.26741164177815L634.6745672513929,399.2433751585229L636.3001287111201,387.1347312451446L665.6186700122576,390.9604462742002L681.1937872513149,392.84151919110514L693.104709444274,394.24698449971197L707.0792455750861,395.93602461771525L710.440486997375,396.3419586910254L734.1833126483186,398.77070142659136Z")[0]);

    // g.on("mouseover", function(){
        
    //     txt // Added to show labels for each state
    //     .attr("class", "states-names")
    //     .selectAll("text")
    //     .data(data)
    //     .enter()
    //     .append("svg:text")
    //     .text(function(d){
    //       return names[d.id];
    //     })
    //     .attr("x", function(d){
    //         return path.centroid(d)[0];
    //     })
    //     .attr("y", function(d){
    //         return  path.centroid(d)[1];
    //     })
    //     .attr("text-anchor","middle")
    //     .attr('fill', 'white');
    // });
        
    });
});


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