// script.js
const sheetURL = "https://opensheet.elk.sh/1hRfbDCfyk5TuNR9oSvilwKK2ohTbLgRkzvwq5BoHRpw/base"; // ← remplace TON_ID_SHEET

const width = 900;
const height = 600;
const centerX = width / 2;
const centerY = height / 2;
const radius = 250;       // distance des carrés autour du centre
const squareSize = 120;   // taille du carré
const imageHeight = 60;   // hauteur de la vignette dans le carré
const circleRadius = 50;  // rayon des cercles matière/notion (même que SOURCE)
const circleOffset = 10;  // espace entre carré et cercle

// Tooltip
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

fetch(sheetURL)
  .then(res => res.json())
  .then(data => {
    const sorted = data.sort((a,b) => new Date(b.date) - new Date(a.date));
    const lastFive = sorted.slice(0,5);

    const svg = d3.select("#graph");

    // Cercle central SOURCE
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", circleRadius)
      .attr("fill", "#3498db");

    svg.append("text")
      .attr("x", centerX)
      .attr("y", centerY)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#fff")
      .style("font-size", "16px")
      .text("SOURCE");

    const angleStep = 2 * Math.PI / lastFive.length;

    lastFive.forEach((item,i) => {
      const angle = i * angleStep - Math.PI/2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // couleurs
      let matColor = "#2ecc71"; // vert pour matière
      let notionColor = "#f39c12"; // orange pour notion
      if(item.matiere.toLowerCase() === "svt") matColor = "#2ecc71";
      if(item.matiere.toLowerCase() === "français") matColor = "#e74c3c";
      if(item.matiere.toLowerCase() === "histoire") matColor = "#f1c40f";

      // groupe pour le carré + titre + image
      const g = svg.append("g")
        .attr("class","resource-group")
        .attr("transform", `translate(${x},${y})`)
        .style("cursor","pointer")
        .on("click", () => window.open(item.url,"_blank"))
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
        .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));

      // carré arrondi
      g.append("rect")
        .attr("x", -squareSize/2)
        .attr("y", -squareSize/2)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("fill", "#ccc");

      // image cropée sur le haut du carré
      g.append("image")
        .attr("xlink:href", item.vignette)
        .attr("x", -squareSize/2)
        .attr("y", -squareSize/2)
        .attr("width", squareSize)
        .attr("height", imageHeight)
        .attr("preserveAspectRatio","xMidYMid slice");

      // titre sur la moitié basse
      g.append("rect")
        .attr("x", -squareSize/2)
        .attr("y", 0)
        .attr("width", squareSize)
        .attr("height", squareSize/2)
        .attr("fill", "#aaa");

      g.append("text")
        .attr("x", 0)
        .attr("y", squareSize/4)
        .attr("text-anchor","middle")
        .attr("dy","0.35em")
        .attr("fill","#fff")
        .style("font-size","12px")
        .text(item.titre);

      // calcul position cercles matière/notion selon angle
      let dxMat, dyMat, dxNot, dyNot;
      if(angle >= -Math.PI/4 && angle < Math.PI/4) { // droite
          dxMat = squareSize/2 + circleOffset + circleRadius; dyMat = -squareSize/2; // haut droit
          dxNot = squareSize/2 + circleOffset + circleRadius; dyNot = squareSize/2; // bas droit
      } else if(angle >= Math.PI/4 && angle < 3*Math.PI/4) { // bas
          dxMat = -squareSize/2; dyMat = squareSize/2 + circleOffset + circleRadius; // bas gauche
          dxNot = squareSize/2; dyNot = squareSize/2 + circleOffset + circleRadius; // bas droit
      } else if(angle >= -3*Math.PI/4 && angle < -Math.PI/4) { // haut
          dxMat = -squareSize/2; dyMat = -squareSize/2 - circleOffset - circleRadius; // haut gauche
          dxNot = squareSize/2; dyNot = -squareSize/2 - circleOffset - circleRadius; // haut droit
      } else { // gauche
          dxMat = -squareSize/2 - circleOffset - circleRadius; dyMat = -squareSize/2; // haut gauche
          dxNot = -squareSize/2 - circleOffset - circleRadius; dyNot = squareSize/2; // bas gauche
      }

      // cercle matière
      svg.append("circle")
        .attr("cx", x + dxMat)
        .attr("cy", y + dyMat)
        .attr("r", circleRadius)
        .attr("fill", matColor);

      svg.append("text")
        .attr("x", x + dxMat)
        .attr("y", y + dyMat)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill","#fff")
        .style("font-size","14px")
        .text(item.matiere);

      // cercle notion
      svg.append("circle")
        .attr("cx", x + dxNot)
        .attr("cy", y + dyNot)
        .attr("r", circleRadius)
        .attr("fill", notionColor);

      svg.append("text")
        .attr("x", x + dxNot)
        .attr("y", y + dyNot)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill","#fff")
        .style("font-size","14px")
        .text(item.notion);

      // traits fins reliant carré aux cercles
      svg.append("line")
        .attr("x1", x) .attr("y1", y)
        .attr("x2", x + dxMat).attr("y2", y + dyMat)
        .attr("stroke", "#999")
        .attr("stroke-width", 1);

      svg.append("line")
        .attr("x1", x) .attr("y1", y)
        .attr("x2", x + dxNot).attr("y2", y + dyNot)
        .attr("stroke", "#999")
        .attr("stroke-width", 1);

    });

  })
  .catch(err => console.error(err));
