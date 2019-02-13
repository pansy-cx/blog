---
layout:     post
title:      "WordPress Sidebar制作"
date:       2016-08-24 09:30:00
tags:
    - WordPress
---

### 添加引用
在 index 内把侧边栏代码复制到 sidebar.php 用 `<?php get_sidebar(); ?>` 引用

### 添加函数
添加 function 函数：其参数根据具体情况而定。

```php
<?php
    //注册侧边栏
    if ( function_exists('register_sidebar') ) {
        register_sidebar(array(
        'name'=>'首页侧边栏',
        'id'=>'sidebar-1',
        'before_widget' => '<li>',
        'after_widget' => '</li>',
        'before_title' => '<h4>',
        'after_title' => '</h4>',
    ));
}?>
```

### 修改sidebar静态内容

##### 添加循环

```html
<div>
    <?php if ( !function_exists(‘dynamic_sidebar’)|| !dynamic_sidebar(‘First_sidebar’) ) : ?>
    <div>分类目录</div>
    <?php endif; ?>
</div>
<div>
    <?php if ( !function_exists(‘dynamic_sidebar’)|| !dynamic_sidebar(‘Second_sidebar’) ) : ?>
    <div>最新文章</div>
    <?php endif; ?>
</div>
```

##### 获取分类目录

```html
<ul>
    <?php
        wp_list_categories(‘depth=1&title_li=&orderby=id&show_count=0&hide_empty=1&child_of=0’);?>
</ul>
```

##### 获取最新文章

```html
<ul>
    <?php 
        $posts = get_posts(‘numberposts=6&orderby=post_date’);
        foreach($posts as $post) {
            setup_postdata($post);
            echo '<li><a href="' . get_permalink() . '"><i class="icon-folder-open-alt"></i>'. get_the_title() . '</a></li>';
        }
        $post = $posts[0];?>
</ul>
```
