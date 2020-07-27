/*
 * Copyright ©️ 2019-2020 Galt•Project Society Construction and Terraforming Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka)
 *
 * Copyright ©️ 2019-2020 Galt•Core Blockchain Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) by
 * [Basic Agreement](ipfs/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS)).
 */

const extend = require('lodash/extend');
const snakeCase = require('lodash/snakeCase');
const template = require('lodash/template');
const get = require('lodash/get');
const isArray = require('lodash/isArray');

import axios from 'axios';

export default class Locale {
    static $store;
    static lang;
    static path;
    static url;
    static loaded = false;

    // eventId => callback
    static onLoadEvents = {};
    static onLoadEventsCount = 0;

    static async init(_store, options = {}) {
        let {url, path, lang} = options;
        if(!lang) {
          lang = localStorage.getItem('lang') || _store.state.lang || 'en';
        }
        Locale.$store = _store;
        Locale.url = url;
        Locale.path = path;
        return Locale.setLang(lang);
    }

    static async loadLocale(){
        Locale.$store.commit('locale_loaded', false);
        Locale.loaded = false;

        let localeByPath = {};
        if(Locale.path) {
          if(isArray(Locale.path)) {
            Locale.path.forEach(pathItem => {
              extend(localeByPath, require(pathItem + Locale.lang));
            });
          } else {
            localeByPath = require(Locale.path + Locale.lang);
          }
        }

        let localeByUrl = {};
        if(Locale.url) {
          if(isArray(Locale.url)) {
            const promises = Locale.url.map(async urlItem => {
              const {data: _locale} = await axios.get(urlItem + Locale.lang + '.json');
              extend(localeByUrl, _locale);
            });
            await Promise.all(promises);
          } else {
            const {data: _locale} = await axios.get(Locale.url + Locale.lang + '.json');
            localeByUrl = _locale;
          }
        }

        Locale.$store.commit('locale', extend({}, localeByPath, localeByUrl));
        Locale.$store.commit('locale_loaded', true);
        Locale.loaded = true;

        for(let id in this.onLoadEvents) {
            if(this.onLoadEvents[id]) {
                this.onLoadEvents[id]();
            }
        }
        return Locale.$store.state.locale;
    }

    static get(key, options = null) {
        if(isArray(key)) {
            options = key[1];
            key = key[0];
        }

        let keyParts = key.split('.');
        keyParts = keyParts.map(snakeCase);
        key = keyParts.join('.');

        let result;
        if(options) {
          try {
            result = template(get(Locale.$store.state.locale, key))(options) || '';
          } catch (e) {
            console.error('Locale.get error', key, e);
            result = '';
          }
        } else {
            result = get(Locale.$store.state.locale, key) || '';
        }
        if(!result && Locale.loaded) {
            console.error('[' + Locale.lang + '] Locale not found: ' + key);
            result = key;
        }
        return result;
    }

    static has(key) {
        let keyParts = key.split('.');
        keyParts = keyParts.map(snakeCase);
        key = keyParts.join('.');
        return !!get(Locale.$store.state.locale, key);
    }

    static async setLang(_lang) {
        Locale.lang = _lang;
        localStorage.setItem('lang', _lang);
        Locale.$store.commit('lang', _lang);
        await Locale.loadLocale();
    }

    static onLoad(callback) {
        const id = ++this.onLoadEventsCount;
        this.onLoadEvents[id] = callback;
        return id;
    }

    static unbindOnLoad(id) {
        delete this.onLoadEvents[id];
    }

    static async setTitlesByNamesInList(list, prefix = null, options = null){
        await Locale.waitForLoad();
        return list.map((item) => {
            item.title = Locale.get(prefix + item.name, options) || item.name;
            return item;
        })
    }
    static async waitForLoad() {
        return new Promise((resolve, reject) => {
            if(Locale.loaded){
                resolve();
            } else {
                const onLoadId = Locale.onLoad(() => {
                    resolve();
                    Locale.unbindOnLoad(onLoadId);
                })
            }
        });
    }
}
