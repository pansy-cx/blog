---
layout:     post
title:      "WordPress 文章制作"
date:       2016-08-24 09:50:00
tags:
    - WordPress
---

一篇博客文章html骨架大致为：  

```html
<div>
    <h3><a href="#">文章标题</a></h3>
    <p>
        <a href="#">标签1</a>
        <a href="#">标签2</a>
        发布时间 
    </p>
    <img class="thumb" alt="" src="<?php bloginfo('template_url'); ?>/images/610x150.gif" />
    文章内容
    <p><a href="#"- 阅读全文按钮</a></p>
</div>
```

### 修改文章

-  `<?php the_permalink(); ?>`  文章的URL链接  
- `<?php the_title(); ?>`  文章的标题  
- `<?php the_author(); ?>` 作者名字  
- `<?php the_category(', ', ''); ?>` 分类目录  
- `<?php the_tags(‘标签：’, ‘, ‘, ”); ?>` 文章标签  
- `<?php the_time(‘Y年n月j日’) ?>` 添加日期  
- `<?php comments_popup_link('0 条评论', '1 条评论', '% 条评论', '', '评论已关闭'); ?>` 评论  
- `<?php echo mb_strimwidth(strip_tags(apply_filters('the_content', $post->post_content)), 0, 200,"..."); ?>` 显示文章摘要200为200字  
- `<?php the_permalink(); ?>` 阅读全文

### 添加文章循环

到目前为止，首页还只能显示一篇文章，要想输出所有文章，需要添加循环：

```php
<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
<article></article>
<?php endwhile; ?>
<?php else : ?>
<h3 class="title"><a href="#" rel="bookmark">未找到</a></h3>
<p>没有找到任何文章！</p>
<?php endif; ?>
```

在 WordPress 后台设置内可以控制首页显示文章的数目。

### 添加文章分页

function 代码，添加到最后一个 `?-` 的前面

```javascript
function par_pagenavi($range = 9){
    global $paged, $wp_query;
    if ( !$max_page ) {$max_page = $wp_query->max_num_pages;}
    if($max_page - 1){if(!$paged){$paged = 1;}
    if($paged != 1){echo "<a href='" . get_pagenum_link(1) . "' class='extend' title='跳转到首页'- 返回首页 </a>";}
    previous_posts_link(' 上一页 ');
    if($max_page - $range){
    if($paged < $range){for($i = 1; $i <= ($range + 1); $i++){echo "<a href='" .get_pagenum_link($i) ."'";
    if($i==$paged)echo " class='current'";echo ">$i</a>";}}
    elseif($paged >= ($max_page - ceil(($range/2)))){
    for($i = $max_page - $range; $i <= $max_page; $i++){echo "<a href='" .get_pagenum_link($i) ."'";
    if($i==$paged)echo " class='current'";echo ">$i</a>";}}
    elseif($paged >= $range && $paged < ($max_page - ceil(($range/2)))){
    for($i = ($paged - ceil($range/2)); $i <= ($paged + ceil(($range/2))); $i++){echo "<a href='" . get_pagenum_link($i) ."'";if($i==$paged) echo " class='current'";echo">$i</a>";}}}
    else{for($i = 1; $i <= $max_page; $i++){echo "<a href='" . get_pagenum_link($i)."'";
    if($i==$paged)echo " class='current'";echo ">$i</a>";}}
    next_posts_link(' 下一页 ');
    if($paged != $max_page){echo "<a href='" . get_pagenum_link($max_page) . "' class='extend' title='跳转到最后一页'- 最后一页 </a>";}}
}
```

css代码

```css
.page_navi{overflow:hidden;width:100%;text-align:center}
 
.page_navi a{height:36px;border:1px solid #DDD;-webkit-border-radius:12px;-moz-border-radius:12px;border-radius:12px;color:#888;text-decoration:none;line-height:36px;margin:2px;padding:3px 8px}
 
.page_navi a:hover,.page_navi a.current{border:1px solid #FFBB76;color:#FF7200;font-weight:bolder}
```

html引入

```html
<div class="page_navi"><?php par_pagenavi(5); ?></div-  //5为每页显示的文章数。
```
