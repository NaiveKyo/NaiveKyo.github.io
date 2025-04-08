---
title: Astro quick start
published: 2025-04-08
description: ''
image: './125836989_p0.jpg'
tags: [Astro]
category: 'Astro'
draft: false
lang: ''
---
> Cover image source: <a href="https://www.pixiv.net/artworks/125836989" target="_blank">Source</a>
# Intro

官网：https://astro.build/

文档：https://docs.astro.build/en/getting-started/

**Astro** is a JavaScript web framework optimized for building fast, content-driven websites.

# Getting Started

Astro 是 all-in-one 的 web 框架，包含创建网站所需的所有东西。而且有非常丰富的 integrations 和 API hooks 用来实现网站功能。

下面是 Astro 的一些特点：

- Islands：用于优化 content-driven websites 的一个基于组件的 web 架构方式；
- UI-agnostic：支持多种框架，比如 Reace、Vue、Preact、Svelte 等；
- Server-first：在项目 build 阶段就会将代码和资源预处理渲染为静态 HTML；
- Zero JS, by default：只有很少的 JavaScript 代码在客户端加载，能提高网站运行速度；
- Content collections：为Markdown内容组织、验证并提供TypeScript类型安全；
- Customizable：有数百个 integrations 可供选择，比如 Tailwind、MDX 等等；

# 分析

## .astro 文件

比如下面这个 .astro 文件可以作为项目的主入口

```astro
---
// Welcome to Astro! Everything between these triple-dash code fences
// is your "component frontmatter". It never runs in the browser.
console.log('This runs in your terminal, not the browser!');
---
<!-- Below is your "component template." It's just HTML, but with
    some magic sprinkled in to help you build great templates. -->
<html>
  <body>
    <h1>Hello, World!</h1>
  </body>
</html>
<style>
  h1 {
    color: orange;
  }
</style>
```

在 `---` 三个连字符围起来的代码中可以导入各类组件，包括 react、vue、astro 等等，这部分内容不会出现在浏览器上，因为在 build 阶段就被处理了；

## 项目结构

项目的根目录下应该包含这些文件和目录：

- `src/**`：项目的源代码（components、pages、styles、images etc.）
- `public/**`：公共资源（fonts、icons etc.）
- `package.json` ：A project manifest.
- `astro.config.js`：Astro 配置文件
- `tsconfig.json`：Typescript 配置文件

src 目录下放的是项目的源代码，可以包含这些：

- Pages：这下面的文件负责站点的路由和数据，以及网站所有页面的布局；（Astro 唯一解析的目录，其他目录其实可以随意重命名和管理）
- Layouts：提供可以复用的 UI 结构的 Astro components，比如说页面的模板，包括 headers、navigation bars，and footers；
- Astro components：Astro 项目的基础 building block。以 .astro 作为后缀，只包含 HTML 内容模板，没有 client-side runtime；
- UI framework components：React、Vue etc.
- Styles：CSS、Sass、Less etc.
- Markdown
- Images to be optimized and processed by Astro：Astro 提供了多种方式处理网站上使用的图片资源，比如存在项目中的图片，或者通过外部 URL 引入的图片，或者使用 CMS、CND 管理的资源；

Astro 对 src 目录中资源进行处理、优化最后打包成 website 页面资源，而 public 目录下的静态资源不会被 Astro 处理。

## public 目录

public 下的资源不会被 Astro 处理，而是直接拷贝到最终构建的产物中。所以我们一般在 public 目录中放置字体或图片文件，或者一些特殊的文件，比如 robots.txt、manifest.webmanifest 等等；

Note：作为一个通用的规则，项目中编写的任何 CSS 和 Javascript 都应该放在 src 目录下，这样 Astro 才能进行相应的优化处理。

## astro.config.mjs

这个文件是 Astro 项目的配置文件，使用任何 template 都会自动生成该文件，在这个文件中可以引入 Astro 的各种 Integration，build options，server options 等等。

Astro 支持多种配置文件格式，比如 `astro.config.js` 、`astro.config.mjs` 、`astro.config.cjs` 以及 `astro.config.ts`。官方推荐使用 .mjs，或者如果要使用 Typescript 开发的话就用 .ts 格式。

# Develop and Build

