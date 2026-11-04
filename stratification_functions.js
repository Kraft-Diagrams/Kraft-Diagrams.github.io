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

    // Remove any previous data
    document.getElementById("Bruhat").innerHTML = "";
    document.getElementById("He").innerHTML = "";

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
        .attr("width", Math.max(400, sep_val * (Math.ceil((q + 1) / 2) + 2)) + 500)
        .attr("height", sep_val * (2 * q - 1));


    // Make the legend
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

    // Unknown
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
        .attr("font-size", "16px")
        .style("fill", "black")
        .text(`Unknown Interaction With the SS Locus`);

    // Contained In
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
        .attr("font-size", "16px")
        .style("fill", "black")
        .text(`Contained in the SS Locus`);
    // Intersects
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
        .attr("font-size", "16px")
        .style("fill", "black")
        .text(`Intersects the SS Locus`);
    // Disjoint
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
        .attr("font-size", "16px")
        .style("fill", "black")
        .text(`Disjoint From the SS Locus`);

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
                color = "#D2D1E2";
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
                .text(`(${x}, ${y})`)
                .on("click", function () {
                    // BRUHAT ORDER ---------------------------------------------
                    var bruhat = document.getElementById("Bruhat");

                    var strata = d3.select(this).text().slice(1, -1).split(", ");
                    var a = Number(strata[0]);
                    var b = Number(strata[1]);

                    bruhat.innerHTML = `<table id='bruhat-order' style="width:80%">
                        <thead>
                        <tr>
                            <th colspan="3">Bruhat Order for Strata (${a}, ${b})</th>
                        </tr>
                        <tr>
                            <th>Above</th>
                            <th>Below</th>
                            <th>Unrelated</th>
                        </tr>
                        </thead>
                        <tbody id="bruhat-body">
                            <td><ul id="bruhat-above"></ul></td>
                            <td><ul id="bruhat-below"></ul></td>
                            <td><ul id="bruhat-unrelated"></ul></td>
                        </tbody>
                        </table>`;

                    var above_list = document.getElementById("bruhat-above");
                    var below_list = document.getElementById("bruhat-below");
                    var unrelated_list = document.getElementById("bruhat-unrelated");

                    for (var i = 1; i < q; i++) {
                        for (var j = i + 1; j <= q; j++) {
                            if (i != a || j != b) {
                                if (i >= a && j >= b) {
                                    above_list.innerHTML += `<li>(${i}, ${j})</li>`;
                                } else if (i <= a && j <= b) {
                                    below_list.innerHTML += `<li>(${i}, ${j})</li>`;
                                } else {
                                    unrelated_list.innerHTML += `<li>(${i}, ${j})</li>`;
                                }
                            }
                        }
                    }

                    // HE ORDER ---------------------------------------------
                    var he = document.getElementById("He");

                    he.innerHTML = `<table id='he-order'>
                        <thead>
                        <tr>
                            <th colspan="3">He Order for Strata (${a}, ${b})</th>
                        </tr>
                        <tr>
                            <th>Above</th>
                            <th>Below</th>
                            <th>Unrelated</th>
                        </tr>
                        </thead>
                        <tbody id="he-body">
                            <td><ul id="he-above"></ul></td>
                            <td><ul id="he-below"></ul></td>
                            <td><ul id="he-unrelated"></ul></td>
                        </tbody>
                        </table>`;

                    var above_list_he = document.getElementById("he-above");
                    var below_list_he = document.getElementById("he-below");
                    var unrelated_list_he = document.getElementById("he-unrelated");

                    for (var i = 1; i < q; i++) {
                        for (var j = i + 1; j <= q; j++) {
                            if (i != a || j != b) {
                                if ((a - i) * 2 == (j - b)) {
                                    above_list_he.innerHTML += `<li>(${i}, ${j})</li>`;
                                } else if ((j - b) * 2 == (a - i)) {
                                    below_list_he.innerHTML += `<li>(${i}, ${j})</li>`;
                                } else {
                                    unrelated_list_he.innerHTML += `<li>(${i}, ${j})</li>`;
                                }
                            }
                        }
                    }

                });
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
                .text(`(${x}, ${y})`).on("click", function () {

                    // Determine which strata we clicked on
                    var strata = d3.select(this).text().slice(1, -1).split(", ");
                    var a = Number(strata[0]);
                    var b = Number(strata[1]);

                    // BRUHAT ORDER ---------------------------------------------
                    var bruhat = document.getElementById("Bruhat");

                    bruhat.innerHTML = `<table id='bruhat-order'>
                        <thead>
                        <tr>
                            <th colspan="3">Bruhat Order for Strata (${a}, ${b})</th>
                        </tr>
                        <tr>
                            <th>Above</th>
                            <th>Below</th>
                            <th>Unrelated</th>
                        </tr>
                        </thead>
                        <tbody id="bruhat-body">
                            <td><ul id="bruhat-above"></ul></td>
                            <td><ul id="bruhat-below"></ul></td>
                            <td><ul id="bruhat-unrelated"></ul></td>
                        </tbody>
                        </table>`;

                    var above_list = document.getElementById("bruhat-above");
                    var below_list = document.getElementById("bruhat-below");
                    var unrelated_list = document.getElementById("bruhat-unrelated");

                    for (var i = 1; i < q; i++) {
                        for (var j = i + 1; j <= q; j++) {
                            if (i != a || j != b) {
                                if (i >= a && j >= b) {
                                    above_list.innerHTML += `<li>(${i}, ${j})</li>`;
                                } else if (i <= a && j <= b) {
                                    below_list.innerHTML += `<li>(${i}, ${j})</li>`;
                                } else {
                                    unrelated_list.innerHTML += `<li>(${i}, ${j})</li>`;
                                }
                            }
                        }
                    }

                    // HE ORDER ---------------------------------------------
                    var he = document.getElementById("He");

                    he.innerHTML = `<table id='he-order'>
                        <thead>
                        <tr>
                            <th colspan="3">He Order for Strata (${a}, ${b})</th>
                        </tr>
                        <tr>
                            <th>Above</th>
                            <th>Below</th>
                            <th>Unrelated</th>
                        </tr>
                        </thead>
                        <tbody id="he-body">
                            <td><ul id="he-above"></ul></td>
                            <td><ul id="he-below"></ul></td>
                            <td><ul id="he-unrelated"></ul></td>
                        </tbody>
                        </table>`;

                    var above_list_he = document.getElementById("he-above");
                    var below_list_he = document.getElementById("he-below");
                    var unrelated_list_he = document.getElementById("he-unrelated");

                    for (var i = 1; i < q; i++) {
                        for (var j = i + 1; j <= q; j++) {
                            if (i != a || j != b) {
                                if ((a - i) * 2 == (j - b)) {
                                    above_list_he.innerHTML += `<li>(${i}, ${j})</li>`;
                                } else if ((j - b) * 2 == (a - i)) {
                                    below_list_he.innerHTML += `<li>(${i}, ${j})</li>`;
                                } else {
                                    unrelated_list_he.innerHTML += `<li>(${i}, ${j})</li>`;
                                }
                            }
                        }
                    }
                });
        }
    }
}

