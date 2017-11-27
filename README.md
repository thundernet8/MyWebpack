## MyWebpack
My webpack integrated CLI for multi-entries and collaborative projects.

多入口Webpack项目集成开发工具链。

## Feature

 * [x] 初始化项目结构CLI，提供从yaml定义自动生成entries文件
 * [x] 提供多个命令分别支持项目开发环境，编译以及测试或生产发布，提供bundle分析功能
 * [x] 开发环境，提供自动编译功能：根据访问的页面自动编译需要的entry相关代码，按需编译，加快开发编译等待时间
 * [x] 发布文件，支持多选或全选entries进行发布，按需发布，加快发布速度，并自动推送至指定的部署仓库，实现持续集成和交付

## Install

``` typescript
npm add mywebpack -g
```

or
``` typescript
yarn global add mywebpack
```

## Usage

* 初始化
``` typescript
mpk init
```

* 生成entries
``` typescript
mpk gen
```

* 开发
``` typescript
mpk start
```

* 编译
``` typescript
mpk build
```

* 发布
``` typescript
mpk publish
```

请定义项目根目录的`mpk.config.js`

## License

MyWebpack is freely distributable under the terms of the
[MIT license](https://github.com/thundernet8/MyWebpack/blob/master/LICENSE).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fthundernet8%2FMyWebpack.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fthundernet8%2FMyWebpack?ref=badge_large)
