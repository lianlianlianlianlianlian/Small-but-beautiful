/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// 导入所需的库和组件
import { h, FunctionalComponent } from 'preact'; // 导入 Preact 的 h 函数和 FunctionalComponent 类型
import baseCss from 'css:./base.css'; // 导入基础 CSS 样式
import initialCss from 'initial-css:'; // 导入初始 CSS 样式
import { allSrc } from 'client-bundle:client/initial-app'; // 导入客户端初始应用的所有源代码
import favicon from 'url:static-build/assets/favicon.ico'; // 导入网站图标
import ogImage from 'url:static-build/assets/icon-large-maskable.png'; // 导入用于 Open Graph 的图像
import { escapeStyleScriptContent, siteOrigin } from 'static-build/utils'; // 导入工具函数
import Intro from 'shared/prerendered-app/Intro'; // 导入介绍组件
import snackbarCss from 'css:../../../shared/custom-els/snack-bar/styles.css'; // 导入 Snackbar 样式
import * as snackbarStyle from '../../../shared/custom-els/snack-bar/styles.css'; // 导入 Snackbar 样式模块

// 定义组件的 Props 接口
interface Props {}

// 创建主组件
const Index: FunctionalComponent<Props> = () => (
  <html lang="zh-CN">
    {' '}
    {/* 设置 HTML 文档的语言为中文 */}
    <head>
      <title>小而美-图片压缩</title> {/* 网页标题 */}
      <meta
        name="description"
        content="Squoosh is the ultimate image optimizer that allows you to compress and compare images with different codecs in your browser." // 网站描述
      />
      <meta name="twitter:card" content="summary" /> {/* Twitter 卡片类型 */}
      <meta name="twitter:site" content="@dinglianlian" /> {/* Twitter 账号 */}
      <meta property="og:title" content="Squoosh" /> {/* Open Graph 标题 */}
      <meta property="og:type" content="website" /> {/* Open Graph 类型 */}
      <meta property="og:image" content={`${siteOrigin}${ogImage}`} />{' '}
      {/* Open Graph 图像 */}
      <meta
        property="og:image:secure_url"
        content={`${siteOrigin}${ogImage}`} // Open Graph 图像安全 URL
      />
      <meta property="og:image:type" content="image/png" />{' '}
      {/* Open Graph 图像类型 */}
      <meta property="og:image:width" content="500" />{' '}
      {/* Open Graph 图像宽度 */}
      <meta property="og:image:height" content="500" />{' '}
      {/* Open Graph 图像高度 */}
      <meta
        property="og:image:alt"
        content="A cartoon of a hand squeezing an image file on a dark background." // Open Graph 图像替代文本
      />
      <meta
        name="og:description"
        content="Squoosh is the ultimate image optimizer that allows you to compress and compare images with different codecs in your browser." // Open Graph 描述
      />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" // 视口设置
      />
      <meta name="mobile-web-app-capable" content="yes" />{' '}
      {/* 表示该应用可作为移动网页应用运行 */}
      <meta name="apple-mobile-web-app-capable" content="yes" />{' '}
      {/* Apple 移动网页应用支持 */}
      <link rel="shortcut icon" href={favicon} /> {/* 网站图标链接 */}
      <link rel="apple-touch-icon" href={ogImage} /> {/* Apple Touch 图标 */}
      <meta name="theme-color" content="#ff3385" /> {/* 网站主题颜色 */}
      <link rel="manifest" href="/manifest.json" /> {/* Web 应用清单 */}
      <link rel="canonical" href={siteOrigin} /> {/* 规范链接 */}
      <style
        dangerouslySetInnerHTML={{ __html: escapeStyleScriptContent(baseCss) }} // 加载基础 CSS
      />
      <style
        dangerouslySetInnerHTML={{
          __html: escapeStyleScriptContent(initialCss), // 加载初始 CSS
        }}
      />
    </head>
    <body>
      <div id="app">
        {' '}
        {/* 应用的根元素 */}
        <Intro /> {/* 渲染介绍组件 */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: escapeStyleScriptContent(snackbarCss), // 加载 Snackbar 样式
            }}
          />
          <snack-bar>
            <div
              class={snackbarStyle.snackbar} // Snackbar 样式
              aria-live="assertive" // ARIA 属性，用于可访问性
              aria-atomic="true" // ARIA 属性，用于可访问性
              aria-hidden="false" // ARIA 属性，用于可访问性
            >
              <div class={snackbarStyle.text}>
                初始化错误：本网站需要启用
                JavaScript，但您的浏览器中已将其禁用。{' '}
                {/* JavaScript 未启用时显示的消息 */}
              </div>
              <a class={snackbarStyle.button} href="/">
                重新加载 {/* 重新加载按钮 */}
              </a>
            </div>
          </snack-bar>
        </noscript>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: escapeStyleScriptContent(allSrc), // 加载所有源代码
        }}
      />
    </body>
  </html>
);

// 导出组件
export default Index;
