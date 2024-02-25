<template>
  <TheHeader />
  <main class="mt-28">
      <div class="mx-auto max-w-[1330px] md:p-4">
          <div class="grid grid-cols-3 md:gap-4">
              <div class="col-span-3 lg:col-span-2 md:p-4">
                  <ContentList :query="query">
                      <template #not-found>
                          <p>No posts found.</p>
                      </template>
                      <template #default="{ list }">
                          <div class="space-y-8">
                              <div
                                  v-for="article in list"
                                  :key="article._path"
                                  class="flex flex-col"
                              >
                                  <div class="grid grid-cols-3 gap-4">
                                      <div
                                          class="col-span-2 p-4"
                                          :class="
                                              article.cover
                                                  ? 'col-span-2'
                                                  : 'col-span-3'
                                          "
                                      >
                                          <NuxtLink :to="article._path">
                                              <h2
                                                  class="text-xl font-bold mb-2"
                                              >
                                                  {{ article.title }}
                                              </h2>
                                          </NuxtLink>
                                          <div class="flex flex-wrap gap-2">
                                              <span
                                                  v-for="tag in article.tags"
                                                  :key="tag"
                                                  >{{ tag }}</span
                                              >
                                          </div>
                                      </div>
                                      <div
                                          v-if="article.cover"
                                          class="col-span-1 p-4 flex justify-center items-center"
                                      >
                                          <NuxtImg
                                              :src="
                                                  '/images/' + article.cover
                                              "
                                              :alt="article.title"
                                              class="w-full object-cover cursor-pointer"
                                              sizes="233px sm:400px md:400px"
                                              format="webp"
                                              loading="lazy"
                                              placeholder
                                              @click="
                                                  navigateTo(article._path)
                                              "
                                          />
                                      </div>
                                  </div>
                                  <hr />
                              </div>
                          </div>
                      </template>
                  </ContentList>
              </div>
          </div>
      </div>
  </main>
  <TheFooter />
</template>
<script setup>
// import { formatDate } from "~/common/format";

const config = useRuntimeConfig();

const query = {
  path: "",
  where: [{ listed: { $ne: false } }],
  limit: 10,
  sort: [{ date: -1 }],
};

useHead({
  title: config.public.name,
  meta: [
      {
          key: "description",
          name: "description",
          content: config.public.description,
      },
      {
          key: "og:description",
          name: "og:description",
          content: config.public.description,
      },
      { key: "og:type", name: "og:type", content: "website" },
      { key: "og:title", name: "og:title", content: config.public.name },
      { key: "og:url", name: "og:url", content: config.public.url },
      {
          key: "twitter:text:title",
          name: "twitter:text:title",
          content: config.public.name,
      },
      { key: "twitter:card", name: "twitter:card", content: "summary" },
  ],
});
</script>