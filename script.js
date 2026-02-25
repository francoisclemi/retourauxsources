const width = window.innerWidth;
const height = window.innerHeight;
const centerX = width / 2;
const centerY = height / 2;
const radiusSommet = Math.min(width, height) * 0.35;

const svg = d3.select("#graph-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`);

const notionsConfig = [
    { id: 1, l1: "DÉFINIR LE MÉTIER", l2: "DE JOURNALISTE", url: "https://www.clemi.fr" },
    { id: 2, l1: "COMPRENDRE LA LIGNE", l2: "ÉDITORIALE", url: "https://www.clemi.fr" },
    { id: 3, l1: "DISTINGUER INFO", l2: "ET OPINION", url: "https://www.clemi.fr" },
    { id: 4, l1: "DIFFÉRENCIER INFO", l2: "ET PUBLICITÉ", url: "https://www.clemi.fr" },
    { id: 5, l1: "IDENTIFIER DES", l2: "FAUSSES INFOS", url: "https://www.clemi.fr" }
];

// 1. Calcul des points du pentagone
const points = notionsConfig.map((d, i) => {
    const a = (i * 72 * Math.PI / 180) - (Math.PI / 2);
    return { x: centerX + radiusSommet * Math.cos(a), y: centerY + radiusSommet * Math.sin(a) };
});

// 2. Dessin des bandeaux extérieurs (Notions)
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
        .attr("stroke-width", 80)
        .attr("stroke-linecap", "round")
        .attr("class", "clickable-segment")
        .on("click", () => window.open(notionsConfig[i].url, "_blank"));

    const textGroup = svg.append("g").attr("transform", `translate(${midX}, ${midY}) rotate(${angleDeg})`);
    textGroup.append("text").attr("class", "label-notion").attr("y", -14).text(notionsConfig[i].l1);
    textGroup.append("text").attr("class", "label-notion").attr("y", 14).text(notionsConfig[i].l2);
});

// 3. Dessin du cercle central
const centerGroup = svg.append("g")
    .attr("class", "node-center")
    .attr("transform", `translate(${centerX}, ${centerY})`)
    .on("click", () => window.open("https://www.clemi.fr/ressources/series-de-ressources-videos/les-cles-des-medias/quest-ce-quune-source", "_blank"));

centerGroup.append("circle").attr("r", 70).attr("fill", "#28aae0").attr("stroke", "#fff").attr("stroke-width", 5);
centerGroup.append("text").attr("class", "label-center").attr("dy", "-8px").style("font-size", "15px").style("font-weight", "900").text("LA SOURCE");
centerGroup.append("text").attr("class", "label-center").attr("dy", "22px").style("font-size", "11px").text("ⓘ en savoir plus");

// 4. RÉCUPÉRATION ET AFFICHAGE DES RESSOURCES
const sheetUrl = "https://opensheet.elk.sh/1hRfbDCfyk5TuNR9oSvilwKK2ohTbLgRkzvwq5BoHRpw/base";

d3.json(sheetUrl).then(data => {
    notionsConfig.forEach((notion, i) => {
        // On récupère la ressource avec l'idnotion correspondant
        const ressource = data.filter(d => parseInt(d.idnotion) === notion.id).pop();

        if (ressource) {
            // Sécurité : trouver les clés indépendamment des majuscules (Titre/titre, URL/url)
            const cleTitre = Object.keys(ressource).find(key => key.toLowerCase() === "titre");
            const cleUrl = Object.keys(ressource).find(key => key.toLowerCase() === "url");
            
            const texteTitre = ressource[cleTitre] || "";
            const lienUrl = ressource[cleUrl] || "#";

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

            resGroup.append("circle")
                .attr("r", 45)
                .attr("class", "resource-circle");

            // Découpage du titre en deux lignes pour tenir dans le cercle
            const words = texteTitre.toUpperCase().split(" ");
            const mid = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(" ");
            const line2 = words.slice(mid).join(" ");

            resGroup.append("text")
                .attr("class", "label-resource")
                .attr("dy", line2 ? "-5px" : "5px")
                .text(line1.length > 15 ? line1.substring(0, 12) + "..." : line1);

            if (line2) {
                resGroup.append("text")
                    .attr("class", "label-resource")
                    .attr("dy", "12px")
                    .text(line2.length > 15 ? line2.substring(0, 12) + "..." : line2);
            }
        }
    });
});

window.addEventListener("resize", () => location.reload());
