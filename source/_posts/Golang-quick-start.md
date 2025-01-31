---
title: Golang quick start
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425121105.jpg'
coverImg: /img/20220425121105.jpg
cover: false
toc: true
mathjax: false
date: 2025-01-31 11:45:25
summary: "Golang quick start."
categories: "Golang"
keywords: "Golang"
tags: "Golang"
---

# 配置 Go 开发环境

# 简介

官网：https://go.dev/

package repository：https://pkg.go.dev/

编辑器：Visual Studio Code

## 配置开发环境

在官网下载 latest stable 版本的 go 进行安装后，安装成功后执行以下脚本进行验证：

```shellscript
# 安装成功后输出版本
go version
```

VsCode 安装 Go 官方提供的 plugin，需要注意的是该插件需要下载一些 tools 才可以正常使用，但是在国内没法直接下载，用代理好像也不太行，不过国内有相关的镜像：

* https://github.com/goproxy
* https://github.com/goproxy/goproxy.cn?tab=readme-ov-file

更多信息可以参考 Go 中文社区：

```shellscript
# 查看 go 相关的所有环境变量
go env

# 查看 env command 的说明
go help env
# 查看环境变量的具体含义
go help environment

# 下面是要使用到的环境变量           
# GO111MODULE 用于控制 go 的 command 是使用 module-aware 模式还是 GOPAT 模式
# GOPROXY, Go module 使用的代理, 是一个 URL, 具体可以参考官方文档

# windows 系统设置 go 的环境变量
go env -w GO111MODULE=on # 使用 module-aware 模式来运行 go 的命令
go env -w GOPROXY=https://goproxy.cn,direct # 直接从 version control repositories 下载，而不是使用 module proxy
```

GOProxy：https://go.dev/ref/mod#environment-variables

## 安装 tools

VsCode 中 Go 官方的 plugin 需要的相关 module 可以参考插件的 GitHub 仓库源码：

* https://github.com/golang/vscode-go/blob/master/extension/tools/allTools.ts.in



```shellscript
go install -v golang.org/x/tools/gopls@latest

go install -v github.com/fatih/gomodifytags@latest

go install -v github.com/haya14busa/goplay/cmd/goplay@latest

go install -v github.com/josharian/impl@latest

go install -v mvdan.cc/gofumpt@latest

go install -v golang.org/x/tools/cmd/goimports@latest

go install -v github.com/cweill/gotests/gotests@latest

go install -v golang.org/x/lint/golint@latest

go install -v honnef.co/go/tools/cmd/staticcheck@latest

go install -v github.com/golangci/golangci-lint/cmd/golangci-lint@latest

go install -v github.com/mgechev/revive@latest

go install -v github.com/go-delve/delve/cmd/dlv@latest

go install -v github.com/golang/vscode-go/vscgo@latest
```

以 windows 系统为例，默认情况下这些 module 会被下载到 `C:\User\${用户名}\go\bin` 目录下。

## Hello Go World

开发环境准备完毕后，在特定目录下打开 vscode，使用命令：

```shellscript
# 初始化一个 module
go mode init io.naivekyo/hello
```

执行完上述脚本后，会在当前目录下生成一个 go.mod 文件，内部声明了当前模块的信息，然后新建 hello.go 文件：

```go
package main

import "fmt"

func main() {
	fmt.Println("hello Golang world!")
}
```

上述 code 的含义：

* 声明了一个叫做 main 的 package（package 是对 functions 分组的一种方式，它由同目录下的所有文件组成）；
* 引入了名为 fmt 的公共 package，内部包含一些 functions，主要用于格式化文本内容，也可以把信息输出到控制台，fmt 是 go 内置的 package 之一；
* 实现了一个叫做 main 的 function，通常按照约定当我们执行 package 的时候，默认就会去找包中的 main 函数来执行，比如上面的例子，在 execute main package 的时候默认执行 main function。

运行 package：

```shellscript
# 在当前目录下执行以下命令，会自动执行 main function
go run .

# 输出
hello Golang world!
```

# 扩展

- 一些 go 代码示例：https://gobyexample.com/

- go 的 package 仓库，可以查看相关库的说明和示例：

  - https://pkg.go.dev/

- go 的官方文档，资源全面且丰富：https://go.dev/doc/

- go 的语言声明：https://go.dev/ref/spec

- 如何编写 go code：https://go.dev/doc/code

- 如何编写清晰、规范、高效的 go 代码：

  https://go.dev/doc/effective_go

  - 需要注意的是 effective go 的文档从 go 2009 年发布之后就没怎么更新了，但是文档中关于 go 核心的概念一直没改变，这是一份介绍 go 语言的文档，更全面详细的知识可以参考其他文档。

- go 的 web 开发框架 Gin：

  - https://go.dev/ref/spec
  - https://gin-gonic.com/

