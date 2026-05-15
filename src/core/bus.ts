import type {
    MessageBus,
    MessageKey,
    Listener,
    PredicateListener,
    MessagePayload,
} from "@nuit-bot/api";
import chalk from "chalk";

type ExactEntry = { listener: Listener<MessageKey> };
type PredicateEntry = {
    predicate: (key: string, payload: unknown) => boolean;
    listener: PredicateListener;
};

export function createMessageBus(): MessageBus {
    const exactListeners = new Map<string, Set<ExactEntry>>();
    const predicateListeners = new Set<PredicateEntry>();

    function on<K extends MessageKey>(
        key: K,
        listener: Listener<K>,
    ): () => void {
        if (!exactListeners.has(key)) exactListeners.set(key, new Set());
        const entry: ExactEntry = {
            listener: listener as Listener<MessageKey>,
        };
        exactListeners.get(key)!.add(entry);
        return () => exactListeners.get(key)?.delete(entry);
    }

    function onMatch(
        predicate: (key: string, payload: unknown) => boolean,
        listener: PredicateListener,
    ): () => void {
        const entry: PredicateEntry = { predicate, listener };
        predicateListeners.add(entry);
        return () => predicateListeners.delete(entry);
    }

    function emit<K extends MessageKey>(
        key: K,
        payload: MessagePayload<K>,
    ): void {
        const entries = exactListeners.get(key);
        if (entries) {
            for (const entry of entries) {
                Promise.resolve(entry.listener(payload as never)).catch(
                    (err) => {
                        console.error(
                            chalk.red(`[bus] Listener for "${key}" threw:`),
                            err,
                        );
                    },
                );
            }
        }

        for (const entry of predicateListeners) {
            if (!entry.predicate(key, payload)) continue;
            Promise.resolve(entry.listener(key, payload)).catch((err) => {
                console.error(
                    chalk.red(`[bus] Predicate listener threw on "${key}":`),
                    err,
                );
            });
        }
    }

    return { on, onMatch, emit };
}
