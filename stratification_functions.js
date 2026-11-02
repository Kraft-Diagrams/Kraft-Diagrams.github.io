// Grab, parse, and return the information from the JSON file
async function getData() {
    const response = await fetch("All_Strata.json");
    const data = await response.json();

    return data;
}

async function draw_stratification_diagram() {

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

    var sep_val = 75;
    let which_diagram = d3.select(`#draw_diagram`);
    let svg = which_diagram.append("svg")
        .attr("width", Math.max(400, sep_val * (Math.ceil((q + 1) / 2) + 2)))
        .attr("height", sep_val * (2 * q - 1));

    // Make the title
    svg.append("text")
        .attr("x", 200)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .style("dominant-baseline", "middle")
        .style("fill", "black")
        .text(`Stratification Diagram for Signature (${q - 2}, 2)`);

    // ABOVE THE EQUATOR
    for (var y = q; y > Math.floor((q + 2) / 2); y--) {
        let cx = sep_val * (q - y + 2);
        for (var x = y - 1; x > q - y + 1; x--) {
            let cy = sep_val * (2 * q - (x + y) + 1);

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
            svg.append("circle")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", 30)
                .style("fill", color)
                .attr("stroke", "black")
                .attr("stroke-width", 3);
            svg.append("text")
                .attr("x", cx)
                .attr("y", cy)
                .attr("text-anchor", "middle")
                .attr("font-size", "20px")
                .style("dominant-baseline", "middle")
                .style("fill", "black")
                .text(`(${x}, ${y})`);
        }
    } // End "Above the Equator"
    // Below the Equator
    for (var x = 1; x <= Math.floor(q / 2); x++) {
        let cx = sep_val * x;
        for (var y = q + 1 - x; y >= 2 + x - 1; y--) {
            cy = sep_val * (q - 2) + sep_val * (q - y - x + 2 + 1);
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
            svg.append("circle")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", 30)
                .style("fill", color)
                .attr("stroke", "black")
                .attr("stroke-width", 3);
            svg.append("text")
                .attr("x", cx)
                .attr("y", cy)
                .attr("text-anchor", "middle")
                .attr("font-size", "20px")
                .style("dominant-baseline", "middle")
                .style("fill", "black")
                .text(`(${x}, ${y})`);
        }
    }
}