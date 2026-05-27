const guildId = window.location.pathname.split("/")[2];

const loadingElement = document.querySelector("#loading");
const guildNameElement = document.querySelector("#guildName");
const guildMetaElement = document.querySelector("#guildMeta");
const statsElement = document.querySelector("#stats");
const moduleListElement = document.querySelector("#moduleList");

function setLoading(isLoading) {
    loadingElement.style.backdropFilter = isLoading
        ? "blur(12px)"
        : "blur(0px)";

    if (!isLoading) {
        setTimeout(() => {
            loadingElement.style.display = "none";
        }, 400);
    }
}

function formatDate(value) {
    if (!value) return "Never updated";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown update time";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function renderStats(guild, modules) {
    const enabledCount = modules.filter((module) => module.enabled).length;
    const configurableCount = modules.filter(
        (module) => module.configurable,
    ).length;

    statsElement.innerHTML = `
        <article class="stat">
            <p class="stat-label">Members</p>
            <strong>${guild.memberCount ?? 0}</strong>
        </article>
        <article class="stat">
            <p class="stat-label">Modules</p>
            <strong>${modules.length}</strong>
        </article>
        <article class="stat">
            <p class="stat-label">Enabled</p>
            <strong>${enabledCount}</strong>
        </article>
        <article class="stat">
            <p class="stat-label">Configurable</p>
            <strong>${configurableCount}</strong>
        </article>
    `;
}

function renderModules(modules) {
    if (modules.length === 0) {
        moduleListElement.innerHTML =
            '<div class="empty">No modules are currently registered for this guild.</div>';
        return;
    }

    moduleListElement.innerHTML = modules
        .map((module) => {
            const configHref = module.configurable
                ? `/dashboard/${guildId}/${encodeURIComponent(module.id)}`
                : "#";

            return `
                <article class="module-card">
                    <div class="module-top">
                        <div>
                            <div class="module-name-row">
                                <h3>${escapeHtml(module.name)}</h3>
                                <span class="badge ${module.enabled ? "enabled" : "disabled"}">${module.enabled ? "Enabled" : "Disabled"}</span>
                            </div>
                            <p class="module-meta">${escapeHtml(module.id)}</p>
                        </div>
                        <span class="module-kind">${module.kind || "unknown"}</span>
                    </div>

                    <div class="module-facts">
                        <span class="fact">${module.commandCount} commands</span>
                        <span class="fact">${module.eventCount} events</span>
                        <span class="fact">${module.fieldCount} config fields</span>
                        <span class="fact">${formatDate(module.updatedAt)}</span>
                    </div>

                    <div class="module-bottom">
                        <span class="module-meta">${module.configurable ? "This module exposes configurable fields." : "This module has no config fields yet."}</span>
                        <a class="module-link ${module.configurable ? "" : "disabled"}" href="${configHref}">${module.configurable ? "Open settings" : "No settings"}</a>
                    </div>
                </article>
            `;
        })
        .join("");
}

async function load() {
    setLoading(true);

    try {
        const [guildResponse, modulesResponse] = await Promise.all([
            fetch(`/api/guild/${guildId}`),
            fetch(`/api/guild/${guildId}/modules`),
        ]);

        if (!guildResponse.ok || guildResponse.redirected) {
            return window.location.replace("/dashboard");
        }

        if (!modulesResponse.ok || modulesResponse.redirected) {
            return window.location.replace("/dashboard");
        }

        const guild = await guildResponse.json();
        const modules = await modulesResponse.json();

        document.title = `${guild.name} - Nuit`;
        guildNameElement.textContent = guild.name;
        guildMetaElement.textContent = `${guild.memberCount ?? 0} members · ${guild.locale || "unknown locale"}`;

        renderStats(guild, modules);
        renderModules(modules);
    } catch (error) {
        console.error("Failed to load guild overview", error);
        moduleListElement.innerHTML =
            '<div class="empty">Failed to load this guild overview.</div>';
    }

    setLoading(false);
}

load();
