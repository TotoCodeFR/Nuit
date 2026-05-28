import "./ServerIcon.css";

type ServerIconProps = {
    iconUrl?: string | null;
    name: string;
    size?: number;
};

function getIconUrl(iconUrl: string, size: number) {
    const url = new URL(iconUrl);
    url.searchParams.set("size", String(size));
    return url.toString();
}

function getCorrectElement(
    iconUrl: string | null | undefined,
    initials: Array<string>,
) {
    try {
        const url = new URL(iconUrl!);

        if (url) {
            return (
                <img
                    src={url.toString()}
                    alt={initials.join("")}
                    width={url.searchParams.get("size") || 48}
                    height={url.searchParams.get("size") || 48}
                    className="serverIcon__img"
                />
            );
        }
    } catch {
        if (initials) {
            return <p className="serverIcon__initials">{initials.join("")}</p>;
        }
    }
}

export default function ServerIcon({ iconUrl, name, size }: ServerIconProps) {
    let url: string | null | undefined;
    let initials: string[] = [];
    if (!iconUrl) {
        name?.split(" ").forEach((w) => {
            initials.push(w[0] as string);
        });
    } else {
        if (size) {
            url = getIconUrl(iconUrl, size);
        } else {
            url = iconUrl;
        }
    }

    return (
        <div
            className="serverIcon"
            style={{ width: size || 48, height: size || 48 }}
        >
            {getCorrectElement(url, initials)}
        </div>
    );
}
