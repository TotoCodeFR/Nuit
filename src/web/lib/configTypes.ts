export type SelectOption = {
    label: string;
    value: string;
};

export type ModuleConfigField = {
    key: string;
    label: string;
    description?: string;
    optional?: boolean;
    group?: string;
    default?: string | number | boolean;
    module?: string;
} & (
    | {
          type: "string" | "channel" | "role" | "user" | "secret";
          min?: number;
          max?: number;
      }
    | {
          type: "number";
          min?: number;
          max?: number;
      }
    | {
          type: "boolean";
      }
    | {
          type: "select";
          options: SelectOption[];
      }
);

export type ModuleOverview = {
    id: string;
    name: string;
    kind: "internal" | "essential" | "optional" | null;
    enabled: boolean;
    configurable: boolean;
    commandCount: number;
    eventCount: number;
    fieldCount: number;
    updatedAt: string | null;
};

export type ModuleConfigResponse = {
    guildId: string;
    module: string;
    schema: ModuleConfigField[];
    enabled: boolean;
    config: Record<string, string | number | boolean>;
    updatedAt: string | null;
};
