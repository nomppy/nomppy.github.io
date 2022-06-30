<script>
export default {
  async asyncData({ redirect }) {
    return redirect('/home');
  },
  // async asyncData({ $content }) {

  //   const posts = await $content('posts')
  //     .only(['title', 'slug', 'category'])
  //     .sortBy('updatedAt', 'asc')
  //     .fetch();

  //   return { posts };
  // },
};
</script>