export default async () => {
  const { $content } = require('@nuxt/content');
  const files = await $content('posts')
    .only(['path', 'updatedAt'])
    .fetch();
  return files.map((file) => {
    return {
      url: 'posts/' + file.path.replace('index', ''),
      lastmod: Date.parse(file.updatedAt),
    };
  });
};