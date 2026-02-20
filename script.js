// script.js
const sheetURL = "https://opensheet.elk.sh/1hRfbDCfyk5TuNR9oSvilwKK2ohTbLgRkzvwq5BoHRpw/base";

const width = 900;
const height = 900;

const svg = d3.select("#dataviz")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const centerX = width / 2;
const centerY = height / 2;

const mainRadius = 120;
const circleRadius = 70;
const squareSize = 160;

fetch(sheetURL)
  .then(response => response.json())
  .then(data => {

    // On garde les 5 dernières ressources
    const lastFive = data.slice(-5);

    // Cercle central
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", mainRadius)
      .attr("fill", "#333");

    svg.append("text")
      .attr("x", centerX)
      .attr("y", centerY + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-size", "14px")
      .text("Ressources");

    lastFive.forEach((item, i) => {

      const angle = (i / lastFive.length) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + 300 * Math.cos(angle);
      const y = centerY + 300 * Math.sin(angle);

      // Lignes vers le centre
      svg.append("line")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#999")
        .attr("stroke-width", 1);

      // ===== CLIP PATH ARRONDI =====
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

      const squareGroup = svg.append("g")
        .attr("clip-path", "url(#clip-square-" + i + ")");

      // Fond principal
      squareGroup.append("rect")
        .attr("x", x - squareSize/2)
        .attr("y", y - squareSize/2)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("fill", "#ccc");

      // Image (partie haute)
      squareGroup.append("image")
        .attr("xlink:href", item.vignette)
        .attr("x", x - squareSize/2)
        .attr("y", y - squareSize/2)
        .attr("width", squareSize)
        .attr("height", squareSize/2)
        .attr("preserveAspectRatio", "xMidYMid slice");

      // Zone grise texte
      squareGroup.append("rect")
        .attr("x", x - squareSize/2)
        .attr("y", y)
        .attr("width", squareSize)
        .attr("height", squareSize/2)
        .attr("fill", "#aaa");

      // Texte
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

    });

  });

// ===== Fonction texte multi-lignes =====
function addMultilineText(svg, text, x, y, maxWidth, lineHeight, color, fontSize) {

  const words = text.split(" ");
  let line = "";
  let lines = [];

  words.forEach(word => {
    const testLine = line + word + " ";
    if (testLine.length * 6 > maxWidth) {
      lines.push(line);
      line = word + " ";
    } else {
      line = testLine;
    }
  });

  lines.push(line);

  const textElement = svg.append("text")
    .attr("x", x)
    .attr("y", y - (lines.length-1) * lineHeight/2)
    .attr("text-anchor", "middle")
    .attr("fill", color)
    .style("font-size", fontSize);

  lines.forEach((l, i) => {
    textElement.append("tspan")
      .attr("x", x)
      .attr("dy", i === 0 ? 0 : lineHeight)
      .text(l.trim());
  });
}