Astro 内置了一个开发服务器，可以使用 astro dev 指令启动该 server，一般 astro starter template 都会在 package.json 中提供预定义的 script 来执行 astro 的命令，比如 npm run dev。

启动 develop server 后，Astro 会监听 src 目录下面的文件变化并热更新网站，这样就不用在修改文件后重启 server 了。

通过浏览器查看网站时，可以使用 [Astro dev toolbar](https://docs.astro.build/en/guides/dev-toolbar/)。使用它可以查看 islands 等，方便审查组件和排查问题。

# Configuration overview

Astro 是一个非常灵活的框架，允许你通过多种方式来配置项目，可以参考官方的 guide 和 reference。

比如使用 astro.config.mjs 作为项目的 Astro 的配置文件。

```javascript
import { defineConfig } from "astro/config";

export default defineConfig({
  // your configuration options here...
});
```

这里的 `defineConfig()` 函数可以在 IDE 中提供自动补全功能，通过它添加相应的配置选项，从而改变 Astro build 和 render 的功能。

官方建议绝大多数场景下使用 .mjs 后缀的文件，或者项目使用 TypeScript 开发时就用 .ts 后缀的文件。

defineConfig 所有的配置项可以参考：https://docs.astro.build/en/reference/configuration-reference/

## Common new project tasks

一般新建 Astro 项目首先会配置这些：

### deployment domain

网站部署的域名可以传递给 site 配置项，比如 `https://xxx.github.io` ，如果要部署到某个路径下，比如 `https://xxx.github.io/docs` 等，则可以通过 base 配置项设置项目的根路径。

另外，如果 url 最后面有反斜线，比如 `example.com/about` 和 `example.com/about/` ，不同的部署方式也有不同的行为，所以一旦网站部署完成，你需要配置 trailingSlash 选项。

```javascript
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.example.com",
  base: "/docs",
  trailingSlash: "always",
});
```

### add site metadata

Astro 并不会使用它的配置文件作为 common SEO 或者 meta data，仅仅负责将项目构建输出为 HTML 内容。

相反直接编写 HTML 文件时可以将这些信息添加到 head 标签中的 link 和 meta 标签中。

对于 Astro 站点有一个常用的方式就是创建一个 Head.astro 组件作为网站的公共 layout component，这样网站的所有网页都可以使用它。

比如网站的主体 layout 组件是：src/components/MainLayout.astro

```astro
---
import Head from "./Head.astro";

const { ...props } = Astro.props;
---
<html>
  <head>
    <meta charset="utf-8">
    <Head />
    <!-- Additional head elements -->
  </head>
  <body>
    <!-- Page content goes here -->
  </body>
</html>
```

同时因为 Head.astro 也是一个 Astro component，因此在该文件中也可以导入其他文件和接受其他组件传递给 Head 的属性，比如传入每个页面的 title：

src/components/Head.astro

```astro
---
import Favicon from "../assets/Favicon.astro";
import SomeOtherTags from "./SomeOtherTags.astro";

const { title = "My Astro Website", ...props } = Astro.props;
---
<link rel="sitemap" href="/sitemap-index.xml">
<title>{title}</title>
<meta name="description" content="Welcome to my new Astro site!">

<!-- Web analytics -->
<script data-goatcounter="https://my-account.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>

<!-- Open Graph tags -->
<meta property="og:title" content="My New Astro Website" />
<meta property="og:type" content="website" />
<meta property="og:url" content="http://www.example.com/" />
<meta property="og:description" content="Welcome to my new Astro site!" />
<meta property="og:image" content="https://www.example.com/_astro/seo-banner.BZD7kegZ.webp">
<meta property="og:image:alt" content="">

<SomeOtherTags />

<Favicon />
```

## TypeScript

Astro 内置支持 TypeScript，可以直接在项目下导入 .ts 和 .tsx 文件，或者直接在 Astro 组件中写 ts 代码

在 Astro 项目中包含 tsconfig.json 文件。

Astro 提供了三种可扩展的 tsconfig.json 模版，分别是：

- base：支持 modern JavaScript features，同时也可以作为其他 templates 的基础模版；
- strict 和 strictest 用于使用 TypeScript 编写的项目，更多信息参考：[astro/tsconfigs](https://github.com/withastro/astro/tree/main/packages/astro/tsconfigs)

简单的配置：

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": ["src/**/*"],
  "exclude": ["dist"]
}
```

此外也可以创建 src/env.d.ts 文件来声明自定义的 type 或者引入 Astro types：

```typescript
// Custom types declarations
declare var myString: string;

// Astro types, not necessary if you already have a `tsconfig.json`
/// <reference path="../.astro/types.d.ts" />
```

### Component Props

Astro 支持通过 TypeScript typeing 组件的 props，只需要在 Astro 组件的 frontmatter 中定义一个 Props 接口，这样当你在其他 template 中使用了这个组件，vscode 的 Astro 插件就可以自动找到这个组件中的 Props interface。

src/components/HelloProps.astro

```astro
---
interface Props {
  name: string;
  greeting?: string;
}

const { greeting = "Hello", name } = Astro.props;
---
<h2>{greeting}, {name}!</h2>
```

## Environment variables

Astro 提供了访问 Vite 内置环境变量的能力，同时也为你的项目注入了默认的一些环境变量，这样我们就可以在项目中访问配置文件的变量（e.g. site, base）。

更多信息参考官方文档。

# Routing and navigation

Astro 使用基于文件的路由，这些文件都在 src/pages 目录下。

## Static routes

比如这样：

```
# Example: Static routes
src/pages/index.astro        -> mysite.com/
src/pages/about.astro        -> mysite.com/about
src/pages/about/index.astro  -> mysite.com/about
src/pages/about/me.astro     -> mysite.com/about/me
src/pages/posts/1.md         -> mysite.com/posts/1
```

Note：这里并没有一个单独的 "Routing config" 文件用来管理 Astro 项目的路由规则，都是基于文件的，当我们在 src/pages 目录下新增了一个文件，Astro 就会自动创建一个对应的 route。

## Dynamic routes

一个 Astro page file 可以通过在文件名中声明一个 dynamic route parameters 来生成多个匹配到的页面。比如 `src/pages/authors/[author].astro` 可以为博客中的所有作者生成一个 bio 页面。文件名中的 author 是一个在 page 中可以访问的参数。

在 Astro 默认的 static output 模式中，这些 pages 上在 build 阶段生成的，所以我们需要提前准备好一个 author 的列表并且指定他们关联的文件。而在 SSR 模式，当运行时请求到相应的 route 时才会生成对应的 page。

### Static（SSG）Mode

由于所有的路由必须在构建阶段确定，因此动态路由必须通过 `getStaticPaths()` 方法导出一个对象数组，且每个对象有一个 params 属性。每个 object 都会生成对应的 route。

\[dog].astro 通过文件名定义了一个动态参数 dog，因此通过 getStaticPaths() 返回的对象的 params 中需要包含 dog。这样在 page 中才可以通过 Astro.params 才可以访问这个参数：

src/pages/dogs/\[dog].astro

```astro
---
export function getStaticPaths() {
  return [
    { params: { dog: "clifford" }},
    { params: { dog: "rover" }},
    { params: { dog: "spot" }},
  ];
}

const { dog } = Astro.params;
---
<div>Good dog, {dog}!</div>
```

这个文件会生成三个 page：

- /dogs/clifford
- /dogs/rover
- /dogs/spot

文件名中也可以包含多个参数，这些参数必须都出现在 getStaticPath() 方法导出的对象的 params 参数中。

比如：src/pages/\[lang]-\[version]/info.astro

```astro
---
export function getStaticPaths() {
  return [
    { params: { lang: "en", version: "v1" }},
    { params: { lang: "fr", version: "v2" }},
  ];
}

const { lang, version } = Astro.params;
---
```

这会生成 /en-v1/info 和 /fr-v2/info。

参数也可以包含在 path 中，比如，这个文件 `/src/pages/[lang]/[version]/info.astro` 中如果按照上面的写法，就会生成 /en/v1/info 和 /fr/v2/info。

### Decoding params

由 getStaticPaths() 函数导出的对象中的 params 对象没有被 decoded，如果需要可以通过 decodeURI 函数进行处理：

```astro
---
export function getStaticPaths() {
  return [
    { params: { slug: decodeURI("%5Bpage%5D") }}, // decodes to "[page]"
  ]
}
---
```

有些路径参数或者需要 i18n 功能的参数需要进行处理。

### Rest parameters

如果需要 URL routing 提供更灵活的功能，可以使用在文件名中使用 rest parameter（`[...path]`）来匹配任意深度的路径：

src/pages/sequences/\[..path].astro

```astro
---
export function getStaticPaths() {
  return [
    { params: { path: "one/two/three" }},
    { params: { path: "four" }},
    { params: { path: undefined }}
  ]
}

const { path } = Astro.params;
---
```

这会生成 /sequences/one/two/three、/sequences/four 和 /sequences（将 rest parameter 设置成 undefined 将会匹配最顶层的 page）。

Rest parameters 可以和其他 named parameters 一起使用。比如说 GitHub 的 file viewer 可以使用下面的动态路由表示：

`/[org]/[repo]/tree/[branch]/[...file]`

> Example: Dynamic pages at multiple levels

下面的例子使用一个 rest parameter \[..slug] 和 getStaticPaths() 的 [props ](https://docs.astro.build/en/reference/routing-reference/#data-passing-with-props)功能为 slug 生成不同深度的 path:

src/pages/\[..slug].astro

```astro
---
export function getStaticPaths() {
  const pages = [
    {
      slug: undefined,
      title: "Astro Store",
      text: "Welcome to the Astro store!",
    },
    {
      slug: "products",
      title: "Astro products",
      text: "We have lots of products for you",
    },
    {
      slug: "products/astro-handbook",
      title: "The ultimate Astro handbook",
      text: "If you want to learn Astro, you must read this book.",
    },
  ];

  return pages.map(({ slug, title, text }) => {
    return {
      params: { slug },
      props: { title, text },
    };
  });
}

const { title, text } = Astro.props;
---
<html>
  <head>
    <title>{title}</title>
  </head>
  <body>
    <h1>{title}</h1>
    <p>{text}</p>
  </body>
</html>
```

### Server（SSR）Mode

参考：https://docs.astro.build/en/guides/routing/#server-ssr-mode

### Route Priority Order

Astro 允许为多个 route 配置相同的 URL path，比如下面的配置所有的 routes 都会匹配 /posts/create

```
src/pages/
    […slug].astro
    posts/
      create.astro
      [page].astro
      [pid].ts
      […slug].astro
```

Astro 需要知道应该使用哪个 route 来构建页面，因此它按照下面的规则对它们进行排序：

1. Astro [reserved routes](https://docs.astro.build/en/guides/routing/#reserved-routes) （Astro 保留的 route，也就是框架默认会注入的 route，优先级要高于用户自定义和使用的 intergation 中定义的 route）；
2. 拥有更多 path segments 的要比更少的 route 具备更高的优先级，在上面的例子中，所有在 posts 目录下的 route 的优先级要高于 \[...slug].astro；
3. 没有 path parameters 的 static routes 的优先级要高于 dynamc routes。E.g. /post/create.astro 要比其他 route 的优先级更高；
4. 拥有 named parameters（具名参数）的 dynamic route 的优先级要高于其他动态路由。E.g. /posts/\[page].astro 要比 /posts/\[...slug].astro 的优先级高；
5. Pre-rendered 的动态路由的优先级要比 server 动态路由高；
6. Endpoints 的优先级要比 pages 高；
7. 基于 file 的 route 优先级要高于 redirects；
8. 如果无法根据上面的规则确定 route，就按照名称字母顺序进行排序（基于安装的 Node 的 locale 来决定排序规则）；

> Reserved routes

Astro 的内部 routes 要比用户自定义或者引入的 integration-defined 的 routes 优先级更高，因为需要确保 Astro 的功能能正常使用，下面说 Astro 的一些保留的 routes：

- \_astro/：client 的所有静态资源，比如 CSS、打包的 client script、优化的图片以及其他 Vite 资源；
- \_server\_islands/：使用 [server island](https://docs.astro.build/en/guides/server-islands/) 延迟渲染的动态组件；
- \_actions/：定义的 [actions](https://docs.astro.build/en/guides/actions/)；

### Pagination

Astro 对大量数据提供内置的分页功能，可以参考：https://docs.astro.build/en/guides/routing/#pagination

### Endpoints

参考：https://docs.astro.build/en/guides/endpoints/