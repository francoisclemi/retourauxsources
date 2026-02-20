// script.js
const sheetURL = "https://opensheet.elk.sh/TON_ID_SHEET/Feuille1"; // ← remplace TON_ID_SHEET
const width = 900;
const height = 600;
const centerX = width / 2;
const centerY = height / 2;
const radius = 200;       // distance des satellites autour du centre
const circleRadius = 60;  // rayon des cercles satellites

// Créer le tooltip
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

fetch(sheetURL)
  .then(res => res.json())
  .then(data => {

    // Trier par date décroissante et prendre les 5 dernières
    const sorted = data.sort((a,b) => new Date(b.date) - new Date(a.date));
    const lastFive = sorted.slice(0, 5);

    const svg = d3.select("#graph");

    // Créer le nœud central "SOURCE"
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 50)
      .attr("fill", "#3498db");

    svg.append("text")
      .attr("x", centerX)
      .attr("y", centerY)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#fff")
      .style("font-size", "16px")
      .text("SOURCE");

    // Créer les satellites
    const angleStep = 2 * Math.PI / lastFive.length;

    lastFive.forEach((item, i) => {
      const angle = i * angleStep - Math.PI/2; // commencer en haut
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // couleur selon matière
      let color = "#95a5a6"; // défaut
      if(item.matiere.toLowerCase() === "svt") color = "#2ecc71";
      if(item.matiere.toLowerCase() === "français") color = "#e74c3c";
      if(item.matiere.toLowerCase() === "histoire") color = "#f1c40f";

      // créer un clipPath unique pour l'image
      svg.append("defs")
        .append("clipPath")
        .attr("id", "clip" + i)
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", circleRadius);

      // cercle coloré de fond
      svg.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", circleRadius)
        .attr("fill", color)
        .style("cursor","pointer")
        .on("mouseover", (event) => {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip.html(`
            <strong>${item.titre}</strong><br>
            Matière: ${item.matiere}<br>
            Notion: ${item.notion}
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0))
        .on("click", () => window.open(item.url,"_blank"));

      // image centrée, crop circulaire
      svg.append("image")
        .attr("xlink:href", item.vignette)
        .attr("x", x - circleRadius)
        .attr("y", y - circleRadius)
        .attr("width", circleRadius * 2)
        .attr("height", circleRadius * 2)
        .attr("clip-path", "url(#clip" + i + ")")
        .style("pointer-events","none"); // clic sur le cercle

      // titre sous le cercle
      svg.append("rect")
        .attr("x", x - circleRadius)
        .attr("y", y + circleRadius + 5)
        .attr("width", circleRadius * 2)
        .attr("height", 20)
        .attr("fill", color)
        .attr("rx", 5)
        .attr("ry", 5);

      svg.append("text")
        .attr("x", x)
        .attr("y", y + circleRadius + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .style("font-size", "12px")
        .text(item.titre);
    });

  })
  .catch(err => console.error(err));
