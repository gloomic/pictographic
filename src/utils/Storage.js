/**
 * Storge utility functions.
 */

let isStorageAvailable = false;

export default class Storage {
    static checkAvailable(type = 'localStorage') {
        var storage;
        try {
            storage = window[type];
            var x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch(e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                (storage && storage.length !== 0);
        }
    }

    static get(key, successCallback, completeCallback) {
        if (isStorageAvailable) {
            successCallback(JSON.parse(localStorage.getItem(key)));
            completeCallback();
        } else {
            completeCallback();
        }
    }

    static set(key, value) {
        if (isStorageAvailable) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }

    static isAvailable() {
        return isStorageAvailable;
    }
}

isStorageAvailable = Storage.checkAvailable();
