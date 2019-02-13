---
layout:     post
title:      "《集体编程智慧》—— 4.搜索与排名"
date:       2018-06-10 22:13:08
tags:
    - Python
    - 机器学习
---

以下代码完整步骤在 <a href="https://github.com/pansy-cx/Programming-Collective-Intelligence/tree/master/4.%20Searching%20and%20Ranking">Github</a> 上可看

### 介绍

《集体编程智慧》是一本介绍机器学习与计算统计的书，相当硬核，实际编程占了很大的篇幅。书里专门讲述如何挖掘和分析 Web 上的数据和资源，如何分析和获得更好的用户体验。包括协作过滤技术（实现关联产品推荐功能）、集群数据分析（在大规模数据集中发掘相似的数据子集）、搜索引擎核心技术（爬虫、索引、查询引擎、PageRank算法等）、搜索海量信息并进行分析统计得出结论的优化算法、贝叶斯过滤技术（垃圾邮件过滤、文本过滤）、用决策树技术实现预测和决策建模功能、社交网络的信息匹配技术、机器学习和人工智能应用等。

本文总结的是《集体编程》第四章的内容，搜索引擎与排名。虽然是第四章，却是《集体智慧编程》系列的第一弹，之前看的零零散散，不成体系，如今打算拿出时间好好的学一学，虽然很可能又被我鸽掉，但至少这是个好的开始，不是么？

### 搜索引擎的组成

建立搜索引擎首要步骤是建立一个搜索文档的方法，即网页的抓取。从一小组网页开始，再根据网页内的链接逐步追踪其他的网页。

搜集完文档后，对文档建立索引，表中包含文档所有不同单词的位置信息，最后通过查询返回一个经过排序的文档列表。根据不同的度量方法可以改变网页排名次序。

### 爬虫程序

首先是建立搜索文档，假定有一组网页链接，如何建立搜索文档？首先需要Python把网页加载下来，遍历网页内的链接内容，如此循环。然后需要将网页内容给分割成单词或词语，将单词和位置存到数据库里储存。

##### requests
requests 是一个Python网络库，书里用的是urlib2，由于是几年前的书了，在对 HTTPS 处理有些问题，这里就不表了，用 requests 也是一样的。要解决 HTTPS 的问题，只需要修改一下代码：

```python
import requests
import requests.packages.urllib3.util.ssl_
requests.packages.urllib3.util.ssl_.DEFAULT_CIPHERS = 'ALL'
```

```python
c = requests.get('https://idmrchan.com')
soup = BeautifulSoup(c.text)
links = soup('a')
for link in links:
    if ('href' in dict(link.attrs)):
        url = urljoin(page, link['href'])
        if url.find("'") != -1: continue
        url = url.split('#')[0] # 去掉位置部分
        if url[0:4] == 'http':
            # 对获得的 url 进一步遍历
```

##### 分词

首先将HTML里的文字提取出来

```python
def gettextonly(soup):
    v = soup.string
    if v == None:
        c = soup.contents
        resulttext = ''
        for t in c:
            subtext = self.gettextonly(t)
            resulttext += subtext + '\n'
        return resulttext
    else:
        return v.strip()
```

处理英文字符，中文分割用 <a href="https://github.com/fxsjy/jieba" target="_blank">jieba</a>

```python
# 提取英文字符，如 vue, vue-cli, C++, don't ......
l = re.findall(r'[\w\-?\+*\'?]+', text)
# 去除英文字符和空格
text = re.sub(r'[\w\-?\+*\'?]+|\s', '', text)
# 用 jieba 分割中文
seg_list = jieba.cut(text, cut_all=False, HMM=True)
for seg in seg_list:
    l.append(seg)
```


##### 建立索引

使用 sqlite3 建立数据库，SQLite 是一个嵌入式数据库，将整个数据库存入了一个文件之中，很方便。<a href="http://www.runoob.com/sqlite/sqlite-tutorial.html" target="_blank">菜鸟教程 SQLite</a>

我们用3个表来储存，一个为 urllist，储存 url 链接，一个为 wordlist 储存单词表和，一个 wordlocation 储存链接 id，单词 id 和单词在网页的位置

创建数据表

```python
con = sqlite.connect(dbname)
con.execute('create table urllist(url)')
con.execute('create table wordlist(word)')
con.execute('create table wordlocation(urlid,wordid,location)')
```

添加函数，用于获取与插入条目

```python
def getentryid(table, field, value):
    # 查询 id
    cur = con.execute(
        "select rowid from {} where {}=?".format(table,field), (value,))
    res = cur.fetchone()
    # 如果不存在，则插入
    if res == None:
        cur = self.con.execute(
            "insert into {} ({}) values (?)".format(table,field), (value,))
        return cur.lastrowid
    else:
        return res[0]
```

为每个网页建立搜索引擎

