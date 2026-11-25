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

  // Clear existing table
  var table_body = document.getElementById("strata-body");
  var table_head = document.getElementById("strata-head");
  table_body.innerHTML = "";
  table_head.innerHTML = "";

  // Filter the data -------------------------------------------------
  // Filter elements based on their dimension (q)
  let filtered_strata = Object.fromEntries(
    Object.entries(strata).filter(function (element) {
      var q = document.getElementById("q").value;
      var comp_q = document.getElementById("q_filter").value;

      if (q == "all") {
        return true;
      }
      q = Number(q);
      if (comp_q == "eq") {
        if (Math.ceil(element[0].split(",").length/2) == q) {
          return true;
        }
      } else if (comp_q == "le") {
        if (Math.ceil(element[0].split(",").length/2) <= q) {
          return true;
        }
      } else if (comp_q == "ge") {
        if (Math.ceil(element[0].split(",").length/2) >= q) {
          return true;
        }
      }
      return false;
    }),
  );

  // Filter elements based on whether they are indecomposable
  filtered_strata = Object.fromEntries(
    Object.entries(filtered_strata).filter(function (element) {
      if (
        document.getElementById("Indecomposable").checked &&
        element[1].Indecomposable == null
      ) {
        return false;
      } else if (
        document.getElementById("Indecomposable").checked &&
        element[1].Indecomposable.toString() == "true"
      ) {
        return true;
      } else if (
        document.getElementById("Indecomposable").checked &&
        element[1].Indecomposable.toString() == "false"
      ) {
        return false;
      }
      return true;
    }),
  );

  // Filter elements based on how they interact with the SS Locus
  filtered_strata = Object.fromEntries(
    Object.entries(filtered_strata).filter(function (element) {
      var interaction = document.getElementById("SS Locus").value;

      if (interaction == "all") {
        return true;
      }
      if (element[1].SS_Locus_Interaction == null) {
        return false;
      }
      if (interaction == element[1].SS_Locus_Interaction.toString()) {
        return true;
      }
      return false;
    }),
  );

  var head_row = String.raw`<tr>
                <th>Dimension q</th>
                <th>Elementary Sequence</th>
                <th>Word(s)</th>
                <th>Weyl Coset</th>
                <th>Harashita Slope</th>
                <th>TL Slope</th>
                <th>SS Locus</th>
                <th>Indecomposable</th>
                <th>Associated Unitary Stratum</th>
                <tr>`;
  table_head.insertAdjacentHTML("beforeend", head_row);

  // Fill in the table
  Object.entries(filtered_strata).forEach(([EO_Type, Properties]) => {

    // I only want to first half of the EO Type, because the second half I can base on the symmetry property
    var Elem_Seq = EO_Type.split(",").slice(0, Math.ceil(EO_Type.split(`,`).length)/2).join(", ");

    var TL = Properties.TL_Slopes.toString()
        .split(`,`)
        .join(`}, (`)
        .split(`^`)
        .join(`)^{`);
    TL = String.raw`\((${TL}}\)`;

    var table_row = String.raw`
              <td>${Number(EO_Type.split(",").length/2)}</td>
              <td>[${Elem_Seq}]</td>
              <td>[${Properties.Words.split(",").join(", ")}]</td>
              <td>[${Properties.Weyl_Coset.split(",").join(", ")}]</td>
              <td>\(${Properties.HS_Slope.toString().split(",").join("/")}\)</td>
              <td>[${TL}]</td>
              <td>${Properties.SS_Locus_Interaction}</td>
              <td>${String(Properties.Indecomposable).charAt(0).toUpperCase() + String(Properties.Indecomposable).slice(1)}</td>`;
    if (Properties.Unitary_Signatures.length == 0) {
      table_row += String.raw`
              <td></td>
            </tr>`;
      table_body.insertAdjacentHTML("beforeend", table_row);
      MathJax.typeset();
    } else {
      var strata_id = "EO--".concat(Elem_Seq.split(", ").join("-"));
      table_row += String.raw`
              <td><table>
                <thead>
                  <th>Signature</th>
                  <th>\(\gamma\) Indices</th>
                  <th>Stratum Dimension</th>
                </thead>
                <tbody id="${strata_id}-associated">
                </tbody>
              </table></td>
              <tr>`;
      
      table_row += `</tr>`;
      table_body.insertAdjacentHTML("beforeend", table_row);
      MathJax.typeset();

      // Fill in associated strata
      for (var i = 0; i < Properties.Unitary_Signatures.length; i++) {
        var associated_body = document.getElementById(
          `${strata_id}-associated`,
        );
        var associated_row = String.raw`
          <tr>
            <td>${Properties.Unitary_Signatures[i]}</td>
            <td>${Properties.Unitary_Indices[i]}</td>
            <td>${Properties.Unitary_StratumDim[i]}</td>
          </tr>
          `;
        associated_body.insertAdjacentHTML("beforeend", associated_row);
        MathJax.typeset();
      }
    }
  });
}
