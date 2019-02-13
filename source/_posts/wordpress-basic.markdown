---
layout:     post
title:      "制作 WordPress 主题"
date:       2016-08-24 10:20:00
tags:
    - WordPress
---

前言：用 WordPress 来制作博客真的是很方便，尤其是像我这种不会写后台的人来说，只要稍微修改下代码就能实现后台很多功能。这篇文章列出了一些 WordPress 基础操作步骤。

### WordPress 本机环境搭建

- 下载 XAMPP 安装后打开 Apache，MySQL 在浏览器中输入 localhost,即可检测是否安装成功。
- 打开 MySQL 的 Admin 按钮。新建一个数据库（例如:wp）
- 在 WordPress 官网上下载程序包，在 xampp 下创建文件夹 wordpress，放在 X:\xampp\htdocs 下。在浏览器中输入 localhost/wordpress 即可安装 WordPress 

> wp为你刚才建的数据库名。用户名为root ，密码无。这样WordPress就安装好了。

### WordPress 文件构建

首先你要有一个写好的静态页面，你可以打开下载的 WordPress 程序包，在 wp-content\themes 下有 WordPress 预设的模板。接下来要做的就是将写好的静态页面修改成模板形式。  
一般来说，每个主题都带有：  

- index.php（首页）
- header.php  
- footer.php  
- 404.php  
- function.php（函数）
- single.php（文章页面） 
- style.css  

每个模板页面都至少要包含 index.html 和 style.css 文件。将所有的 .html 改成 .php  

1）将你写的静态页文件夹放入 wp-content\themes 我将其命名为 MyBlog 打开 style.css 文件，在最前面添加如下代码

```
>/*  
Theme Name: 这里填主题名称  
Theme URI: 这里填主题介绍的网址，没有就填你的博客网址吧  
Description: 这里填主题的简短介绍  
Version: 版本号  
Author: 作者名  
Author URI: 作者的网址  
Tags: 标签，多个用半角逗号隔开  
*/
```

然后打开 WordPress 管理后台”外观”栏目下。就可以看到你的主题。  

2）将你的静态页截下来，命名为 screenshot.png 作为主题目录的缩略图。  

3）一般来说，一个网站所有的页面都有相同的部分，比如 header 和 footer 创建 header.php 和 footer.php 将相同部分的代码拷贝到这里面，然后在有 header 或 footer 部分的页面中将相同代码删掉，分别修改为 `<?php get_header(); ?>` 和 `<?php get_footer(); ?>` 若有需要，还可以添加 sidebar 和 404 等页面，使用方法相同。  

这样你的 WordPress 框架就构建完成了

#### 修改静态页

博客内容都是从后台进行控制的，所以我们要将前台静止的东西修改成可动态获取的代码  

1）修改 url 地址
首先是特殊的 style.css 文件将

```html
<link rel="stylesheet" href="../style.css" type="text/css" />
```

改成

```html
<link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); ?>" type="text/css" />
```

`bloginfo('stylesheet_url')` 输出的是你的主题css文件绝对网址。  

如果 css 文件不是 style.css ，且不是在主题根目录下，可以用 `<?php bloginfo('template_url'); ?>` 来获取主题根目录的 URL  
例如：如你的主题 css 文件是 main.css，那么我们可以这样写 ：`<?php bloginfo('template_url'); ?>/main.css` ，如果是在子目录css下那就这样： `<?php bloginfo('template_url'); ?>/css/main.css`   
同理，加载js文件和添加图片链接也是这样，在前面加上 `<?php bloginfo(‘template_url’); ?>` 即可。  

2）修改 `<title>` ，这里提供一个从别的网站扒下来的 SEO 优化的 title 写法，将 `<title></title>` 修改成

```div
<title>
    <?php if ( is_home() ) {
        bloginfo('name'); echo " - "; bloginfo('description');
    } elseif ( is_category() ) {
        single_cat_title(); echo " - "; bloginfo('name');
    } elseif (is_single() || is_page() ) {
        single_post_title();
    } elseif (is_search() ) {
        echo "搜索结果"; echo " - "; bloginfo('name');
    } elseif (is_404() ) {
        echo '页面未找到!';
    } else {
        wp_title('',true);
    } ?>
</title>
```

3）更改博客名和描述  
将

```html
<h1>Aurelius</h1>
<h2>这里是描述</h2>
```

改成

```html
<h1><a href="<?php echo get_option('home'); ?>/"><?php bloginfo('name'); ?></a></h1>
<h2><?php bloginfo('description'); ?></h2>
```

代码详解：

- `<?php echo get_option('home'); ?>`  输出你的博客首页网址  
- `<?php bloginfo('name'); ?>`  输出你的博客名称  
- `<?php bloginfo('description'); ?>`  输出博客描述

#### 修改文章

前面都是一些 WordPress 写法的基本介绍，header.php 和 footer.php 一般都是通过这样设置的。接下来最关键的就是修改文章，使网页可以从后台动态添加删除文章，可以参考以下这两片文章。 

<a href="http://idmrchan.com/2016/08/24/wordpress-page/" target="_blank">WordPress文章制作</a>
<a href="http://idmrchan.com/2016/08/24/wordpress-sidebar/" target="_blank">WordPress Sidebar制作</a>
