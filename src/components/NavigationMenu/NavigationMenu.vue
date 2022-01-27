<template>
  <div class="NavigationMenu">
    <ul>
      <li
        v-for="route in routes"
        :key="route.name"
        class="NavigationMenu__list-element"
      >
        <router-link :to="route.path" class="NavigationMenu__link">
          {{ route.name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
  import routes from 'virtual:generated-pages';
  import { capitalCase } from 'change-case';

  export default {
    name : 'NavigationMenu',
    computed : {
      routes() {
        return routes.map(route => ({
          name : capitalCase(route.name),
          path : route.path
        }));
      }
    }
  };
</script>

<style lang="scss">
  .NavigationMenu {
    &__h1 {
      color: $black;
    }
    &__list-element {
      margin-bottom: 5px;
    }
    &__link {
      color: blue;
      text-decoration: underline;
    }
  }
</style>
