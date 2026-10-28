filter_data();

// Grab, parse, and return the information from the JSON file
async function getData() {
    const response = await fetch("All_Strata.json");
    const data = await response.json();

    return data;
}

async function filter_data() {

    // Get the data we'll be filtering
    const strata = await getData();

    var table_body = document.getElementById("strata-body");

    // Delete what is currently in the table, because we are going to replace it
    table_body.innerHTML = "";

    // Filter elements based on their dimension (q)
    filtered_strata = strata.filter(function (element) {
        var q = document.getElementById("q").value;
        var comp_q = document.getElementById("q_filter").value;

        if (q == "all") {
            return true;
        }
        if (comp_q == "eq") {
            if (element.q.toString() == q) {
                return true;
            }
        } else if (comp_q == "le") {
            if (element.q.toString() <= q) {
                return true;
            }
        } else if (comp_q == "ge") {
            if (element.q.toString() >= q) {
                return true;
            }
        }
        return false;
    });

    // Filter elements based on signature (a, b)
    filtered_strata = filtered_strata.filter(function (element) {
        var b = document.getElementById("b").value;

        if (b == "all") {
            return true;
        }
        if (element.Signature[1].toString() == b) {
            return true;
        }
        return false;
    });

    // Filter based on whether it is indecomposible
    filtered_strata = filtered_strata.filter(function (element) {
        if (document.getElementById("indecomposible").checked && element.Indecomposible.toString() == "true") {
            return true;
        } else if (document.getElementById("indecomposible").checked && element.Indecomposible.toString() == "false") {
            return false;
        }
        return true;
    });

    // Filter based on the strata's interaction with the SS Locus
    filtered_strata = filtered_strata.filter(function (element) {
        var interaction = document.getElementById("SS Locus").value;
        if (interaction == "all" || interaction == element.SS_Locus_Interaction.toString()) {
            return true;
        }
        return false;
    });

    for (s of filtered_strata) {
        var strata_id = "strata-".concat(s.q.toString().concat('__', s.Strata.toString().split(',').join('_')));
        let new_row = `
                    <tr>
                        <td>${s.q.toString()}</td>
                        <td>(${s.Signature.toString().split(',').join(', ')})</td>
                        <td>${s.Strata.toString().split(',').join(', ')}</td>
                        <td>${s.Words.join(', ')}</td>
                        <td>[${s.EO_Type.toString().split(',').join(', ')}]</td>
                        <td>${s.Hirashita_Slope.toString().split(',').join('/')}</td>
                        <td>[${s.TL_Slope.toString()}]</td>
                        <td>${String(s.Indecomposible).charAt(0).toUpperCase() + String(s.Indecomposible).slice(1)}</td>
                        <td>${s.SS_Locus_Interaction}</td>
                        <td><div id="${strata_id}"></div></td>
                    </tr>`;
        table_body.insertAdjacentHTML("beforeend", new_row);
        draw_kraft_diagram(strata_id);
    }
}

async function draw_kraft_diagram(strata_id) {

    // Get the data we'll be filtering
    var strata = await getData();
    const strata_q = strata_id.split('-')[1].split('__')[0];
    const strata_indices = strata_id.split('__')[1].split('_').join(',');

    // Find the particular strata clicked on in the JSON file 
    // This is super inefficient, but I'll deal with that later
    strata = strata.filter(function (element) {
        if (element.q.toString() == strata_q && element.Strata.toString() == strata_indices) {
            return true;
        }
        return false;
    });

    strata = strata[0];

    console.log(strata);
    // Add place for an SVG in the webpage
    //var plot_div = document.getElementById("plot_graph");
    //plot_div.innerHTML = `<svg width="400" height="${strata.q * 120}"></svg>`

    let which_row = d3.select(`#${strata_id}`);
    let svg = which_row.append("svg")
        .attr("width", 400)
        .attr("height", strata.q*120);

    svg.append("defs")
            .append("marker")
            .attr("id", "arrowV")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto-start-reverse")
            .append("path")
            .attr("d", "M0,0L10,5L0,10")
            .attr("fill", "purple");

    svg.append("defs")
            .append("marker")
            .attr("id", "arrowF")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto-start-reverse")
            .append("path")
            .attr("d", "M0,0L10,5L0,10")
            .attr("fill", "orange");

    var source = "";
    var target = "";
    var type = "";

    // Make the title
    svg.append("text")
            .attr("x", 200)
            .attr("y", 35)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .style("dominant-baseline", "middle")
            .style("fill", "black")
            .text(`q = ${strata.q}, Strata = [${strata.Strata.toString().split(",").join(", ")}]`);

    // Draw the edges first
    for (edge of strata.Graph){
        source = edge.source.substring(1, edge.source.length - 1).split(", ");
        target = edge.target.substring(1, edge.target.length - 1).split(", ");
        type = edge.type;

        if (source[0] == "1") {
            var x1 = 135;
            var x2 = 265;
        } else {
            var x1 = 265;
            var x2 = 135;
        }
        var offset = 5;
        if (type == "V"){
            svg.append("line")
                .attr("x1", x1)
                .attr("x2", x2)
                .attr("y1", (Number(source[1]) * 100) + offset)
                .attr("y2", (Number(target[1]) * 100) + offset)
                .attr("stroke", "purple")
                .attr("stroke-width", 3)
                .attr("marker-end", "url(#arrowV)");
        } else if (type == "F") {
            svg.append("line")
                .attr("x1", x1)
                .attr("x2", x2)
                .attr("y1", (Number(source[1]) * 100) - offset)
                .attr("y2", (Number(target[1]) * 100) - offset)
                .attr("stroke", "orange")
                .attr("stroke-width", 3)
                .attr("marker-end", "url(#arrowF)");
        } 
    }

    // Next, draw the nodes
    for (var i = 1; i <= strata.q; i++){
        var x1 = 100;
        var x2 = 300;
        
        svg.append("circle")
            .attr("cx", x1)
            .attr("cy", i*100)
            .attr("r", 30)
            .style("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 3);

        svg.append("text")
            .attr("x", x1)
            .attr("y", i*100)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .style("dominant-baseline", "middle")
            .style("fill", "black")
            .text(`(1, ${i})`);

        svg.append("circle")
            .attr("cx", x2)
            .attr("cy", i*100)
            .attr("r", 30)
            .style("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 3);

        svg.append("text")
            .attr("x", x2)
            .attr("y", i*100)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .style("dominant-baseline", "middle")
            .style("fill", "black")
            .text(`(2, ${i})`);
    }

}