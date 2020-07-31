# VueJs locale plugin and directive
Plugin for localization for VueJs applications. Allows to add v-locale directive to any html tag
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
npm i -s @galtproject/vue-locale
```
or
```
yarn add @galtproject/vue-locale
```
2. Include plugin to Vue:
```js
import Vue from 'vue';
import * as Vuex from "vuex";

import locale from '@galtproject/vue-locale';

Vue.use(locale.plugin, {Vuex});
```
3. Init plugin inside main component `created` event:
```js
new Vue({
  el: "#app",
  created() {
    this.$locale.init({lang: 'en', url: '/locale/'});
  }
});
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

5. Use v-locale directive in templates
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
## Using extend option
Plugin supports url or/and extend fields as source for locales. It means that you can include JSON or simple object as locales, or both in cases when you want to extend base locales with additional modules.
```js
this.$locale.init({lang: 'en', url: '/locale/', extend: {
  'en': {
    "another_container": {
      "label": "Hello"
    }
  },
  'es': {
    "another_container": {
      "label": "Hola"
    }
  }
}});
```
In this case - locales will be loaded from JSON in `/locale/` directory from file with current language name(`/locale/en.json` for example), and then - locales data will be extended with another_container field that placed by current language name field(`en` for example, all data inside `en` will be added to data from JSON).
## Init method options
| Field | Type | Description |
| --- | --- | --- |
| lang | string | Default lang. Required. Can be replaced by 'lang' values from localStorage if persist. |
| extend | object or array | Object with locales separated by fields: en, ru, etc. Optional (extend or url required). |
| url | string or array | Url to locales js folder with locales names by languages (`en.json`, `es.json`, etc.). Optional (path or url required). |
| cacheBuster | string | Id for adding as parameter to json url. Useful for avoid caching json for new builds of application. |
## Api
You can access api methods by plugin object inside every vue component inside your project:
```js
export default {
  name: 'main',
  methods: {
    changeLang(lang) {
      this.$locale.setLang(lang);
    }
  }
}
```
| Method | Description |
| --- | --- |
| init(options?) | Initializing library with options that described above. Return promise that resolved on locales ready. |
| get(key, options?) | Get locale content by key. Dots in key is separator for access fields of objects. Options - it is object that passes as lodash template variables, and can be accesses inside locales by <%= myVariable %> syntax. |
| setLang(lang) | Change current lang. All directives in page will be change contents by current language locales automatically.|
| isLoaded() | Returns `true` if locales is loaded and `false` if not.|
| waitForLoad() | Returns promise that resolves when locale will be loaded(useful for locales by url), or returns empty value immediately if locales already loaded.|

## Storage
Storage is available inside vue components by field `$localeStore` and contains `lang`, `isLoaded` and `changed` fields.
```
this.$localeStore.state.lang; // string: current language
this.$localeStore.state.isLoaded; // bool: is locale loaded
this.$localeStore.state.changed; // bool: trigger for subscribe to locales changing, useful in watch and compound functions
```

## More examples
Articles:
1. [How add localization toVueJS app](https://medium.com/@jonybang/how-add-localization-tovuejs-app-a438b8b17b93)
