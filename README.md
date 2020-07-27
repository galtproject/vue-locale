# Vue locale library
## Usage example
Locales:
```json
{
  "my_container": {
    "label": "Hello <%= username %>",
    "description": "This is <b>awesome</b> locales\n\nTry it!"
  }
}
```
Component:
```vue
export default {
    template: `
    <div class="my-container">
        <span class="label" v-locale="['my_container.label', {username}]"></span>
        <pre class="description" v-locale="'my_container.description'"></pre>
    </div>
    `,
    data() {
        return {
          username: 'Test user'
        }
    }
}
```
## How to use:
1. Include directive to Vue:
```js
import Vue from 'vue';

import locale from '@galtproject/vue-locale';
Vue.use(locale.plugin);
```
2. Add locale to your store
```js
import * as Vuex from "vuex";
Vue.prototype.$store = new Vuex.Store({
    state: {
      lang: null,
      locale: null,
      locale_loaded: false
    },
    mutations: {
      lang: (state, newValue) => {
        state.lang = newValue;
      },
      locale: (state, newValue) => {
        state.locale = newValue;
      },
      locale_loaded: (state, newValue) => {
        state.locale_loaded = newValue;
      }
    }
})
```
3. Init plugin inside main component `created` event:
```js
export default {
  name: 'main',
  created() {
    this.$locale.init(this.$store, {lang: 'en', url: '/locale/'}).then(() => {
      this.$store.commit('locale_loaded', true);
    });
  }
}
```
4. Place files with locales JSON to public folder `/locale/`:

Example of `/locale/en.json` file:
```json
{
  "my_container": {
    "label": "Hello <%= username %>",
    "description": "This is <b>awesome</b> locales\n\nTry it!"
  }
}
```