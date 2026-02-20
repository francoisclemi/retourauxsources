// script.js
const sheetURL = "https://opensheet.elk.sh/1hRfbDCfyk5TuNR9oSvilwKK2ohTbLgRkzvwq5BoHRpw/base"; // ← remplace TON_ID_SHEET

const width = 900;
const height = 900;
const centerX = width / 2;
const centerY = height / 2;
const radius = 180;         // distance des carrés autour du centre
const squareSize = 120;     // taille des carrés ressources
const imageHeight = 60;     // hauteur de la vignette
const circleRadius = 50;    // taille des cercles matière/notion/SOURCE
const circleOffset = 5;     // distance entre carré et cercles

// Tooltip
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Fonction pour texte multi-lignes
function addMultilineText(g, text, x, y, width, lineHeight, fill, fontSize) {
  const words = text.split(" ");
  let lines = [], line = "";
  words.forEach((word) => {
    if ((line + " " + word).length > width / 6) {
      lines.push(line);
      line = word;
    } else {
      line += (line ? " " : "") + word;
    }
  });
  lines.push(line);

  lines.forEach((l,i) => {
    g.append("text")
      .attr("x", x)
      .attr("y", y + i*lineHeight)
      .attr("text-anchor","middle")
      .attr("dy","0.35em")
      .attr("fill", fill)
      .style("font-size", fontSize)
      .text(l);
  });
}

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

      // couleurs fixes
      const matColor = "#2ecc71"; // vert matière
      const notionColor = "#f39c12"; // orange notion
// créer un clipPath unique pour chaque carré
svg.append("defs")
  .append("clipPath")
  .attr("id", "clip-square-" + i)
  .append("rect")
  .attr("x", x - squareSize/2)
  .attr("y", y - squareSize/2)
  .attr("width", squareSize)
  .attr("height", squareSize)
  .attr("rx", squareSize/2)
  .attr("ry", squareSize/2);

// groupe visuel du carré
const squareGroup = svg.append("g")
  .attr("clip-path", "url(#clip-square-" + i + ")");

// fond principal
squareGroup.append("rect")
  .attr("x", x - squareSize/2)
  .attr("y", y - squareSize/2)
  .attr("width", squareSize)
  .attr("height", squareSize)
  .attr("fill", "#ccc");

// image cropée
squareGroup.append("image")
  .attr("xlink:href", item.vignette)
  .attr("x", x - squareSize/2)
  .attr("y", y - squareSize/2)
  .attr("width", squareSize)
  .attr("height", imageHeight)
  .attr("preserveAspectRatio","xMidYMid slice");

// zone grise titre
squareGroup.append("rect")
  .attr("x", x - squareSize/2)
  .attr("y", y)
  .attr("width", squareSize)
  .attr("height", squareSize/2)
  .attr("fill", "#aaa");

// texte titre
addMultilineText(
  svg,
  item.titre,
  x,
  y + squareSize/4,
  squareSize,
  14,
  "#fff",
  "12px"
);

      addMultilineText(g, item.titre, 0, squareSize/8, squareSize, 14, "#fff", "12px");

      // Position cercles matière/notion selon angle
      let dxMat, dyMat, dxNot, dyNot;
      if(angle >= -Math.PI/4 && angle < Math.PI/4) { // droite
          dxMat = squareSize/2 + circleOffset + circleRadius; dyMat = -squareSize/2 - circleRadius; // haut droit
          dxNot = squareSize/2 + circleOffset + circleRadius; dyNot = squareSize/2 + circleRadius; // bas droit
      } else if(angle >= Math.PI/4 && angle < 3*Math.PI/4) { // bas
          dxMat = -squareSize/2 - circleRadius; dyMat = squareSize/2 + circleOffset + circleRadius; // bas gauche
          dxNot = squareSize/2 + circleRadius; dyNot = squareSize/2 + circleOffset + circleRadius; // bas droit
      } else if(angle >= -3*Math.PI/4 && angle < -Math.PI/4) { // haut
          dxMat = -squareSize/2 - circleRadius; dyMat = -squareSize/2 - circleOffset - circleRadius; // haut gauche
          dxNot = squareSize/2 + circleRadius; dyNot = -squareSize/2 - circleOffset - circleRadius; // haut droit
      } else { // gauche
          dxMat = -squareSize/2 - circleOffset - circleRadius; dyMat = -squareSize/2 - circleRadius; // haut gauche
          dxNot = -squareSize/2 - circleOffset - circleRadius; dyNot = squareSize/2 + circleRadius; // bas gauche
      }

      // cercle matière
      svg.append("circle")
        .attr("cx", x + dxMat)
        .attr("cy", y + dyMat)
        .attr("r", circleRadius)
        .attr("fill", matColor);

      addMultilineText(svg, item.matiere, x + dxMat, y + dyMat, circleRadius*2, 16, "#fff", "14px");

      // cercle notion
      svg.append("circle")
        .attr("cx", x + dxNot)
        .attr("cy", y + dyNot)
        .attr("r", circleRadius)
        .attr("fill", notionColor);

      addMultilineText(svg, item.notion, x + dxNot, y + dyNot, circleRadius*2, 16, "#fff", "14px");

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
