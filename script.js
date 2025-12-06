// ==========================================================
//  CONFIG
// ==========================================================
const WEBHOOK_URL = "https://discord.com/api/webhooks/1447005556635209899/tb29lQPMnF47DCR1w2BqQzXujui3qYhEVsY45GhJ9726gvlNfhTQ5cWSuwMXNZGHjgCy";
const ROLE_ID = "1446471808743243987"; // rôle staff à ping

// ==========================================================
//  ANTI-SPAM 24H
// ==========================================================
function canSend() {
    const last = localStorage.getItem("lastSendTime");
    if (!last) return true;

    const elapsed = Date.now() - Number(last);
    return elapsed >= 24 * 60 * 60 * 1000;
}

function timeLeft() {
    const last = Number(localStorage.getItem("lastSendTime"));
    const remaining = (24 * 60 * 60 * 1000) - (Date.now() - last);

    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);

    return `${hours}h ${minutes}min`;
}

// ==========================================================
//  PAGE SWITCH (Suivant / Retour)
// ==========================================================
document.getElementById("nextBtn").onclick = () => {

    if (!canSend()) {
        alert("❗ Vous devez attendre encore " + timeLeft());
        return;
    }

    page1.style.display = "none";
    page2.style.display = "block";
};

document.getElementById("backBtn").onclick = () => {
    page2.style.display = "none";
    page1.style.display = "block";
};

// ==========================================================
//  ENVOI AU WEBHOOK
// ==========================================================
document.getElementById("sendBtn").onclick = () => {

    if (!canSend()) {
        alert("⛔ Vous devez attendre encore " + timeLeft());
        return;
    }

    // Récupération valeurs
    const poste = document.querySelector("input[name='poste']:checked");

    const payload = {
        content: `<@&${ROLE_ID}>`,  // ⭐ PING DU RÔLE FONCTIONNEL ICI ⭐
        embeds: [{
            title: "📨 Nouvelle Candidature Staff",
            color: 0xff0000,
            fields: [
                { name: "Pseudo Discord", value: pseudo.value || "Non renseigné" },
                { name: "Prénom", value: prenom.value || "Non renseigné" },
                { name: "Âge", value: age.value || "Non renseigné" },
                { name: "Disponibilités", value: dispo.value || "Non renseigné" },
                { name: "Poste souhaité", value: poste ? poste.value : "Non choisi" },
                { name: "Motivations", value: motive.value || "Non renseigné" },
                { name: "Pourquoi vous ?", value: pourquoi.value || "Non renseigné" },
                { name: "Qualités", value: qualites.value || "Non renseigné" },
                { name: "Définition du rôle", value: definition.value || "Non renseigné" },
                { name: "Expérience", value: experience.value || "Non renseigné" },
                { name: "Autre", value: autre.value || "Aucun" }
            ]
        }]
    };

    // Envoi Webhook
    fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(() => {
        // Sauvegarde ANTI-SPAM 24H
        localStorage.setItem("lastSendTime", Date.now().toString());

        alert("✅ Votre candidature a bien été envoyée !");
    })
    .catch(() => {
        alert("❗ Erreur d'envoi !");
    });
};
