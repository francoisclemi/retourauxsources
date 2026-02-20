// script.js
const sheetURL = "https://opensheet.elk.sh/1hRfbDCfyk5TuNR9oSvilwKK2ohTbLgRkzvwq5BoHRpw/base"; // ← remplace TON_ID_SHEET

document.addEventListener("DOMContentLoaded", function () {

const width = 900;
const height = 900;
const centerX = width / 2;
const centerY = height / 2;

const sourceRadius = 90;
const circleRadius = sourceRadius;
const squareSize = 180;
const distanceFromCenter = 170; // rapproché du centre

const svg = d3.select("#visualisation")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

function addMultilineText(svg, text, x, y, maxWidth, lineHeight, fill, fontSize = "13px") {
  const words = text.split(" ");
  let line = "";
  let lineNumber = 0;

  const textElement = svg.append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", fill)
    .attr("font-size", fontSize)
    .attr("font-weight", "bold");

  words.forEach((word) => {
    const testLine = line + word + " ";
    if (testLine.length > 18) {
      textElement.append("tspan")
        .attr("x", x)
        .attr("dy", lineNumber === 0 ? 0 : lineHeight)
        .text(line);
      line = word + " ";
      lineNumber++;
    } else {
      line = testLine;
    }
  });

  textElement.append("tspan")
    .attr("x", x)
    .attr("dy", lineNumber === 0 ? 0 : lineHeight)
    .text(line);
}

function addCircleWithText(x, y, text, color) {
  svg.append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", circleRadius)
    .attr("fill", color);

  addMultilineText(svg, text, x, y, circleRadius * 1.6, 14, "white");
}

fetch("data.json")
  .then(response => response.json())
  .then(data => {

    // CERCLE SOURCE
    addCircleWithText(centerX, centerY, "Source", "#1e88e5");

    const lastFive = data.slice(-5);

    lastFive.forEach((item, i) => {

      const angle = (i / lastFive.length) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + distanceFromCenter * Math.cos(angle);
      const y = centerY + distanceFromCenter * Math.sin(angle);

      // LIGNE vers centre
      svg.append("line")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

      // === CLIP PATH ===
      svg.append("defs")
        .append("clipPath")
        .attr("id", "clip-square-" + i)
        .append("rect")
        .attr("x", x - squareSize/2)
        .attr("y", y - squareSize/2)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("rx", 50)
        .attr("ry", 50);

      const squareGroup = svg.append("g")
        .attr("clip-path", "url(#clip-square-" + i + ")");

      // IMAGE
      squareGroup.append("image")
        .attr("href", item.vignette)
        .attr("x", x - squareSize/2)
        .attr("y", y - squareSize/2)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("preserveAspectRatio","xMidYMid slice");

      // ZONE GRISE TEXTE (moitié basse)
      squareGroup.append("rect")
        .attr("x", x - squareSize/2)
        .attr("y", y)
        .attr("width", squareSize)
        .attr("height", squareSize/2)
        .attr("fill", "rgba(0,0,0,0.55)");

      // TEXTE TITRE
      addMultilineText(
        svg,
        item.titre,
        x,
        y + squareSize/4,
        squareSize,
        16,
        "white",
        "14px"
      );

      // === POSITION DES CERCLES MATIÈRE / NOTION ===
      const offset = squareSize/2 + circleRadius;

      let matX, matY, notX, notY;

      if (Math.abs(Math.cos(angle)) < 0.3) {
        // haut ou bas
        if (Math.sin(angle) < 0) {
          // haut
          matX = x - circleRadius;
          matY = y - offset;
          notX = x + circleRadius;
          notY = y - offset;
        } else {
          // bas
          matX = x - circleRadius;
          matY = y + offset;
          notX = x + circleRadius;
          notY = y + offset;
        }
      } else {
        // gauche ou droite
        if (Math.cos(angle) > 0) {
          // droite
          matX = x + offset;
          matY = y - circleRadius;
          notX = x + offset;
          notY = y + circleRadius;
        } else {
          // gauche
          matX = x - offset;
          matY = y - circleRadius;
          notX = x - offset;
          notY = y + circleRadius;
        }
      }

      // LIGNES fines
      svg.append("line")
        .attr("x1", x)
        .attr("y1", y)
        .attr("x2", matX)
        .attr("y2", matY)
        .attr("stroke", "#bbb")
        .attr("stroke-width", 1);

      svg.append("line")
        .attr("x1", x)
        .attr("y1", y)
        .attr("x2", notX)
        .attr("y2", notY)
        .attr("stroke", "#bbb")
        .attr("stroke-width", 1);

      // MATIÈRE (vert)
      addCircleWithText(matX, matY, item.matiere, "#43a047");

      // NOTION (orange)
      addCircleWithText(notX, notY, item.notion, "#fb8c00");

    });

  });

});
