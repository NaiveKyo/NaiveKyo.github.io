---
title: NPM Brief Introduction
published: 2024-03-25
description: "A brief overview of npm."
image: './20220425111527.jpg'
tags: ["NPM"]
category: "NPM"
draft: false
lang: 'zh'
---

# NPM

官网：https://www.npmjs.com/

文档：https://docs.npmjs.com/

## About NPM

npm 是前端的包管理工具，也是世界上最大的 software registry。主要包含不同的模块：

- the website
  - 在网站上可以搜索各种工具，也可以开源自己的工具包。
- the Command Line Interface（CLI）
  - 命令行工具，开发者通过 CLI 来使用 npm。
- the registry
  - 存储 JavaScript software 及其 meta-information 的 database。



## Learn more

Node School：https://docs.npmjs.com/

CLI reference documentation：https://docs.npmjs.com/cli/v10



## Cli documentation

开发环境：

- Node 版本管理工具 NVM：
  - POSIX system：https://github.com/nvm-sh/nvm
  - Windows system：https://github.com/coreybutler/nvm-windows
- Node.js
- NPM

根据使用的 Node 和 NPM 版本选择对应的文档。

## Usual Commands

NPM 的各个命令：https://docs.npmjs.com/cli/v10/commands

下面介绍一些常用的命令，更多的以后慢慢补充。

（如果有些 package 无法下载，也可以考虑配置 npm 的镜像，比如国内的 [npmmirror](https://npmmirror.com/)）

```bash
# npm 单独配置国内镜像仓库
npm config set registry https://registry.npmmirror.com

# nvm 配置 node 下载镜像和 npm 下载镜像
nvm node_mirror https://npmmirror.com/mirrors/node/
nvm npm_mirror https://npmmirror.com/mirrors/npm/
```



### package 相关命令

#### （1）查找相关包

可以去 [NPM 官网](https://www.npmjs.com/) 搜索需要的 package。

#### （2）搜索包

命令概览：

```bash
npm search [search terms ...]

aliases: find, s, se
```

比如搜索 vue-cli 的版本：`npm search '@vue/cli'`

#### （3）列出已经安装的所有 package

树状结构展示，命令结构：

```bash
npm ls <package-spec>

alias: list
```

#### （4）安装 package

命令概览，参考 https://docs.npmjs.com/cli/v8/commands/npm-install：

```bash
npm install [<package-spec> ...]

aliases: add, i, in, ins, inst, insta, instal, isnt, isnta, isntal, isntall
```

这个命令会安装指定的依赖及该依赖关联的 package。

- [关于 package.json](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)
- [关于 package-lock.json](https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json)
- [关于 npm-shrinkwrap 命令](https://docs.npmjs.com/cli/v8/commands/npm-shrinkwrap)

官方文档对该命令做了详细描述，有些需要注意的点，比如说 npm install 安装的依赖默认会放到 package.json 的 dependencies 标签下，除此之外还可以通过一些附加的 flag 来更改相关行为：

- `-P,--save-prod`：默认的行为，将 package 放到 package.json 的 dependencies；
- `-D, --save-dev`：package 会放到 devDependencies 中；
- `-O, --save-optional`：package 会放到 optionalDependencies 中；
- `--no-save`：会阻止将 package 放入 dependencies；

当我们使用上述 options 中的某个选项将依赖保存到 package.json 中时，还可以结合两个附加的 flags：

- `-E, --save-exact`：保存依赖时会同时配置一个确切的 version，而不是使用 npm 默认的范围操作符；
- `-B, --save-bundle`：保存依赖的同时也会将其添加到 bundleDependencies 中。

如果你有一个 `npm-shrinkwrap.json` 或者 `package-lock.json`，它们也会随之被正确的更新。

#### （5）卸载依赖

命令概览，参考 https://docs.npmjs.com/cli/v10/commands/npm-uninstall；

```bash
npm uninstall [<@scope>/]<pkg>...

aliases: unlink, remove, rm, r, un
```

#### （6）升级依赖

命令概览，参考 https://docs.npmjs.com/cli/v10/commands/npm-update

```bash
npm update [<pkg>...]

aliases: up, upgrade, udpate
```

#### （7）缓存

命令概览，参考 https://docs.npmjs.com/cli/v10/commands/npm-cache

```bash
npm cache add <package-spec>
npm cache clean [<key>]
npm cache ls [<name>@<version>]
npm cache verify
```

管理 packages cache，可以新增、显示或者清空 npm cache folder；

#### （8）npm exec & npx

Run a command from a local or remote npm package.

这两个命令都可以执行某个 npm package 的特定的命令，不管这个 package 是已经安装到本地了还是在远程环境中。

参考：

- https://docs.npmjs.com/cli/v10/commands/npm-exec
- https://docs.npmjs.com/cli/v10/commands/npx



#### （9）npm config

该命令用于管理 npm 的配置文件。

```bash
npm config set <key>=<value> [<key>=<value> ...]
npm config get [<key> [<key> ...]]
npm config delete <key> [<key> ...]
npm config list [--json]
npm config edit
npm config fix

alias: c
```



#### （10）npm init

该命令用于创建一个 `package.json` 文件。

文档：https://docs.npmjs.com/cli/v10/commands/npm-init

```bash
npm init <package-spec> (same as `npx <package-spec>`)
npm init <@scope> (same as `npx <@scope>/create`)

aliases: create, innit
```



#### （11）npm run-script

参考：https://docs.npmjs.com/cli/v10/commands/npm-run-script

```bash
npm run-script <command> [-- <args>]

aliases: run, rum, urn
```



## Configuring NPM

### Folder Structures

地址：https://docs.npmjs.com/cli/v10/configuring-npm/folders



### .npmrc

npm 的配置文件：https://docs.npmjs.com/cli/v10/configuring-npm/npmrc



### package.json

参考：https://docs.npmjs.com/cli/v10/configuring-npm/package-json



## more information

参考：https://docs.npmjs.com/cli/v10/using-npm