import type {
    ModuleConfigResponse,
    ModuleOverview,
} from "./configTypes";

type CurrentUser = {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
};

type MutualGuild = {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
    features: string[];
};

type GuildResponse = {
    id: string;
    name: string;
    iconURL?: () => string | null;
    memberCount?: number;
    locale?: string;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        credentials: "include",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        throw new Error(`Request failed (${response.status}) for ${url}`);
    }

    return (await response.json()) as T;
}

export const api = {
    getCurrentUser() {
        return request<CurrentUser>("/api/users/@me");
    },
    getMutualGuilds() {
        return request<MutualGuild[]>("/api/guilds/common");
    },
    getGuild(guildId: string) {
        return request<GuildResponse>(`/api/guild/${guildId}`);
    },
    getGuildModules(guildId: string) {
        return request<ModuleOverview[]>(`/api/guild/${guildId}/modules`);
    },
    getModuleConfig(guildId: string, moduleId: string) {
        return request<ModuleConfigResponse>(
            `/api/guild/${guildId}/${encodeURIComponent(moduleId)}/config`,
        );
    },
    updateModuleConfig(
        guildId: string,
        moduleId: string,
        config: Record<string, string | number | boolean>,
    ) {
        return request<ModuleConfigResponse>(
            `/api/guild/${guildId}/${encodeURIComponent(moduleId)}/config`,
            {
                method: "PUT",
                body: JSON.stringify({ config }),
            },
        );
    },
    toggleModuleEnabled(guildId: string, moduleId: string, enabled: boolean) {
        return request<{ enabled: boolean; updatedAt: string | null }>(
            `/api/guild/${guildId}/${encodeURIComponent(moduleId)}/enabled`,
            {
                method: "PUT",
                body: JSON.stringify({ enabled }),
            },
        );
    },
};

export type { CurrentUser, MutualGuild, GuildResponse };
