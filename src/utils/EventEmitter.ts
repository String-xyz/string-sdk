import { Callback } from "../types";

/* eslint-disable no-prototype-builtins */
export class EventEmitter {
    private listeners: any = {};

    on(event: string, callback: Callback) {
        if (!this.listeners.hasOwnProperty(event)) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(callback);

        return this;
    }

    once(event: string, callback: Callback) {
        if (!this.listeners.hasOwnProperty(event)) {
            this.listeners[event] = [];
        }

        const onceCallback = (...data: any) => {
            callback.call(this, ...data);
            this.removeListener(event, onceCallback);
        };

        this.listeners[event].push(onceCallback);

        return this;
    }

    emit(event: string, ...data: any) {
        if (!this.listeners.hasOwnProperty(event)) {
            return null;
        }

        this.listeners[event].forEach((callback: Callback) => callback.call(this, ...data));
    }

    removeListener(event: string, callback: Callback) {
        if (!this.listeners.hasOwnProperty(event)) {
            return null;
        }

        const index = this.listeners[event].indexOf(callback);

        if (index > -1) {
            this.listeners[event].splice(index, 1);
        }
    }

    removeAllListeners(event: string) {
        if (!this.listeners.hasOwnProperty(event)) {
            return null;
        }

        this.listeners[event] = [];
    }

    getListeners(event: string) {
        if (!this.listeners.hasOwnProperty(event)) {
            return null;
        }

        return this.listeners[event];
    }

    getEvents() {
        return Object.keys(this.listeners);
    }

    getListenerCount(event: string) {
        if (!this.listeners.hasOwnProperty(event)) {
            return null;
        }

        return this.listeners[event].length;
    }
}
