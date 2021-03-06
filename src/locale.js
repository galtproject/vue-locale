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
    static extend;

    static content;

    // eventId => callback
    static onLoadEvents = {};
    static onLoadEventsCount = 0;

    static setStore($store) {
      Locale.$store = $store;
    }

    static async init(options = {}) {
        let {url, path, lang, cacheBuster, extend} = options;

        lang = localStorage.getItem('lang') || lang;

        Locale.url = url;
        Locale.path = path;
        Locale.cacheBuster = cacheBuster;
        Locale.extend = extend;
        return Locale.setLang(lang);
    }

    static isLoaded() {
      return Locale.$store.state.isLoaded;
    }

    static async loadLocale(){
        Locale.$store.commit('isLoaded', false);

        let localeByExtend = {};
        if(Locale.extend) {
          if(isArray(Locale.extend)) {
            Locale.extend.forEach(extendItem => {
              extend(localeByExtend, extendItem[Locale.lang]);
            });
          } else {
            localeByExtend = Locale.extend[Locale.lang];
          }
        }

        let localeByUrl = {};
        if(Locale.url) {
          let postfix = Locale.cacheBuster ? '?cacheBuster=' + Locale.cacheBuster : '';
          if(isArray(Locale.url)) {
            const promises = Locale.url.map(async urlItem => {
              const {data: _locale} = await axios.get(urlItem + Locale.lang + '.json' + postfix);
              extend(localeByUrl, _locale);
            });
            await Promise.all(promises);
          } else {
            const {data: _locale} = await axios.get(Locale.url + Locale.lang + '.json' + postfix);
            localeByUrl = _locale;
          }
        }

        Locale.content = extend({}, localeByExtend, localeByUrl);
        Locale.$store.commit('isLoaded', true);
        Locale.$store.commit('changed', !Locale.$store.state.changed);

        for(let id in this.onLoadEvents) {
            if(this.onLoadEvents[id]) {
                this.onLoadEvents[id]();
            }
        }
        return Locale.content;
    }

    static setContent(content) {
      Locale.$store.commit('isLoaded', false);
      Locale.content = content;
      Locale.$store.commit('isLoaded', true);
      Locale.$store.commit('changed', !Locale.$store.state.changed);
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
            result = template(get(Locale.content, key))(options) || '';
          } catch (e) {
            console.error('Locale.get error', key, e);
            result = '';
          }
        } else {
            result = get(Locale.content, key) || '';
        }
        if(!result && Locale.isLoaded()) {
            console.error('[' + Locale.lang + '] Locale not found: ' + key);
            result = key;
        }
        return result;
    }

    static has(key) {
        let keyParts = key.split('.');
        keyParts = keyParts.map(snakeCase);
        key = keyParts.join('.');
        return !!get(Locale.content, key);
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
            if(Locale.isLoaded()){
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
