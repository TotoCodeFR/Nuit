const guildId = window.location.pathname.split("/")[2];
const module = decodeURIComponent(window.location.pathname.split("/")[3]);

let guildData;
let moduleData;

const loadingElement = document.querySelector("#loading");
const titleElement = document.querySelector("#title");
const subtitleElement = document.querySelector("#subtitle");
const moduleNameElement = document.querySelector("#moduleName");
const moduleStatusElement = document.querySelector("#moduleStatus");
const updatedAtElement = document.querySelector("#updatedAt");
const fieldsContainer = document.querySelector("#configFields");
const formElement = document.querySelector("#configForm");
const statusMessageElement = document.querySelector("#statusMessage");
const saveButton = document.querySelector("#saveButton");
const toggleButton = document.querySelector("#toggleButton");
const backLinkElement = document.querySelector(".back");

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

function setStatus(message, type = "default") {
    statusMessageElement.textContent = message;
    statusMessageElement.className = "status-message";

    if (type === "success") {
        statusMessageElement.classList.add("status-success");
    }

    if (type === "error") {
        statusMessageElement.classList.add("status-error");
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function formatDate(value) {
    if (!value) return "Never";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function getDefaultValue(field) {
    if (field.default !== undefined) {
        return field.default;
    }

    if (field.type === "boolean") return false;
    return "";
}

function getFieldValue(field) {
    const value = moduleData.config?.[field.key];
    return value === undefined ? getDefaultValue(field) : value;
}

function renderField(field) {
    const inputId = `field-${CSS.escape(field.label)}`;
    const hint = field.description
        ? `<p class="hint">${escapeHtml(field.description)}</p>`
        : "";
    const optional = field.optional
        ? '<span class="field-badge">Optional</span>'
        : "";
    const value = getFieldValue(field);
    const fullWidth = field.type === "string" && field.max && field.max > 120;

    if (field.type === "boolean") {
        return `
            <div class="field full-width" data-field="${escapeHtml(field.key)}" data-type="${field.type}">
                <label for="${inputId}">${escapeHtml(field.label)}</label>
                ${optional}
                <label class="field-checkbox" for="${inputId}">
                    <input id="${inputId}" name="${escapeHtml(field.key)}" type="checkbox" ${value === true ? "checked" : ""}>
                    <span>Enabled</span>
                </label>
                ${hint}
            </div>
        `;
    }

    if (field.type === "select") {
        const options = (field.options || [])
            .map((option) => {
                const selected = option.value === value ? "selected" : "";
                return `<option value="${escapeHtml(option.value)}" ${selected}>${escapeHtml(option.label)}</option>`;
            })
            .join("");

        return `
            <div class="field" data-field="${escapeHtml(field.key)}" data-type="${field.type}">
                <label for="${inputId}">${escapeHtml(field.label)}</label>
                ${optional}
                <select id="${inputId}" name="${escapeHtml(field.key)}">
                    ${field.optional ? '<option value="">No selection</option>' : ""}
                    ${options}
                </select>
                ${hint}
            </div>
        `;
    }

    if (field.type === "number") {
        const min = field.min !== undefined ? `min="${field.min}"` : "";
        const max = field.max !== undefined ? `max="${field.max}"` : "";

        return `
            <div class="field" data-field="${escapeHtml(field.key)}" data-type="${field.type}">
                <label for="${inputId}">${escapeHtml(field.label)}</label>
                ${optional}
                <input id="${inputId}" name="${escapeHtml(field.key)}" type="number" value="${escapeHtml(value)}" ${min} ${max}>
                ${hint}
            </div>
        `;
    }

    if (field.type === "secret") {
        return `
            <div class="field full-width" data-field="${escapeHtml(field.key)}" data-type="${field.type}">
                <label for="${inputId}">${escapeHtml(field.label)}</label>
                ${optional}
                <input id="${inputId}" name="${escapeHtml(field.key)}" type="password" value="${escapeHtml(value)}" autocomplete="off">
                ${hint}
            </div>
        `;
    }

    const useTextarea = field.type === "string" && field.max && field.max > 120;
    const placeholderMap = {
        channel: "Channel ID",
        role: "Role ID",
        user: "User ID",
    };
    const placeholder = placeholderMap[field.type] || "";
    const min = field.min !== undefined ? `minlength="${field.min}"` : "";
    const max = field.max !== undefined ? `maxlength="${field.max}"` : "";

    return `
        <div class="field ${fullWidth || useTextarea ? "full-width" : ""}" data-field="${escapeHtml(field.key)}" data-type="${field.type}">
            <label for="${inputId}">${escapeHtml(field.label)}</label>
            ${optional}
            ${
                useTextarea
                    ? `<textarea id="${inputId}" name="${escapeHtml(field.key)}" ${min} ${max} placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>`
                    : `<input id="${inputId}" name="${escapeHtml(field.key)}" type="text" value="${escapeHtml(value)}" ${min} ${max} placeholder="${escapeHtml(placeholder)}">`
            }
            ${hint}
        </div>
    `;
}

function renderFields() {
    const schema = moduleData.schema || [];

    if (schema.length === 0) {
        fieldsContainer.innerHTML =
            '<div class="field-empty">This module does not expose any configurable fields yet.</div>';
        return;
    }

    const grouped = new Map();

    schema.forEach((field) => {
        const groupName = field.group || "General";
        if (!grouped.has(groupName)) {
            grouped.set(groupName, []);
        }

        grouped.get(groupName).push(field);
    });

    fieldsContainer.innerHTML = Array.from(grouped.entries())
        .map(
            ([groupName, fields]) => `
            <section class="group">
                <div class="group-header">
                    <h3>${escapeHtml(groupName)}</h3>
                </div>
                <div class="group-grid">
                    ${fields.map(renderField).join("")}
                </div>
            </section>
        `,
        )
        .join("");
}

function updateSummary() {
    document.title = `${guildData.name} · ${moduleData.module} - Nuit`;
    titleElement.textContent = guildData.name;
    subtitleElement.textContent = `Editing ${moduleData.module} settings for this guild.`;
    moduleNameElement.textContent = moduleData.module;
    moduleStatusElement.textContent = moduleData.enabled
        ? "Enabled"
        : "Disabled";
    updatedAtElement.textContent = formatDate(moduleData.updatedAt);
    toggleButton.textContent = moduleData.enabled ? "Disable" : "Enable";
    toggleButton.disabled = false;
}

function collectConfig() {
    const nextConfig = {};
    const fieldElements = fieldsContainer.querySelectorAll("[data-field]");

    fieldElements.forEach((fieldElement) => {
        const key = fieldElement.dataset.field;
        const type = fieldElement.dataset.type;
        const input = fieldElement.querySelector("input, select, textarea");

        if (!key || !type || !input) {
            return;
        }

        let value;

        if (type === "boolean") {
            value = input.checked;
        } else if (type === "number") {
            value = input.value === "" ? null : Number(input.value);
        } else {
            value = input.value.trim();
        }

        if (value === "" || value === null) {
            return;
        }

        nextConfig[key] = value;
    });

    return nextConfig;
}

async function loadModuleConfig() {
    const res = await fetch(
        `/api/guild/${guildId}/${encodeURIComponent(module)}/config`,
    );

    if (!res.ok || res.redirected) {
        window.location.replace("/dashboard");
        return null;
    }

    return res.json();
}

async function load() {
    setLoading(true);

    try {
        const guildResponse = await fetch(`/api/guild/${guildId}`);

        if (!guildResponse.ok || guildResponse.redirected) {
            return window.location.replace("/dashboard");
        }

        guildData = await guildResponse.json();
        moduleData = await loadModuleConfig();

        if (!moduleData) {
            return;
        }

        backLinkElement.href = `/dashboard/${guildId}/overview`;
        updateSummary();
        renderFields();
        setStatus("Loaded configuration");
    } catch (err) {
        console.error("Something was wrong when loading module info", err);
        setStatus("Failed to load configuration", "error");
    }

    setLoading(false);
}

formElement.addEventListener("submit", async (event) => {
    event.preventDefault();

    saveButton.disabled = true;
    setStatus("Saving...");

    try {
        const res = await fetch(
            `/api/guild/${guildId}/${encodeURIComponent(module)}/config`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    config: collectConfig(),
                }),
            },
        );

        if (!res.ok) {
            throw new Error(`Save failed with status ${res.status}`);
        }

        moduleData = await res.json();
        updateSummary();
        setStatus("Configuration saved", "success");
    } catch (err) {
        console.error("Failed to save config", err);
        setStatus("Failed to save configuration", "error");
    } finally {
        saveButton.disabled = false;
    }
});

load();

toggleButton.addEventListener("click", async () => {
    toggleButton.disabled = true;
    setStatus(moduleData.enabled ? "Disabling..." : "Enabling...");

    try {
        const res = await fetch(
            `/api/guild/${guildId}/${encodeURIComponent(module)}/enabled`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: !moduleData.enabled }),
            },
        );

        if (!res.ok) {
            throw new Error(`Toggle failed with status ${res.status}`);
        }

        const result = await res.json();
        moduleData.enabled = result.enabled;
        moduleData.updatedAt = result.updatedAt;
        updateSummary();
        setStatus(result.enabled ? "Module enabled" : "Module disabled", "success");
    } catch (err) {
        console.error("Failed to toggle module", err);
        setStatus("Failed to toggle module", "error");
        toggleButton.disabled = false;
    }
});
