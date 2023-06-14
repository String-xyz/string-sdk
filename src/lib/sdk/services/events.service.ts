import { EventEmitter } from "../utils/EventEmitter";

export enum Events {
    IFRAME_LOADED = "iframe_loaded",
    CARD_TOKENIZED = "card_tokenized",
    CARD_TOKENIZE_FAILED = "card_tokenize_failed",
    TX_SUCCESS = "tx_success",
    TX_ERROR = "tx_error",
}

export function createEventsService() {
    const emitter = new EventEmitter();

    const on = emitter.on.bind(emitter);
    const once = emitter.once.bind(emitter);
    const propagate = emitter.emit.bind(emitter);

    return {
        ...Events,
        on,
        once,
        propagate,
    };
}
