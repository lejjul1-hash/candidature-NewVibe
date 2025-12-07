// ===============================
// CONFIG
// ===============================
const WEBHOOK_URL = "https://discord.com/api/webhooks/1447005556635209899/tb29lQPMnF47DCR1w2BqQzXujui3qYhEVsY45GhJ9726gvlNfhTQ5cWSuwMXNZGHjgCy";
const ROLE_ID = "1446471808743243987";
const ADMIN_CODE = "Glastontop1234";
const IP_WHITELIST = "91.174.237.40";

// ===============================
// SYSTÈME MULTI-PAGES (Étapes)
// ===============================
let step = 1;

function showStep(n) {
    document.querySelectorAll(".step").forEach(s => s.style.display = "none");
    document.getElementById("step" + n).style.display = "block";
}

showStep(step);

// ===============================
// RÉCUP IP UTILISATEUR
// ===============================
async function getIP() {
    try {
        const req = await fetch("https://api.ipify.org?format=json");
        const data = await req.json();
        return data.ip;
    } catch (e) {
        return "IP-ERR";
    }
}

// ===============================
// COOL DOWN 24H
// ===============================
async function canSend(ip) {
    if (ip === IP_WHITELIST) return true;

    const last = localStorage.getItem("lastSent");
    if (!last) return true;

    const now = Date.now();
    const diff = now - parseInt(last);

    return diff >= 24 * 60 * 60 * 1000;
}

async function registerCooldown(ip) {
    if (ip !== IP_WHITELIST) {
        localStorage.setItem("lastSent", Date.now().toString());
    }
}

// ===============================
// BOUTON SUIVANT
// ===============================
function nextStep() {
    step++;
    showStep(step);
}

function prevStep() {
    step--;
    showStep(step);
}

// ===============================
// ENVOI DE LA CANDIDATURE
// ===============================
async function sendForm() {
    const ip = await getIP();
    const allowed = await canSend(ip);

    if (!allowed) {
        alert("❌ Tu dois attendre 24h avant de refaire une candidature !");
        return;
    }

    // FORM 1
    const irl = document.getElementById("irl").value;
    const discord = document.getElementById("discord").value;
    const prenom = document.getElementById("prenom").value;
    const age = document.getElementById("age").value;
    const dispo = document.getElementById("dispo").value;

    // FORM 2
    const categorie = document.querySelector("input[name='categorie']:checked")?.value || "Non précisé";
    const motivations = document.getElementById("motivations").value;
    const pourquoi = document.getElementById("pourquoi").value;
    const qualites = document.getElementById("qualites").value;
    const defStaff = document.getElementById("defStaff").value;
    const experience = document.getElementById("experience").value;
    const autre = document.getElementById("autre").value;

    // ===============================
    // EMBED DISCORD
    // ===============================
    const payload = {
        content: `<@&${ROLE_ID}> Nouvelle candidature reçue !`,
        embeds: [
            {
                title: "📥 Nouvelle Candidature Staff",
                color: 0xff0000,
                fields: [
                    { name: "👤 Pseudo Discord", value: discord || "Non renseigné" },
                    { name: "🆔 IP", value: ip },
                    { name: "📌 Catégorie", value: categorie },
                    {
                        name: "📄 Présentation IRL",
                        value:
`• **Prénom :** ${prenom}
• **Âge :** ${age}
• **Présentation :** ${irl}`
                    },
                    { name: "🕒 Disponibilités", value: dispo },
                    { name: "🔥 Motivations", value: motivations },
                    { name: "❓ Pourquoi lui ?", value: pourquoi },
                    { name: "⭐ Qualités", value: qualites },
                    { name: "🛡 Définition du rôle", value: defStaff },
                    { name: "📚 Expérience", value: experience },
                    { name: "➕ Autre", value: autre || "Aucun" }
                ],
                footer: { text: "Système de candidature | Glast" }
            }
        ]
    };

    await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    await registerCooldown(ip);

    saveCandidateLocal(discord, ip, categorie, motivations);

    alert("✅ Candidature envoyée avec succès !");
    location.reload();
}

// ===============================
// STOCKAGE LOCAL POUR PANEL ADMIN
// ===============================
function saveCandidateLocal(discord, ip, categorie, motivations) {
    const list = JSON.parse(localStorage.getItem("candidatures") || "[]");

    list.push({
        discord,
        ip,
        categorie,
        motivations
    });

    localStorage.setItem("candidatures", JSON.stringify(list));
}

// ===============================
// PANEL ADMIN + CLEAR
// ===============================
function openAdmin() {
    const code = prompt("Entrez le code admin :");

    if (code !== ADMIN_CODE) {
        alert("Code incorrect.");
        return;
    }

    const panel = document.getElementById("adminPanel");
    const list = JSON.parse(localStorage.getItem("candidatures") || "[]");

    panel.innerHTML = `
        <h2>📂 Candidatures enregistrées</h2>

        <button id="clearBtn" style="
            margin-top:10px;
            margin-bottom:20px;
            padding:10px 15px;
            background:#ff1e1e;
            color:white;
            border:none;
            border-radius:8px;
            font-weight:700;
            cursor:pointer;
            width:100%;
            box-shadow:0 0 12px rgba(255,0,0,0.4);
        ">
            🗑️ Supprimer toutes les candidatures
        </button>
    `;

    if (list.length === 0) {
        panel.innerHTML += "<p>Aucune candidature enregistrée.</p>";
    }

    list.forEach(c => {
        panel.innerHTML += `
            <div class="admin-entry" style="
                background:#0e0e10;
                border:1px solid rgba(255,255,255,0.05);
                padding:12px;
                border-radius:10px;
                margin-bottom:12px;
            ">
                <strong>Pseudo Discord :</strong> ${c.discord}<br>
                <strong>IP :</strong> ${c.ip}<br>
                <strong>Catégorie :</strong> ${c.categorie}<br>
                <strong>Motivations :</strong> ${c.motivations}<br>
            </div>
        `;
    });

    panel.style.display = "block";

    document.getElementById("clearBtn").addEventListener("click", () => {
        if (confirm("⚠️ Voulez-vous vraiment supprimer toutes les candidatures ?")) {
            localStorage.removeItem("candidatures");
            panel.innerHTML += "<p style='margin-top:10px;color:#ff4c4c;font-weight:700'>Toutes les candidatures ont été supprimées.</p>";
        }
    });
}
