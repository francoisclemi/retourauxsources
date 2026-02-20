const sheetURL = "https://opensheet.elk.sh/1hRfbDCfyk5TuNR9oSvilwKK2ohTbLgRkzvwq5BoHRpw/base";

fetch(sheetURL)
  .then(response => response.json())
  .then(data => {

    // Trier par date décroissante
    const sorted = data.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    // Prendre les 5 dernières
    const lastFive = sorted.slice(0, 5);

    const container = document.getElementById("resources");

    lastFive.forEach(item => {

      const div = document.createElement("div");
      div.className = "resource";

      div.innerHTML = `
        <a href="${item.url}" target="_blank">
          ${item.titre}
        </a>
        <p><strong>Matière :</strong> ${item.matiere}</p>
        <p><strong>Notion secondaire :</strong> ${item.notion}</p>
      `;

      container.appendChild(div);
    });

  })
  .catch(error => {
    console.error("Erreur :", error);
  });
