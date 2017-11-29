<div align="center">

## MyWebpack

**My webpack integrated CLI for multi-entries and collaborative projects.**

[![npm version](https://img.shields.io/npm/v/mywebpack.svg?maxAge=3600&style=flat)](https://www.npmjs.com/package/mywebpack)
[![dependency status](https://img.shields.io/david/thundernet8/mywebpack.svg?maxAge=3600&style=flat)](https://david-dm.org/thundernet8/mywebpack)
[![Build Status](https://travis-ci.org/thundernet8/MyWebpack.svg?branch=master)](https://travis-ci.org/thundernet8/MyWebpack)
[![GitHub license](https://img.shields.io/github/license/thundernet8/MyWebpack.svg)](https://github.com/thundernet8/MyWebpack/blob/master/LICENSE)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

</div>

<br>

多入口 Webpack 项目集成开发工具链。

## Features

* [x] 初始化项目结构 CLI，提供从 yaml 定义自动生成 entries 文件
* [x] 提供多个命令分别支持项目开发环境，编译以及测试或生产发布，提供 bundle 分析
      功能
* [x] 开发环境，提供自动编译功能：根据访问的页面自动编译需要的 entry 相关代码，
      按需编译，加快开发编译等待时间
* [x] 编译 bundles，可指定将常用的`venders`库打包为`dll bundle`，其他页面逻辑代
      码打包为`[entryName].[contentHash]`对应的 bundle，最小化文件改动，最大化利
      用资源缓存
* [x] 发布文件，支持多选或全选 entries 进行发布，按需发布，加快发布速度，并自动
      推送至指定的部署仓库，实现持续集成和交付
* [x] 代码格式化，集成`Prettier`，统一协作开发者提交的代码风格

## Install

```typescript
npm add mywebpack -g
```

or

```typescript
yarn global add mywebpack
```

## Usage

* 初始化

```typescript
mpk init
```

* 生成 entries

```typescript
mpk gen
```

* 开发

```typescript
mpk start
```

* 编译

```typescript
mpk build
```

* 分析

```typescript
mpk analyze
```

* 格式化

```typescript
mpk pretty
```

* 发布

```typescript
mpk publish
```

请定义项目根目录的`mpk.config.js`

## Notes

* React+TypeScript+LESS/SASS/CSS 栈
* 默认会查找与 entry 同名的 html 模板文件，不存在则会使用 index.html
* 项目初始化的结构`src/assets/styles/global`文件夹下的样式文件不会应用`CSS
  Module`，其他地方引用样式会应用`CSS Module`解析
* 配置文件中`webpack`配置项可配置`externals`与`resolve`
* `Bundle analyzer`会使用开发相同的`devHost`, `dll bundles`使用`devPort`+1 端口
  ，其他`bundles`使用`devPort`+2 端口

## License

MyWebpack is freely distributable under the terms of the
[MIT license](https://github.com/thundernet8/MyWebpack/blob/master/LICENSE).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fthundernet8%2FMyWebpack.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fthundernet8%2FMyWebpack?ref=badge_large)
