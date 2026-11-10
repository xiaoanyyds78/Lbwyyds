# 项目规则

本文件是本仓库的强制约定，新建、修改文件前先读这里。

## 1. 命名规范

- 自写的 CSS 类名、`id` 名、JS 变量/函数名一律以 `lbw_` 开头，例：`.lbw_lesson-card`、`id="lbw_tabPanel"`、`lbw_currentTab`。
- CSS 自定义属性同样加前缀：`--lbw_bg`、`--lbw_ink`。
- 例外：第三方工具生成的资源不重命名（`cdn/`、`font/` 里的 `iconfont`、`fa-*`、`icon-*` 等），重命名会破坏图标渲染。

## 2. 提示词留痕

每次执行任务前，先把本次提示词**追加**写入 [LBW_prompt.md](LBW_prompt.md)，不覆盖历史内容，每条包含：

- 时间（`yyyy-MM-dd HH:mm:ss`，Asia/Shanghai）
- 使用的模型
- 提示词原文

## 3. 首页入口

新建 HTML 页面后，必须在 [webprojectxiaoan/24002120602-柳博文/index.html](webprojectxiaoan/24002120602-柳博文/index.html) 的 `div.lbw_lesson-grid` 中补一张 `a.lbw_lesson-card` 入口卡片，路径与文件名完全一致，并提供 `lbw_open-link` 链接。

## 4. 新建 HTML 文件头注释

新建的 HTML 文件必须在文件顶部写明四项信息（`<!DOCTYPE html>` 之后、`<html>` 之前）：

```html
<!--
  作者：柳博文
  建立时间：2026-11-04
  使用大模型：DeepSeek-V4.1-Flash
  功能名称：图标展示页（Font Awesome 字体图标）
-->
```

- 作者固定为「柳博文」
- 建立时间取文件创建当天日期
- 使用大模型写实际使用的模型名
- 功能名称用一句话概括该页面的用途

## 5. JS 函数注释

JS 中每个函数（含 `function` 声明、`const fn = () => {}`）上方都要写注释，说明该函数**主要实现什么功能**，一行讲清职责，必要时补充参数与返回值：

```js
/**
 * 计算班级总分：把五科分数累加
 * @param {Object} lbw_student 学生对象
 * @returns {number} 总分
 */
function lbw_getTotal(lbw_student) { ... }
```

简单函数可单行：`// 判断分数对应的样式类：不及格 fail，满分 full，其余空串`。

## 6. 提交

需要推送 GitHub 时使用技能 `github-commit-push`（见 `.trae/skills/github-commit-push/`），不要在未获明确要求时提交或推送。