```python
def addtoindex(url, soup):
    # soup 为去除 HTML 的文字
    # ... 经如上步骤处理得到 words，文字库

    # 得到url的id，没有则插入并返回 id
    urlid = getentryid('urllist', 'url', url)

    # 将每个单词与该url关联
    for i in range(len(words)):
        word = words[i]
        wordid = getentryid('wordlist', 'word', word)
        con.execute("insert into wordlocation(urlid, wordid, location) values (%d, %d, %d)" % (urlid, wordid, i))
```

### 查询

我们先建立一个简单的搜索方法，允许多次搜索，如 getmatchrows('vue webpack')

```python
con = sqlite.connect(dbname)
def getmatchrows(q):
    # 构造查询的字符串
    fieldlist = 'w0.urlid'
    tablelist = ''
    clauselist = ''
    wordids = []
    # 根据空格拆分单词
    words = q.split(' ')
    tablenumber = 0
    for word in words:
        # 获取单词 id
        wordrow = con.execute(
            "select rowid from wordlist where word='%s'" % word).fetchone()

        if wordrow != None:
            wordid = wordrow[0]
            wordids.append(wordid)
            if tablenumber > 0:
                tablelist += ','
                clauselist += ' and '
                clauselist += 'w%d.urlid=w%d.urlid and ' % (tablenumber-1, tablenumber)

            fieldlist += ',w%d.location' % tablenumber
            tablelist += 'wordlocation w%d' % tablenumber
            clauselist += 'w%d.wordid=%d' % (tablenumber,wordid)
            tablenumber += 1

    # 根据各个分组，建立查询
    fullquery = 'select %s from %s where %s' % (fieldlist, tablelist, clauselist)
    cur = con.execute(fullquery)
    rows = [row for row in cur]
    return rows,wordids
```

这个程序看起来复杂，可以将 fullquery 输出出来看看，形如

    select w0.urlid,w0.location,w1.location from wordlocation w0,wordlocation w1 where w0.wordid=413 and w0.urlid=w1.urlid and w1.wordid=1295

    select x from wordlocation w0, wordlocation w1 

将wordlocation进行两次对比

    select x from w0,w1 where w0.wordid=413 and w0.urlid=w1.urlid and w1.wordid=1295

419 是 vue 单词的位置，1295 是 webpack 单词的位置，需要匹配同一个 urlid，即同时出现了 vue 和 webpack 的网页id

    select w0.urlid,w0.location,w1.location

输出 urlid | vue 单词位置 | webpack 单词位置

##### 排名
以上输出的结果只是根据检索时的顺序，而我们需要根据相关性来对检索结果进行排名，包括以下三种方法。

1. 单词频度
根据位于查询条件中的单词在文档中出现的次数
2. 文档位置
文档主题有可能会靠近文档的开始处。实际上搜索引擎会根据网页结构来判断权重，比如 `<h1>` 权重就比 `<p>` 来的大
3. 单词距离
如果查询条件中有多个单词，则它们在文档中出现的位置应该靠的很近
4. 利用外部回指链接
外部回指链接是指在其他网页指向该网页的数目

##### PageRank
PageRank 算法 是 Google 发明的，其理论为，设指向 A 链接的有 B C D 三个链接，B C D 的 PageRank 值分别为 PR(B) PR(C) PR(D)，B C D 三个网页的链接分别有 link(B) link(C) link(D)，则 A 的 PageRank 是多少：

>PR(A) = 0.15 + 0.85 * (PR(B)/link(B) + PR(C)/link(C) + PR(D)/link(D))

0.15 为最小值，0.85 为阻尼系数，用以指示用户持续点击每个链接的概率

此时有个问题，B C D 的 PageRank 怎么算出来的？

解决这一问题的方法是将所有 PageRank 设置为 1，然后反复计算，迭代若干次后 PageRank 值就会接近于真实值。

代码就不放出来了，可自行在 Github 上查看

### 从点击行为中学习

根据用户点击抉择来训练模型

##### 设计思路

模型需要用到神经网络，以一组节点（神经元）构成，彼此之间相连接，被称为多层感知机（multilayer perceptron, MLP）网络。其第一层神经元接收输入，本例中指用户输入的单词，最后一层输出结果，本例中即返回不同 URL 的权重。

##### 设计数据库

数据库分为3层，一层为中间的隐藏层，`hiddennode(create_key)`，输入层为单词与隐藏层之间的连接状态表 `wordhidden(fromid,toid,strength)`，输出层为隐藏层与输出链接之间的关系表 `hiddenurl(fromid,toid,strength)`

##### 训练实验

接下来我们模拟用户输入与选择 url，算法根据输入的值更新权重，其中用到了 tanh 函数与反向传播法，具体算法在 <a href="https://github.com/pansy-cx/Programming-Collective-Intelligence/blob/master/4.%20Searching%20and%20Ranking/nn.py" target="_blank">nn.py</a>，这里就不赘述。

---

总之，本章讲了如何使用 SQLite 建立数据库储存信息，爬取网页链接，建立词库。进行多词搜索，并且使用单词频度，相关性，用户点击抉择等来对链接进行排名。
