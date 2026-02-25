// --- CALCUL DES DIMENSIONS RESPONSIVE ---
const width = window.innerWidth;
const height = window.innerHeight;
const centerX = width / 2;
const centerY = height / 2;
const baseUnit = Math.min(width, height) / 10;

const radiusPentagon = baseUnit * 3.5;
const radiusCenter = baseUnit * 0.8;
const radiusResource = baseUnit * 0.55;
const strokePentagon = baseUnit * 0.8;

const svg = d3.select("#graph-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`);

// --- PALETTE DE COULEURS DOUCES (7 MATIÈRES) ---
const matiereColors = {
    1: "#77dd77", // Vert pastel
    2: "#ffb347", // Orange doux
    3: "#f49ac2", // Rose poudré
    4: "#b39eb5", // Violet lavande
    5: "#fdfd96", // Jaune pâle (attention texte blanc, on foncera un peu si besoin)
    6: "#ff6961", // Rouge corail doux
    7: "#779ecb"  // Bleu-Gris (différent du bleu principal)
};
// Couleur par défaut si l'id n'est pas dans la liste
const defaultColor = "#cccccc";

const notionsConfig = [
    { id: 1, l1: "DÉFINIR LE MÉTIER", l2: "DE JOURNALISTE", url: "https://www.clemi.fr" },
    { id: 2, l1: "COMPRENDRE LA LIGNE", l2: "ÉDITORIALE", url: "https://www.clemi.fr" },
    { id: 3, l1: "DISTINGUER INFO", l2: "ET OPINION", url: "https://www.clemi.fr" },
    { id: 4, l1: "DIFFÉRENCIER INFO", l2: "ET PUBLICITÉ", url: "https://www.clemi.fr" },
    { id: 5, l1: "IDENTIFIER DES", l2: "FAUSSES INFOS", url: "https://www.clemi.fr" }
];

const points = notionsConfig.map((d, i) => {
    const a = (i * 72 * Math.PI / 180) - (Math.PI / 2);
    return { x: centerX + radiusPentagon * Math.cos(a), y: centerY + radiusPentagon * Math.sin(a) };
});

// Dessin des bandeaux
points.forEach((p1, i) => {
    const p2 = points[(i + 1) % 5];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    let angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    if (angleDeg > 90 || angleDeg < -90) angleDeg += 180;

    svg.append("line")
        .attr("x1", p1.x).attr("y1", p1.y)
        .attr("x2", p2.x).attr("y2", p2.y)
        .attr("stroke", "#28aae0")
        .attr("stroke-width", strokePentagon)
        .attr("stroke-linecap", "round")
        .attr("class", "clickable-segment")
        .on("click", () => window.open(notionsConfig[i].url, "_blank"));

    const textGroup = svg.append("g").attr("transform", `translate(${midX}, ${midY}) rotate(${angleDeg})`);
    const fontSizeNotion = baseUnit * 0.18;
    textGroup.append("text").attr("class", "label-notion").attr("y", -fontSizeNotion/1.5).style("font-size", fontSizeNotion + "px").text(notionsConfig[i].l1);
    textGroup.append("text").attr("class", "label-notion").attr("y", fontSizeNotion/1.5).style("font-size", fontSizeNotion + "px").text(notionsConfig[i].l2);
});

// Cercle Central
const centerGroup = svg.append("g")
    .attr("class", "node-center")
    .attr("transform", `translate(${centerX}, ${centerY})`)
    .on("click", () => window.open("https://www.clemi.fr/...", "_blank"));

centerGroup.append("circle").attr("r", radiusCenter).attr("fill", "#28aae0").attr("stroke", "#fff").attr("stroke-width", baseUnit * 0.05);
centerGroup.append("text").attr("class", "label-center").attr("dy", -baseUnit * 0.1).style("font-size", (baseUnit * 0.18) + "px").style("font-weight", "900").text("LA SOURCE");
centerGroup.append("text").attr("class", "label-center").attr("dy", baseUnit * 0.25).style("font-size", (baseUnit * 0.13) + "px").text("ⓘ en savoir plus");

// --- RÉCUPÉRATION DES DONNÉES ---
const sheetUrl = "https://opensheet.elk.sh/1hRfbDCfyk5TuNR9oSvilwKK2ohTbLgRkzvwq5BoHRpw/base";

d3.json(sheetUrl).then(data => {
    notionsConfig.forEach((notion, i) => {
        const ressource = data.filter(d => parseInt(d.idnotion) === notion.id).pop();

        if (ressource) {
            const cleTitre = Object.keys(ressource).find(k => k.toLowerCase() === "titre");
            const cleUrl = Object.keys(ressource).find(k => k.toLowerCase() === "url");
            const cleMatiere = Object.keys(ressource).find(k => k.toLowerCase() === "idmatiere");
            
            const texteTitre = ressource[cleTitre] || "";
            const lienUrl = ressource[cleUrl] || "#";
            const idMatiere = parseInt(ressource[cleMatiere]);
            
            // Attribution de la couleur
            const color = matiereColors[idMatiere] || defaultColor;

            const p1 = points[i];
            const p2 = points[(i + 1) % 5];
            const targetX = (p1.x + p2.x) / 2;
            const targetY = (p1.y + p2.y) / 2;

            const posX = centerX + (targetX - centerX) * 0.52;
            const posY = centerY + (targetY - centerY) * 0.52;

            const resGroup = svg.append("g")
                .attr("class", "resource-node")
                .attr("transform", `translate(${posX}, ${posY})`)
                .on("click", () => window.open(lienUrl, "_blank"));

            // Cercle coloré
            resGroup.append("circle")
                .attr("r", radiusResource)
                .attr("fill", color)
                .attr("stroke", "#ffffff")
                .attr("stroke-width", baseUnit * 0.04);

            // Titre en BLANC
            const words = texteTitre.toUpperCase().split(" ");
            const mid = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(" ");
            const line2 = words.slice(mid).join(" ");
            const fontSizeRes = baseUnit * 0.12;

            resGroup.append("text")
                .attr("class", "label-resource")
                .attr("dy", line2 ? -fontSizeRes/2 : "0")
                .style("font-size", fontSizeRes + "px")
                .style("fill", "#ffffff") // Texte forcé en blanc
                .style("font-weight", "bold")
                .text(line1.length > 15 ? line1.substring(0, 12) + "..." : line1);

            if (line2) {
                resGroup.append("text")
                    .attr("class", "label-resource")
                    .attr("dy", fontSizeRes)
                    .style("font-size", fontSizeRes + "px")
                    .style("fill", "#ffffff") // Texte forcé en blanc
                    .style("font-weight", "bold")
                    .text(line2.length > 15 ? line2.substring(0, 12) + "..." : line2);
            }
        }
    });
});

window.addEventListener("resize", () => location.reload());
