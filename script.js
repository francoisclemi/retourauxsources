const sheetURL = "https://opensheet.elk.sh/1hRfbDCfyk5TuNR9oSvilwKK2ohTbLgRkzvwq5BoHRpw/base";

const width = 900;
const height = 600;
const centerX = width/2;
const centerY = height/2;
const radius = 200; // distance des satellites autour du centre

// Créer tooltip
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

fetch(sheetURL)
  .then(res => res.json())
  .then(data => {
    // Trier par date décroissante et prendre les 5 dernières
    const sorted = data.sort((a,b)=> new Date(b.date) - new Date(a.date));
    const lastFive = sorted.slice(0,5);

    const svg = d3.select("#graph");

    // Créer le nœud central
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
      .text("SOURCE");

    // Créer les satellites
    const angleStep = 2 * Math.PI / lastFive.length;

    lastFive.forEach((item,i) => {
      const angle = i * angleStep - Math.PI/2; // commencer en haut
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // couleur selon matière
      let color = "#95a5a6"; // défaut
      if(item.matiere.toLowerCase() === "svt") color = "#2ecc71";
      if(item.matiere.toLowerCase() === "français") color = "#e74c3c";
      if(item.matiere.toLowerCase() === "histoire") color = "#f1c40f";

     // cercle pour la ressource
svg.append("circle")
  .attr("cx", x)
  .attr("cy", y)
  .attr("r", 25)
  .attr("fill", color)
  .style("cursor","pointer")
  .on("mouseover", (event) => {
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`<strong>${item.titre}</strong><br>Matière: ${item.matiere}<br>Notion: ${item.notion}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 20) + "px");
  })
  .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0))
  .on("click", () => window.open(item.url,"_blank"));

// ajouter l'image
svg.append("image")
  .attr("xlink:href", item.vignette)
  .attr("x", x - 15) // centrer l'image sur le cercle
  .attr("y", y - 15)
  .attr("width", 30)
  .attr("height", 30)
  .style("pointer-events","none"); // laisse le cercle cliquable

      // texte (optionnel : affiché sous le cercle)
      svg.append("text")
        .attr("x", x)
        .attr("y", y + 40)
        .attr("text-anchor", "middle")
        .text(item.titre)
        .style("font-size","11px");
    });

  })
  .catch(err => console.error(err));
