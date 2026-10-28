import { HtmlBasePlugin } from "@11ty/eleventy";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import markdownItAnchor from "markdown-it-anchor";
import markdownItContainer from "markdown-it-container";
import markdownItMark from "markdown-it-mark";
import texmath from "markdown-it-texmath";
import katex from "katex";
import site from "./_data/site.js";

const TZ = "Asia/Taipei";
const POSTS_GLOB = "posts/**/*.md";

// ---------- 小工具 ----------
const ymd = (date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(new Date(date));
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  return { y: get("year"), m: get("month"), d: get("day") };
};

const stripHtml = (html = "") =>
  String(html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<annotation[\s\S]*?<\/annotation>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

// 標題錨點：保留中文、日文，空白換成連字號
const slugifyHeading = (s) =>
  String(s).trim().toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-_]/gu, "");

const tagSlug = (tag) =>
  String(tag).trim().toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[\/?#%\\]/g, "");

const livePosts = (api) =>
  api.getFilteredByGlob(POSTS_GLOB).filter((p) => !p.data.draft);

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: "zh-Hant-TW",
      title: site.title,
      subtitle: site.description,
      base: site.url + "/",
      author: { name: site.author },
    },
  });

  // ---------- Markdown ----------
  eleventyConfig.amendLibrary("md", (md) => {
    md.set({ linkify: true });
    md.use(markdownItAnchor, { level: [2, 3], slugify: slugifyHeading, tabIndex: false });
    md.use(markdownItMark);

    const callouts = [["tip", "小提醒"], ["note", "筆記"], ["warn", "注意"]];
    for (const [name, label] of callouts) {
      md.use(markdownItContainer, name, {
        render(tokens, idx) {
          const token = tokens[idx];
          if (token.nesting === 1) {
            const custom = token.info.trim().slice(name.length).trim();
            return `<aside class="callout callout-${name}"><p class="callout-title">${md.utils.escapeHtml(custom || label)}</p>\n`;
          }
          return "</aside>\n";
        },
      });
    }

    md.use(texmath, {
      engine: katex,
      delimiters: "dollars",
      katexOptions: { throwOnError: false, output: "html" },
    });
  });

  eleventyConfig.addGlobalData("buildYear", ymd(Date.now()).y);

  // ---------- 文章集合 ----------
  eleventyConfig.addCollection("posts", (api) => livePosts(api));

  eleventyConfig.addCollection("tagList", (api) => {
    const counts = new Map();
    for (const post of livePosts(api)) {
      for (const tag of post.data.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    return [...counts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hant"))
      .map(([name, count]) => ({ name, count }));
  });

  // ---------- 篩選器 ----------
  eleventyConfig.addFilter("dateZh", (date) => {
    const { y, m, d } = ymd(date);
    return `${y} 年 ${m} 月 ${d} 日`;
  });
  eleventyConfig.addFilter("dateShort", (date) => {
    const { m, d } = ymd(date);
    return `${m} 月 ${d} 日`;
  });
  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString());

  eleventyConfig.addFilter("groupByYear", (posts = []) => {
    const groups = [];
    for (const post of posts) {
      const { y } = ymd(post.date);
      let group = groups.find((g) => g.year === y);
      if (!group) groups.push((group = { year: y, posts: [] }));
      group.posts.push(post);
    }
    return groups;
  });

  eleventyConfig.addFilter("readingMinutes", (html) => {
    const text = stripHtml(html);
    const cjk = (text.match(/[぀-ヿ㐀-鿿豈-﫿]/g) || []).length;
    const words = text.replace(/[぀-ヿ㐀-鿿豈-﫿]/g, " ")
      .split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
    return Math.max(1, Math.ceil(cjk / 400 + words / 200));
  });

  eleventyConfig.addFilter("excerpt", (post) => {
    if (post.data.description) return post.data.description;
    const first = String(post.content || "").match(/<p>([\s\S]*?)<\/p>/);
    const text = stripHtml(first ? first[1] : "");
    return text.length > 90 ? text.slice(0, 90) + "…" : text;
  });

  eleventyConfig.addFilter("plainText", (html) => stripHtml(html).slice(0, 4000));

  eleventyConfig.addFilter("toc", (html) => {
    const items = [];
    const re = /<h([23]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
    let m;
    while ((m = re.exec(String(html)))) items.push({ level: Number(m[1]), id: m[2], text: stripHtml(m[3]) });
    return items;
  });

  eleventyConfig.addFilter("withTag", (posts = [], tag) =>
    posts.filter((p) => (p.data.tags || []).includes(tag)));

  eleventyConfig.addFilter("hasMath", (html) => String(html).includes('class="katex'));
  eleventyConfig.addFilter("tagUrl", (tag) => `/tags/${tagSlug(tag)}/`);

  // 菜園：最近 12 個月 × 前 6 個主題
  eleventyConfig.addFilter("garden", (posts = [], tagList = [], months = 12) => {
    const now = ymd(Date.now());
    const cols = [];
    for (let i = months - 1; i >= 0; i--) {
      let y = now.y, m = now.m - i;
      while (m <= 0) { m += 12; y -= 1; }
      cols.push({ y, m });
    }
    const rows = tagList.slice(0, 6).map((t) => ({
      name: t.name,
      cells: cols.map((c) => ({ ...c, posts: [] })),
    }));
    for (const post of posts) {
      const { y, m } = ymd(post.date);
      const ci = cols.findIndex((c) => c.y === y && c.m === m);
      if (ci < 0) continue;
      for (const tag of post.data.tags || []) {
        const row = rows.find((r) => r.name === tag);
        if (row) row.cells[ci].posts.push(post.data.title);
      }
    }
    for (const row of rows) {
      for (const cell of row.cells) {
        const n = cell.posts.length;
        cell.stage = n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : 3;
      }
    }
    return { cols, rows };
  });

  // ---------- 靜態檔案 ----------
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy({
    "node_modules/katex/dist/katex.min.css": "assets/katex/katex.min.css",
    "node_modules/katex/dist/fonts": "assets/katex/fonts",
  });

  eleventyConfig.setServerOptions({ showAllHosts: false });

  return {
    // 文章不經過模板引擎，程式碼裡的 {{ }} 才不會被吃掉
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
  };
}
