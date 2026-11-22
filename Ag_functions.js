filter_data();

// Grab, parse, and return the information from the JSON file
async function getData() {
  const response = await fetch("Ag_data.json");
  const data = await response.json();

  return data;
}

async function filter_data() {
  // Get the data we'll be filtering
  const strata = await getData();

  var table_body = document.getElementById("strata-body");
  var table_head = document.getElementById("strata-head");

  // Delete what is currently in the table, because we are going to replace it
  table_body.innerHTML = "";
  table_head.innerHTML = "";

  var draw_diagrams = document.getElementById("display_diagrams").checked;
  var draw_matrices = document.getElementById("display_matrices").checked;

  var head_row = String.raw`<tr>
                <th>Dimension q</th>
                <th>Elementary Sequence</th>
                <th>Word(s)</th>
                <th>Harashita Slope</th>
                <th>TL Slope</th>
                <th>SS Locus</th>
                <th>Indecomposible</th>
                <th>Associated Stratum</th>`;

  if (draw_matrices) {
    head_row += `
                <th>F Matrix</th>
                <th>V Matrix</th>
                `;
  }
  if (draw_diagrams) {
    head_row += `<th>Kraft Diagram</th>`;
  }
  table_head.insertAdjacentHTML("beforeend", head_row);
  MathJax.typeset();

  // Filter elements based on their dimension (q)
  let filtered_strata = Object.fromEntries(
    Object.entries(strata)
        .filter(function (element) {
        var q = document.getElementById("q").value;
        var comp_q = document.getElementById("q_filter").value;

        if (q == "all") {
            return true;
        }
        q = Number(q);
        if (comp_q == "eq") {
            if (element[0].split(",").length == q) {
                return true;
            }
        } else if (comp_q == "le") {
            if (element[0].split(",").length <= q) {
                return true;
            }
        } else if (comp_q == "ge") {
            if (element[0].split(",").length >= q) {
                return true;
            }
        }
        return false;
    })
);

  // Filter elements based on whether they are indecomposable
  filtered_strata = Object.fromEntries(
    Object.entries(filtered_strata)
        .filter(function (element) {
        if (document.getElementById("Indecomposable").checked && element[1].Indecomposable == null) {
          return false;
        } else if (document.getElementById("Indecomposable").checked && element[1].Indecomposable.toString() == "true") {
          return true;
        } else if (document.getElementById("Indecomposable").checked && element[1].Indecomposable.toString() == "false") {
          return false;
        }
        return true;
        
    })
);

// Filter elements based on whether they have associated strata
  filtered_strata = Object.fromEntries(
    Object.entries(filtered_strata)
        .filter(function (element) {
        var which = document.getElementById("which_strata").value;
        if (which == "all") {
          return true;
        }
        if (which == "nonempty" && element[1].Indecomposable == null){
          return false;
        } else if (which == "nonempty"){
          return true;
        }

        if (which == "empty" && element[1].Indecomposable == null){
          return true;
        } else if (which == "empty"){
          return false;
        }
        
    })
);

// Filter elements based on how they interact with the SS Locus
  filtered_strata = Object.fromEntries(
    Object.entries(filtered_strata)
        .filter(function (element) {
        var interaction = document.getElementById("SS Locus").value;
        
        if (interaction == "all"){
          return true;
        }
        if (element[1].SS_Locus_Interaction == null){
          return false;
        }
        if (interaction == element[1].SS_Locus_Interaction.toString()){
          return true;
        }
        return false;
        
    })
);

  // Fill in the table
  Object.entries(filtered_strata).forEach(([EO_Type, Properties]) => {        
        if (Properties.Words == null){
          var table_row = String.raw`
            <tr>
              <td>${EO_Type.split(",").length}</td>
              <td>[${EO_Type.split(",").join(", ")}]</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>`;

              if (draw_matrices){
                table_row += `
                <td></td>
                <td></td>`;
              }
            table_row += `</tr>`;
        } else {
          var strata_id = "EO-".concat(EO_Type);
          var TL = Properties.TL_Slopes.toString().split(`, `).join(`, (`).split(`^`).join(`)^`);
          TL = String.raw`\((${TL}\)`;

          var table_row = String.raw`
            <tr>
              <td>${Number(EO_Type.split(",").length)}</td>
              <td>[${EO_Type.split(",").join(", ")}]</td>
              <td>[${Properties.Words.join(", ")}]</td>
              <td>\(${Properties.HS_Slope.toString().split(',').join('/')}\)</td>
              <td>[${TL}]</td>
              <td>${Properties.SS_Locus_Interaction}</td>
              <td>${String(Properties.Indecomposable).charAt(0).toUpperCase() + String(Properties.Indecomposable).slice(1)}</td>
              <td><table>
                <thead>
                  <th>Signature</th>
                  <th>\(\gamma\) Indices</th>
                  <th>Stratum Dimension</th>
                </thead>
                <tbody id="${strata_id}-associated">
                </tbody>
              </table></td>`;
              if (draw_matrices){
                let F_matrix = String.raw`\[\begin{array}{|${"c".repeat(Number(Properties.q))}|}${Properties.F_Matrix.split(',').join('&').split(';').join('\\\\')}\end{array}\]`;
                let V_matrix = String.raw`\[\begin{array}{|${"c".repeat(Number(Properties.q))}|}${Properties.V_Matrix.split(',').join('&').split(';').join('\\\\')}\end{array}\]`;
                table_row += `
                        <td>${F_matrix}</td>
                        <td>${V_matrix}</td>
                    `;
              }
            table_row += `</tr>`;
        }
        table_body.insertAdjacentHTML("beforeend", table_row);
        MathJax.typeset();

        for (var i = 0; i < Properties.Signatures.length; i++){
          var associated_body = document.getElementById(`${strata_id}-associated`);
          var associated_row = String.raw`
          <tr>
            <td>${Properties.Signatures[i]}</td>
            <td>${Properties.Indices[i]}</td>
            <td>${Properties.StrataDim[i]}</td>
          </tr>
          `;
          associated_body.insertAdjacentHTML("beforeend", associated_row);
          MathJax.typeset();
        }
  });
}
