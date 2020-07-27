/*
 * Copyright ©️ 2019-2020 Galt•Project Society Construction and Terraforming Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka)
 *
 * Copyright ©️ 2019-2020 Galt•Core Blockchain Company
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) by
 * [Basic Agreement](ipfs/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS)).
 */

import Locale from "./locale";

export default {
  install (Vue, options = {}) {
    const {Vuex} = options;

    Vue.prototype.$locale = Locale;

    Vue.directive('locale', {
      bind (el, binding) {
        el.dataset.localOnLoadId = Locale.onLoad(() => {
          setElContentByLocale(el, binding.value);
        }).toString();

        setElContentByLocale(el, binding.value);
      },
      update (el, binding) {
        setElContentByLocale(el, binding.value);
      },
      unbind (el, binding) {
        Locale.unbindOnLoad(el.dataset.localOnLoadId);
      }
    });

    Vue.directive('locale-placeholder', {
      bind (el, binding) {
        el.dataset.localOnLoadId = Locale.onLoad(() => {
          setElPlaceholderByLocale(el, binding.value);
        }).toString();

        setElPlaceholderByLocale(el, binding.value);
      },
      update (el, binding) {
        setElPlaceholderByLocale(el, binding.value);
      },
      unbind: function (el, binding) {
        Locale.unbindOnLoad(el.dataset.localOnLoadId);
      }
    });

    Vue.prototype.$localeStore = new Vuex.Store({
      state: {
        lang: null,
        locale_loaded: false
      },
      mutations: {
        lang: (state, newValue) => {
          state.lang = newValue;
        },
        locale_loaded: (state, newValue) => {
          state.locale_loaded = newValue;
        }
      }
    });

    Locale.setStore(Vue.prototype.$localeStore);
  }
}

function setElPlaceholderByLocale(el, key) {
  el.placeholder = Locale.get(key) || '';
}

function setElContentByLocale(el, key) {
  el.innerHTML = Locale.get(key);
}
