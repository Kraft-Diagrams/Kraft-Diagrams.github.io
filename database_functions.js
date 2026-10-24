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
        let new_row = `
                    <tr id="${s.q.toString().concat('__', s.Strata.toString().split(',').join('_'))}" onClick="draw_kraft_diagram(this.id)">
                        <td>${s.q.toString()}</td>
                        <td>(${s.Signature.toString().split(',').join(', ')})</td>
                        <td>${s.Strata.toString().split(',').join(', ')}</td>
                        <td>${s.Words.join(', ')}</td>
                        <td>[${s.EO_Type.toString().split(',').join(', ')}]</td>
                        <td>${s.Hirashita_Slope.toString().split(',').join('/')}</td>
                        <td>[${s.TL_Slope.toString()}]</td>
                        <td>${s.Indecomposible}</td>
                        <td>${s.SS_Locus_Interaction}</td>
                    </tr>`;
        table_body.insertAdjacentHTML("beforeend", new_row);
    }
    console.log(table_body);

}

async function draw_kraft_diagram(strata_id) {

    // Get the data we'll be filtering
    var strata = await getData();
    const strata_q = strata_id.split('__')[0];
    const strata_indices = strata_id.split('__')[1].split('_').join(',');

    // Find the particular strata clicked on in the JSON file 
    // This is super inefficient, but I'll deal with that later
    strata = strata.filter(function (element) {
        if (element.q.toString() == strata_q && element.Strata.toString() == strata_indices) {
            return true;
        }
        return false;
    });

}