// posts 資料夾裡每篇文章的共用設定
export default {
  layout: "layouts/post.njk",
  eleventyComputed: {
    // draft: true 的文章不會發布
    permalink: (data) => (data.draft ? false : `/posts/${data.page.fileSlug}/`),
  },
};
