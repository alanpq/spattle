<template>
  <li>
    <h3>{{ result.name }}</h3>
    <h4>
      {{
        result.artists
          .reduce((acc, artist) => {
            return `${acc}, ${artist.name}`;
          }, "")
          .slice(2)
      }}
    </h4>
  </li>
</template>

<style lang="scss">
</style>

<script>
export default {
  props: {
    result: Object,
  },
};
</script>