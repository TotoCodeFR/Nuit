let userData;
let commonGuilds;

const guildTemplate = document.querySelector("template.guild")
const guildList = document.getElementById("guildList")

async function load() {
    document.querySelector("#loading").style.backdropFilter = "blur(12px)";

    try {
        const res = await fetch("/api/users/@me");

        if (!res.ok) {
            window.location.replace("/auth/discord/login");
        }

        userData = await res.json();
    } catch (err) {
        console.error("Something went wrong while loading user data", err);
    }

    try {
        const res = await fetch("/api/guilds/common");

        if (!res.ok) {
            window.location.replace("/auth/discord/login");
        }

        commonGuilds = await res.json();

        console.log(commonGuilds)
    } catch (err) {
        console.error("Something went wrong while fetching common servers", err)
    }

    commonGuilds.forEach(guild => {
        const clone = document.importNode(guildTemplate.content, true)

        const card = clone.querySelector(".guild")

        card.querySelector("img.icon").src = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`
        card.querySelector("h3.name").textContent = guild.name

        card.addEventListener("click", () => {
            window.location.replace(`/dashboard/${guild.id}/overview`)
        })

        guildList.appendChild(clone)
    })

    const addBotBtn = document.createElement("a")
    addBotBtn.className = "guild add-bot"
    addBotBtn.href = "/auth/discord/addbot"
    addBotBtn.innerHTML = `
        <svg class="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <h3 class="name">Add Nuit to your server</h3>
    `
    guildList.appendChild(addBotBtn)

    document.querySelector("#loading").style.backdropFilter = "blur(0px)";

    setTimeout(() => {
        document.querySelector("#loading").style.display = "none";
    }, 400);
}

load();
