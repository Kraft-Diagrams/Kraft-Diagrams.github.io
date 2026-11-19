// Grab, parse, and return the information from the JSON file
async function getData() {
    const response = await fetch("All_Strata.json");
    const data = await response.json();

    return data;
}

async function draw_stratification_diagram() {

    var q = Number(document.getElementById("q").value);

    if (q > 20 || q < 2) {
        alert("Invalid value entered!");
        return;
    }

    var div = document.getElementById("draw_diagram");
    div.innerHTML = "";
    var order_table = document.getElementById("orderings");
    order_table.innerHTML = "";

    // Get the data we'll be filtering
    var strata = await getData();

    // Filter elements based on signature (q-2, 2)
    var filtered_strata = strata.filter(function (element) {
        if (element.Signature[1].toString() == 2 && element.q.toString() == q.toString()) {
            return true;
        }
        return false;
    });

    var radius = 32; // Radius for the circles in the stratification diagrams
    var sep_val = 120; // Amount of pixels to seperate the circles in the stratification diagram
    let which_diagram = d3.select(`#draw_diagram`);
    let svg = which_diagram.append("svg")
        .attr("width", Math.max(400, sep_val * (Math.ceil((q + 1) / 2) + 2)) + 500)
        .attr("height", Math.max(500, sep_val * (2 * q - 1)));

    // DEFINE ARROWS ----------------------------------------------
    svg.append("defs")
        .append("marker")
        .attr("id", "arrowB")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 5)
        .attr("refY", 5)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M0,0L10,5L0,10")
        .attr("fill", "gray");

    svg.append("defs")
        .append("marker")
        .attr("id", "arrowC")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 5)
        .attr("refY", 5)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M0,0L10,5L0,10")
        .attr("fill", "orange");

    // MAKE THE LEGEND ----------------------------------------------
    var legend_start_x = Math.max(400, sep_val * (Math.ceil((q + 1) / 2) + 2)) + 50;
    var legend_start_y = 100;
    var legend_sep = 50;
    svg.append("text")
        .attr("x", legend_start_x - 20)
        .attr("y", legend_start_y + 10)
        .attr("text-anchor", "center")
        .attr("font-size", "24px")
        .style("fill", "black")
        .text("Legend");

    // Not Contained Within the SS Locus
    svg.append("circle")
        .attr("cx", legend_start_x)
        .attr("cy", legend_start_y + legend_sep)
        .attr("r", 20)
        .style("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 3);
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Not Contained in the SS Locus`);

    // Contained In the SS Locus
    svg.append("circle")
        .attr("cx", legend_start_x)
        .attr("cy", legend_start_y + 2 * legend_sep)
        .attr("r", 20)
        .style("fill", "#BFD6A1")
        .attr("stroke", "black")
        .attr("stroke-width", 3);
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + 2 * legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Contained in the SS Locus`);

    // Intersects the SS Locus
    svg.append("circle")
        .attr("cx", legend_start_x)
        .attr("cy", legend_start_y + 3 * legend_sep)
        .attr("r", 20)
        .style("fill", "#9ACFF1")
        .attr("stroke", "black")
        .attr("stroke-width", 3);
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + 3 * legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Intersects the SS Locus`);

    // Disjoint from the SS Locus
    svg.append("circle")
        .attr("cx", legend_start_x)
        .attr("cy", legend_start_y + 4 * legend_sep)
        .attr("r", 20)
        .style("fill", "#D2D1E2")
        .attr("stroke", "black")
        .attr("stroke-width", 3);
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + 4 * legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Disjoint From the SS Locus`);

    // Indecomposable
    svg.append("circle")
        .attr("cx", legend_start_x)
        .attr("cy", legend_start_y + 5 * legend_sep)
        .attr("r", 20)
        .style("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-dasharray", "10 5")
        .attr("stroke-width", 3);
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + 5 * legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Indecomposable`);

    svg.append("line")
        .attr("x1", legend_start_x - 20)
        .attr("x2", legend_start_x + 20)
        .attr("y1", legend_start_y + 6 * legend_sep)
        .attr("y2", legend_start_y + 6 * legend_sep)
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowC)");
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + 6 * legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Closure (He) Order`);

    svg.append("line")
        .attr("x1", legend_start_x - 20)
        .attr("x2", legend_start_x + 20)
        .attr("y1", legend_start_y + 7 * legend_sep)
        .attr("y2", legend_start_y + 7 * legend_sep)
        .attr("stroke", "gray")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowB)");
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + 7 * legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Bruhat Order`);
    // END LEGEND ----------------------------------------------

    // MAKE THE TITLE ----------------------------------------------
    svg.append("text")
        .attr("x", sep_val)
        .attr("y", 50)
        .attr("text-anchor", "center")
        .attr("font-size", "28px")
        .style("dominant-baseline", "center")
        .style("fill", "black")
        .text(`Stratification Diagram for Signature (${q - 2}, 2)`);
    // END TITLE ----------------------------------------------

    // ABOVE THE EQUATOR ----------------------------------------------
    for (var y = q; y > Math.floor((q + 2) / 2); y--) {
        let cx = sep_val * (q - y + 2);
        for (var x = y - 1; x > q - y + 1; x--) {
            let cy = sep_val * (2 * q - (x + y));

            let which_strata = filtered_strata.filter(function (element) {
                if (element.Strata[0] == x && element.Strata[1] == y) {
                    return true;
                }
                return false;
            });

            // Interior color based on the strata's interaction with the SS Locus
            let color = "white";
            if (which_strata[0].SS_Locus_Interaction == "Contained In") {
                color = "#BFD6A1";
            } else if (which_strata[0].SS_Locus_Interaction == "Intersects") {
                color = "#9ACFF1";
            } else if (which_strata[0].SS_Locus_Interaction == "Disjoint") {
                color = "#D2D1E2";
            }

            // Outline type based on whether it is Indecomposable
            if (which_strata[0].Indecomposable.toString() == "true") {
                svg.append("circle")
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("r", radius)
                    .style("fill", color)
                    .attr("stroke", "black")
                    .attr("stroke-dasharray", "10 5")
                    .attr("stroke-width", 3);
            } else {
                svg.append("circle")
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("r", radius)
                    .style("fill", color)
                    .attr("stroke", "black")
                    .attr("stroke-width", 3);
            }

            svg.append("text")
                .attr("x", cx)
                .attr("y", cy)
                .attr("text-anchor", "middle")
                .attr("font-size", "20px")
                .style("dominant-baseline", "middle")
                .style("fill", "black")
                .text(`(${x}, ${y})`)
                .on("click", function () {
                    var strata = d3.select(this).text().slice(1, -1).split(", ");
                    var a = Number(strata[0]);
                    var b = Number(strata[1]);
                    draw_partial_diagram(a, b);
                });

            // Bruhat Order First
            // Diagonal arrows
            if (y + 1 <= q) {
                svg.append("line")
                    .attr("x1", cx - sep_val + radius)
                    .attr("x2", cx - radius)
                    .attr("y1", cy - sep_val + radius)
                    .attr("y2", cy - radius)
                    .attr("stroke", "gray")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowB)");
            }
            // Vertical Lines
            if (x + 1 < q && x + 1 != y) {
                svg.append("line")
                    .attr("x1", cx)
                    .attr("x2", cx)
                    .attr("y1", cy - sep_val + radius + 7)
                    .attr("y2", cy - radius - 10)
                    .attr("stroke", "gray")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowB)");
            }
            // Closure Order Next
            if (q >= 5 && y == q - x + 2 && x >= 4 && x < q / 2 + 1) {
                svg.append("line")
                    .attr("x1", cx - (2) * sep_val + radius)
                    .attr("x2", cx - radius)
                    .attr("y1", cy - sep_val + radius - 5)
                    .attr("y2", cy - radius + 5)
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowC)");
            }

            if (q >= 7 && x >= 4 && x < q / 2 && y >= 4 + q - x && y <= q) {
                svg.append("line")
                    .attr("x1", cx + radius)
                    .attr("x2", cx + 2 * sep_val - radius)
                    .attr("y1", cy + radius - 5)
                    .attr("y2", cy + sep_val - radius + 5)
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowC)");
            }
        }
    } // END ABOVE THE EQUATOR ----------------------------------------------

    // BELOW THE EQUATOR ----------------------------------------------
    for (var x = 1; x <= Math.floor(q / 2); x++) {
        let cx = sep_val * x;
        for (var y = q + 1 - x; y >= 2 + x - 1; y--) {
            cy = sep_val * (q - 2) + sep_val * (q - y - x + 2);
            let which_strata = filtered_strata.filter(function (element) {
                if (element.Strata[0] == x && element.Strata[1] == y) {
                    return true;
                }
                return false;
            });

            let color = "white";
            if (which_strata[0].SS_Locus_Interaction == "Contained In") {
                color = "#BFD6A1";
            } else if (which_strata[0].SS_Locus_Interaction == "Intersects") {
                color = "#9ACFF1";
            } else if (which_strata[0].SS_Locus_Interaction == "Disjoint") {
                color = "#D2D1E2"
            }

            // Outline type based on whether it is Indecomposable
            if (which_strata[0].Indecomposable.toString() == "true") {
                svg.append("circle")
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("r", radius)
                    .style("fill", color)
                    .attr("stroke", "black")
                    .attr("stroke-dasharray", "10 5")
                    .attr("stroke-width", 3);
            } else {
                svg.append("circle")
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("r", radius)
                    .style("fill", color)
                    .attr("stroke", "black")
                    .attr("stroke-width", 3);
            }

            svg.append("text")
                .attr("x", cx)
                .attr("y", cy)
                .attr("text-anchor", "middle")
                .attr("font-size", "20px")
                .style("dominant-baseline", "middle")
                .style("fill", "black")
                .text(`(${x}, ${y})`)
                .on("click", function () {
                    var strata = d3.select(this).text().slice(1, -1).split(", ");
                    var a = Number(strata[0]);
                    var b = Number(strata[1]);
                    draw_partial_diagram(a, b);
                });

            // Bruhat Order First
            // Diagonal arrows
            if (x + 1 < y) {
                svg.append("line")
                    .attr("x1", cx + sep_val - radius)
                    .attr("x2", cx + radius)
                    .attr("y1", cy - sep_val + radius)
                    .attr("y2", cy - radius)
                    .attr("stroke", "gray")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowB)");
            }
            // Vertical Lines
            if (y + 1 <= q) {
                svg.append("line")
                    .attr("x1", cx)
                    .attr("x2", cx)
                    .attr("y1", cy - sep_val + radius + 7)
                    .attr("y2", cy - radius - 10)
                    .attr("stroke", "gray")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowB)");
            }
            // ClosureOrder Next
            if (q >= 5 && x == q - y + 1 && y > q / 2 + 2 && y <= q) {
                svg.append("line")
                    .attr("x1", cx + 2 * sep_val - radius)
                    .attr("x2", cx + radius)
                    .attr("y1", cy - sep_val + radius - 5)
                    .attr("y2", cy - radius + 5)
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowC)");
            }
            if (q >= 7 && x >= 3 && x < q / 2 && y > q / 2 + 1 && y <= q - x + 2) {
                svg.append("line")
                    .attr("x1", cx - radius)
                    .attr("x2", cx - 2 * sep_val + radius)
                    .attr("y1", cy + radius)
                    .attr("y2", cy + sep_val - radius)
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowC)");
            }
        }
    }
    // END BELOW THE EQUATOR ----------------------------------------------
}

async function draw_partial_diagram(clicked_x, clicked_y) {

    // clicked_x and clicked_y should be the signature clicked.

    var q = Number(document.getElementById("q").value);

    var div = document.getElementById("draw_diagram");
    div.innerHTML = "";

    // Get the data we'll be filtering
    var strata = await getData();

    // Filter elements based on signature (q-2, 2)
    var filtered_strata = strata.filter(function (element) {
        if (element.Signature[1].toString() == 2 && element.q.toString() == q.toString()) {
            return true;
        }
        return false;
    });

    var radius = 32; // Radius for the circles in the stratification diagrams
    var sep_val = 120; // Amount of pixels to seperate the circles in the stratification diagram
    let which_diagram = d3.select(`#draw_diagram`);
    let svg = which_diagram.append("svg")
        .attr("width", Math.max(400, sep_val * (Math.ceil((q + 1) / 2) + 2)) + 500)
        .attr("height", Math.max(500, sep_val * (2 * q - 1)));

    // DEFINE ARROWS ----------------------------------------------
    svg.append("defs")
        .append("marker")
        .attr("id", "arrowB")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 5)
        .attr("refY", 5)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M0,0L10,5L0,10")
        .attr("fill", "gray");

    svg.append("defs")
        .append("marker")
        .attr("id", "arrowC")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 5)
        .attr("refY", 5)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M0,0L10,5L0,10")
        .attr("fill", "orange");

    // MAKE THE LEGEND ----------------------------------------------
    var legend_start_x = Math.max(400, sep_val * (Math.ceil((q + 1) / 2) + 2)) + 50;
    var legend_start_y = 100;
    var legend_sep = 50;
    svg.append("text")
        .attr("x", legend_start_x - 20)
        .attr("y", legend_start_y + 10)
        .attr("text-anchor", "center")
        .attr("font-size", "24px")
        .style("fill", "black")
        .text("Legend");

    // Not Contained in the SS Locus
    svg.append("circle")
        .attr("cx", legend_start_x)
        .attr("cy", legend_start_y + legend_sep)
        .attr("r", 20)
        .style("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 3);
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Not Contained in the SS Locus`);

    // Contained In the SS Locus
    svg.append("circle")
        .attr("cx", legend_start_x)
        .attr("cy", legend_start_y + 2 * legend_sep)
        .attr("r", 20)
        .style("fill", "#BFD6A1")
        .attr("stroke", "black")
        .attr("stroke-width", 3);
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + 2 * legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Contained in the SS Locus`);

    // Intersects the SS Locus
    svg.append("circle")
        .attr("cx", legend_start_x)
        .attr("cy", legend_start_y + 3 * legend_sep)
        .attr("r", 20)
        .style("fill", "#9ACFF1")
        .attr("stroke", "black")
        .attr("stroke-width", 3);
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + 3 * legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Intersects the SS Locus`);

    // Disjoint from the SS Locus
    svg.append("circle")
        .attr("cx", legend_start_x)
        .attr("cy", legend_start_y + 4 * legend_sep)
        .attr("r", 20)
        .style("fill", "#D2D1E2")
        .attr("stroke", "black")
        .attr("stroke-width", 3);
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + 4 * legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Disjoint From the SS Locus`);

    // Indecomposable
    svg.append("circle")
        .attr("cx", legend_start_x)
        .attr("cy", legend_start_y + 5 * legend_sep)
        .attr("r", 20)
        .style("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-dasharray", "10 5")
        .attr("stroke-width", 3);
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + 5 * legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Indecomposable`);

    svg.append("line")
        .attr("x1", legend_start_x - 20)
        .attr("x2", legend_start_x + 20)
        .attr("y1", legend_start_y + 6 * legend_sep)
        .attr("y2", legend_start_y + 6 * legend_sep)
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowC)");
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + 6 * legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Closure (He) Order`);

    svg.append("line")
        .attr("x1", legend_start_x - 20)
        .attr("x2", legend_start_x + 20)
        .attr("y1", legend_start_y + 7 * legend_sep)
        .attr("y2", legend_start_y + 7 * legend_sep)
        .attr("stroke", "gray")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowB)");
    svg.append("text")
        .attr("x", legend_start_x + 30)
        .attr("y", legend_start_y + 7 * legend_sep + 5)
        .attr("text-anchor", "right")
        .attr("font-size", "20px")
        .style("fill", "black")
        .text(`Bruhat Order`);
    // END LEGEND ----------------------------------------------

    // MAKE THE TITLE ----------------------------------------------
    svg.append("text")
        .attr("x", sep_val)
        .attr("y", 50)
        .attr("text-anchor", "center")
        .attr("font-size", "28px")
        .style("dominant-baseline", "center")
        .style("fill", "black")
        .text(`Stratification Diagram for Signature (${q - 2}, 2)`);
    svg.append("text")
        .attr("x", sep_val * 1.5)
        .attr("y", 80)
        .attr("text-anchor", "center")
        .attr("font-size", "24px")
        .style("dominant-baseline", "center")
        .style("fill", "black")
        .text(`Ordering for Stratum (${clicked_x}, ${clicked_y})`);
    // END TITLE ----------------------------------------------

    // Indicate which node has been clicked
    if (clicked_x + clicked_y >= q + 2) {
        svg.append("circle")
            .attr("cx", sep_val * (q - clicked_y + 2))
            .attr("cy", sep_val * (2 * q - (clicked_x + clicked_y) + 0.5))
            .attr("r", radius + 5)
            .style("fill", "none")
            .attr("stroke", "deeppink")
            .attr("stroke-width", 3);
    } else {
        svg.append("circle")
            .attr("cx", sep_val * clicked_x)
            .attr("cy", sep_val * (q - 2) + sep_val * (q - clicked_y - clicked_x + 2.5))
            .attr("r", radius + 5)
            .style("fill", "none")
            .attr("stroke", "deeppink")
            .attr("stroke-width", 3);
    }


    // Use a map to indicate which strata are in the orders of the clicked strata
    // Bruhat Order
    var order_map = new Map();
    for (var x = 1; x <= q - 1; x++) {
        for (var y = 2; y <= q; y++) {
            if (x < y) {
                if ((x >= clicked_x && y >= clicked_y) || (x <= clicked_x && y <= clicked_y)) {
                    order_map.set(`${x.toString()},${y.toString()}`, 1);
                } else {
                    order_map.set(`${x.toString()},${y.toString()}`, 0.2);
                }
            }
        }
    }
    
    // Closure Order - Above the Equator
    for (var x = 2; x <= Math.ceil(q/2); x++) {
        for (var y = Math.ceil((q+2)/2); y <= q - 2; y++) {
            if (order_map.get(`${x},${y}`) == 1 && (x+y) >= q+2 && x >= clicked_x && y >= clicked_y){
                var jump = 1;
                while (y + 2*jump <= q){
                    order_map.set(`${(x-jump).toString()},${y+2*jump.toString()}`, 1);
                    jump++;
                }
            }
            if (order_map.get(`${x},${y}`) == 1 && (x+y) > q+2 && x <= clicked_x && y <= clicked_y){  
                var jump = 1;
                while (y-2*jump >= Math.ceil(q/2)+2 && (y-2*jump + x + jump) >= q+2 && x+jump < Math.ceil((q+1)/2)){
                    order_map.set(`${(x+jump).toString()},${(y-2*jump).toString()}`, 1);
                    jump++;
                }
            }
        }
    }

    // Closure Order - The Equator
    for (var x = 2; x <= Math.ceil(q/2); x++){
        var y = q + 2 - x;
        if (order_map.get(`${x},${y}`) == 1 && clicked_x + clicked_y >= q+2){
            for (var temp_y = y; temp_y > x; temp_y--){
                order_map.set(`${x.toString()},${temp_y.toString()}`, 1);
            }
            if (x > 2){
                order_map.set(`${(x-2).toString()},${(y+1).toString()}`, 1);
                for (var temp_y = y+1; temp_y > x-2; temp_y--){
                    order_map.set(`${(x-2).toString()},${temp_y.toString()}`, 1);
                }
            }
        }
        if (x >= 4 && order_map.get(`${x-1},${y+2}`) == 1 && clicked_x + clicked_y > q+2){
            order_map.set(`${x.toString()},${temp_y.toString()}`, 1);
            for (var temp_y = y; temp_y > x; temp_y--){
                order_map.set(`${x.toString()},${temp_y.toString()}`, 1);
            }
        }
    }
    
    // Closure Order - Below the Equator
    for (var x = 1; x <= Math.floor((q+1)/2); x++) {
        for (var y = 2; y <= q; y++) {
            if (order_map.get(`${x},${y}`) == 1 && x <= clicked_x && y <= clicked_y && (x+y) < q+2 && y > Math.floor(q/2) + 1){
                var jump = 1;
                while (x - 2*jump >= 1){
                    order_map.set(`${(x-2*jump).toString()},${(y+jump).toString()}`, 1);
                    jump++;
                }
            }
            if (order_map.get(`${x},${y}`) == 1 && x >= clicked_x && y >= clicked_y && (x+y) <= q+2){
                var jump = 1;
                while (x+2*jump < Math.floor((q+1)/2) && (x+2*jump + y-jump) <= q+2 && y-jump > Math.floor(q/2) + 1){
                    order_map.set(`${(x+2*jump).toString()},${(y-jump).toString()}`, 1);
                    jump++;
                }
            }

        }
    }

    // Closure Order - The Equator Pt2
    for (var x = 2; x <= Math.ceil(q/2); x++){
        var y = q + 2 - x;
        //if (order_map.get(`${x},${y}`) == 1 && ((x >= clicked_x && y >= clicked_y) || ((x - clicked_x) == (clicked_y-y)*2))){
        if (order_map.get(`${x},${y}`) == 1 && clicked_x + clicked_y < q+2){
            for (var temp_x = x; temp_x < y; temp_x++){
                order_map.set(`${temp_x.toString()},${y.toString()}`, 1);

            }
        }
        if (order_map.get(`${x-1},${y}`) == 1 && clicked_x + clicked_y < q+2){
            for (var temp_x = x; temp_x < y; temp_x++){
                order_map.set(`${temp_x.toString()},${y.toString()}`, 1);

            }
        }

        if (order_map.get(`${x-2},${y+1}`) == 1 && clicked_x + clicked_y < q+2){
            for (var temp_x = x; temp_x < y; temp_x++){
                order_map.set(`${temp_x.toString()},${y.toString()}`, 1);

            }
        }
    }

    // ABOVE THE EQUATOR ----------------------------------------------
    for (var y = q; y > Math.floor((q + 2) / 2); y--) {
        let cx = sep_val * (q - y + 2);
        for (var x = y - 1; x > q - y + 1; x--) {
            let cy = sep_val * (2 * q - (x + y) + 0.5);

            let which_strata = filtered_strata.filter(function (element) {
                if (element.Strata[0] == x && element.Strata[1] == y) {
                    return true;
                }
                return false;
            });

            var opacity = order_map.get(`${x.toString()},${y.toString()}`);

            // Interior color based on the strata's interaction with the SS Locus
            let color = "white";
            if (which_strata[0].SS_Locus_Interaction == "Contained In") {
                color = "#BFD6A1";
            } else if (which_strata[0].SS_Locus_Interaction == "Intersects") {
                color = "#9ACFF1";
            } else if (which_strata[0].SS_Locus_Interaction == "Disjoint") {
                color = "#D2D1E2";
            }

            // Outline type based on whether it is Indecomposable
            if (which_strata[0].Indecomposable.toString() == "true") {
                svg.append("circle")
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("r", radius)
                    .style("fill", color)
                    .attr("stroke", "black")
                    .attr("stroke-dasharray", "10 5")
                    .attr("stroke-width", 3)
                    .attr("opacity", opacity);
            } else {
                svg.append("circle")
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("r", radius)
                    .style("fill", color)
                    .attr("stroke", "black")
                    .attr("stroke-width", 3)
                    .attr("opacity", opacity);
            }

            svg.append("text")
                .attr("x", cx)
                .attr("y", cy)
                .attr("text-anchor", "middle")
                .attr("font-size", "20px")
                .style("dominant-baseline", "middle")
                .style("fill", "black")
                .text(`(${x}, ${y})`)
                .on("click", function () {
                    var strata = d3.select(this).text().slice(1, -1).split(", ");
                    var a = Number(strata[0]);
                    var b = Number(strata[1]);
                    draw_partial_diagram(a, b);
                })
                .attr("opacity", opacity);

            // Bruhat
            if (opacity == 1 && x+1 <= y-1 && order_map.get(`${(x+1).toString()},${(y).toString()}`) == 1){
                svg.append("line")
                    .attr("x1", cx)
                    .attr("x2", cx)
                    .attr("y1", cy - sep_val + radius + 5)
                    .attr("y2", cy - radius - 5)
                    .attr("stroke", "gray")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowB)");
            }

            if (opacity == 1 &&  y < q && order_map.get(`${(x).toString()},${(y+1).toString()}`) == 1){
                svg.append("line")
                    .attr("x1", cx - sep_val + radius)
                    .attr("x2", cx - radius)
                    .attr("y1", cy - sep_val + radius)
                    .attr("y2", cy - radius)
                    .attr("stroke", "gray")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowB)");
            }

            // Closure
            if (opacity == 1 &&  y + 2 <= q && order_map.get(`${(x-1).toString()},${(y+2).toString()}`) == 1 && x - 1 < Math.ceil(q/2)){
                svg.append("line")
                    .attr("x1", cx - 2 * sep_val + radius)
                    .attr("x2", cx - radius)
                    .attr("y1", cy - sep_val + radius)
                    .attr("y2", cy - radius)
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowC)");
            }

            if (opacity == 1 && x+y == q+2 && x-2 >= 1 && order_map.get(`${(x-2).toString()},${(y+1).toString()}`) == 1){
                svg.append("line")
                    .attr("x1", cx - radius)
                    .attr("x2", cx - 2*sep_val + radius)
                    .attr("y1", cy + radius)
                    .attr("y2", cy + sep_val - radius)
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowC)");
            }
        }
    } // END ABOVE THE EQUATOR ----------------------------------------------

    // BELOW THE EQUATOR ----------------------------------------------
    for (var x = 1; x <= Math.floor(q / 2); x++) {
        let cx = sep_val * x;
        for (var y = q + 1 - x; y >= 2 + x - 1; y--) {
            cy = sep_val * (q - 2) + sep_val * (q - y - x + 2.5);
            let which_strata = filtered_strata.filter(function (element) {
                if (element.Strata[0] == x && element.Strata[1] == y) {
                    return true;
                }
                return false;
            });

            var opacity = order_map.get(`${x.toString()},${y.toString()}`);

            let color = "white";
            if (which_strata[0].SS_Locus_Interaction == "Contained In") {
                color = "#BFD6A1";
            } else if (which_strata[0].SS_Locus_Interaction == "Intersects") {
                color = "#9ACFF1";
            } else if (which_strata[0].SS_Locus_Interaction == "Disjoint") {
                color = "#D2D1E2"
            }

            // Outline type based on whether it is Indecomposable
            if (which_strata[0].Indecomposable.toString() == "true") {
                svg.append("circle")
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("r", radius)
                    .style("fill", color)
                    .attr("stroke", "black")
                    .attr("stroke-dasharray", "10 5")
                    .attr("stroke-width", 3)
                    .attr("opacity", opacity);
            } else {
                svg.append("circle")
                    .attr("cx", cx)
                    .attr("cy", cy)
                    .attr("r", radius)
                    .style("fill", color)
                    .attr("stroke", "black")
                    .attr("stroke-width", 3)
                    .attr("opacity", opacity);
            }

            svg.append("text")
                .attr("x", cx)
                .attr("y", cy)
                .attr("text-anchor", "middle")
                .attr("font-size", "20px")
                .style("dominant-baseline", "middle")
                .style("fill", "black")
                .text(`(${x}, ${y})`)
                .on("click", function () {
                    var strata = d3.select(this).text().slice(1, -1).split(", ");
                    var a = Number(strata[0]);
                    var b = Number(strata[1]);
                    draw_partial_diagram(a, b);
                })
                .attr("opacity", opacity);

            if (opacity == 1 && y < q && order_map.get(`${x},${y+1}`) == 1){
                svg.append("line")
                    .attr("x1", cx)
                    .attr("x2", cx)
                    .attr("y1", cy - sep_val + radius + 5)
                    .attr("y2", cy - radius - 5)
                    .attr("stroke", "gray")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowB)");
            }

            if (opacity == 1 && x+1 < y && order_map.get(`${x+1},${y}`) == 1){
                svg.append("line")
                    .attr("x1", cx + sep_val - radius)
                    .attr("x2", cx + radius)
                    .attr("y1", cy - sep_val + radius)
                    .attr("y2", cy - radius)
                    .attr("stroke", "gray")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowB)");
            }

            // Closure order
            if (opacity == 1 &&  y >= Math.floor(q/2) + 2 && order_map.get(`${(x-2).toString()},${(y+1).toString()}`) == 1 && x - 2 >= 1){
                svg.append("line")
                    .attr("x1", cx - radius)
                    .attr("x2", cx - 2*sep_val + radius)
                    .attr("y1", cy + radius)
                    .attr("y2", cy + sep_val - radius)
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrowC)");
            }
        }
    }
    // END BELOW THE EQUATOR ----------------------------------------------

    // Make the tables for above/below related
    var order_table = document.getElementById("orderings");
    order_table.innerHTML = `
    <table id="order-table-bruhat">
        <tr>
            <th colspan="2">Associated Nodes Via Bruhat Ordering</th>
        </tr>
        <tr>
            <td>Above (${clicked_x}, ${clicked_y})</td>
            <td>Below (${clicked_x}, ${clicked_y})</td>
        </tr>
        <tr>
            <td><ul id="above-bruhat"></ul></td>
            <td><ul id="below-bruhat"></ul></td>
        </tr>
    </table>
    <br><br>
    <table id = "order-table-closure">
        <tr>
            <th colspan="2">Additional Nodes Associated Via Closure Ordering</th>
        </tr>
        <tr>
            <td>Above (${clicked_x}, ${clicked_y})</td>
            <td>Below (${clicked_x}, ${clicked_y})</td>
        </tr>
        <tr>
            <td><ul id="above-closure"></ul></td>
            <td><ul id="below-closure"></ul></td>
        </tr>
    </table>`;

    var aboveB = document.getElementById("above-bruhat");
    var belowB = document.getElementById("below-bruhat");
    var aboveC = document.getElementById("above-closure");
    var belowC = document.getElementById("below-closure");

    for (var x = 1; x <= q-1; x++){
        for (var y = 2; y <= q; y++){
            if (x < y && order_map.get(`${x},${y}`) == 1){
                const node = document.createElement("li");
                const text = document.createTextNode(`(${x}, ${y})`);
                node.appendChild(text);

                if (x >= clicked_x && y >= clicked_y && (x != clicked_x || y != clicked_y)){
                    aboveB.appendChild(node);
                } else if (x <= clicked_x && y <= clicked_y && (x != clicked_x || y != clicked_y)){
                    belowB.appendChild(node);
                } /*else if (clicked_x+clicked_y < q+2 && x > clicked_x){
                    aboveC.appendChild(node);
                } else if (clicked_x+clicked_y < q+2 && x < clicked_x){
                    belowC.appendChild(node);
                } else if (clicked_x + clicked_y >= q+2 && ((x > clicked_x && y < clicked_y) || (x < clicked_x && y > clicked_y)) ) {
                    belowC.appendChild(node);
                } else {
                    console.log(x, y);
                }*/

            }
        }
    }

}

