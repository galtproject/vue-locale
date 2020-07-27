# Vue locale library
Library for make multi-language Vue applications. Allows to add v-locale directive to any html tag 
for place locale content that bases on current language. Supports hot locales changing and remote json 
locales content placement.

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
1. Install by npm or yarn:
```
npm i -s vue-locale # or yarn add vue-locale
```
2. Include directive to Vue:
```js
import Vue from 'vue';

import locale from '@galtproject/vue-locale';
Vue.use(locale.plugin);
```
3. Add locale to your store
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
4. Init plugin inside main component `created` event:
```js
export default {
  name: 'main',
  created() {
    this.$locale.init(this.$store, {lang: 'en', url: '/locale/'});
  }
}
```
5. Place files with locales JSON to public folder `/locale/`:

Example of `/locale/en.json` file:
```json
{
  "my_container": {
    "label": "Hello <%= username %>",
    "description": "This is <b>awesome</b> locales\n\nTry it!"
  }
}
```
6. Use v-locale directive in templates
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
## Init method options
| Field | Type | Description |
| --- | --- | --- |
| lang | string | Default lang. Required. |
| path | string or array | Path to locales js folder with locales names by languages (`en.js`, `es.js`, etc.). Optional (path or url required). |
| url | string or array | Url to locales js folder with locales names by languages (`en.json`, `es.json`, etc.). Optional (path or url required). |
## Api
| Method | Description |
| --- | --- |
| get(key, options?) | Get locale content by key. Dots in key is separator for access fields of objects. Options - it is object that passes as lodash template variables, and can be accesses inside locales by <%= myVariable %> syntax. |
| setLang(lang) | Change current lang. All directives in page will be change contents by current language locales automatically.|
| waitForLoad() | Returns promise that resolves when locale will be loaded(useful for locales by url), or returns empty value immediately if locales already loaded.|