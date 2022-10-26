---
title: LNMP 环境搭建踩坑记录
sub: 话说都 2021 年了还有人用 lnmp 吗？
date: Tue Apr 27 2021 14:08:33 GMT+0800 (中国标准时间)
---
最近换了 aws 的 ES2 解决方案（香疯了），顺带着重构一下博客来着。

说实话写页面是分分钟的事情，但写一个 CMS 还是非常耗时耗力的。所以还是搬出了 wp 做为 CMS，前端的话还是根据个人喜好手撸一个（wp的主题太丑了，魔改又贼不方便）。

从头开始还是得解决服务器上的三件套：nginx、mysql、php。作为控制欲极强的程序员更倾向于源码编译，手动控制各个配置项；不过作为一个被 996 磨平棱角的时间管理者我选择 yum。毋庸置疑，包管理工具可以快速的安装各个依赖项，需要添加依赖性也只需要一行命令即可，源码编译则需要重新编译安装配置项。如果上头了要删掉安装的包还得去各个路径下找。

其实类似的文章我之前写过好几版，主要原因大概是经常会去折腾服务器但又总是忘记一些常规操作，所以这次打算详细的记录一下遇到的每个细节，如果之后有遇到问题也会在此补充不会无限开新坑（立个flag）。其实我更愿意用 docker 搞这些乱七八糟的，不过舍不得花这个钱租性能好点的服务器。

# yum 安装 nginx

CentOS7 自带的 yum 源是没有 nginx，网上教程一大堆会给到一些奇怪的源配置，最推荐的方法当然去查[nginx 官方文档](http://nginx.org/en/linux_packages.html#RHEL-CentOS)了。虽然很简陋但很强大！

## yum-utils & yum-config-manager

安装 yum-utils 的原因是需要使用到内置的 yum-config-manager 工具。yum-config-manager 本质上是对 yum.repos.d 文件夹内的 .repo 源进行管理，包括使用优先级，版本优先级，禁用与激活等，这些功能可以直接去修改 .repo 源文件，但用 yum-config-manager 更优雅。

对于安装 Nginx 的步骤中 yum-utils 并不是必装的，可以看到官方文档中提到的：

> By default, the repository for stable nginx packages is used. If you would like to use mainline nginx packages, run the following command: `yum-config-manager --enable nginx-mainline`

可以看到 Nginx 默认确实是使用稳定版的，只有当希望使用主线版的时候可以使用 yum-config-manager 做版本切换。

但这个工具在后续安装中还会被用到，所以提前装一下。

```bash
# 更新一下包和依赖关系
yum upgrade
# 安装 yum-utils
yum install yum-utils 
```

## Nginx 源

官方给出的源安装方式为手动添加 .repo 文件。首先需要定位到 yum.repos.d 文件，这个文件存放了所有 yum 的源文件，一般位置位于 `/etc/yum/repos.d`，顺带一提 `/etc` 目录默认存放所有软件的配置文件，我们后面还会多次用到。我们打开 nginx 的 repo 文件 `vim /etc/yum/repos.d/nginx.repo`

```ini
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true

[nginx-mainline]
name=nginx mainline repo
baseurl=http://nginx.org/packages/mainline/centos/$releasever/$basearch/
gpgcheck=1
enabled=0
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
```

观察一下写入内容，可以发现 .repo 的文件可读性还是挺高的：Nginx 官方提供两个版本的源，通过 enabled 字段确定激活安装哪一个版本，这个和上文中使用 yum-config-manager 修改默认源操作本质是一样的。

官方文档还给出了 GPG key，已确保你下载到的不是伪装的恶意软件，可以留意一下。

`573B FD6B 3D8F BC64 1079 A6AB ABF5 BD82 7BD9 BF62`

## 安装 Nginx

```bash
yum install nginx
# 检查是否安装成功
nginx -v
```

## 配置 Nginx

在启动服务前我们需要先处理一些配置项，这一步可以放到 PHP 安装之后配置配合 php-fpm 使用，不过与本文记录内容相符就提前到这里先做了。

Nginx 几乎不需要配置就可以直接启动使用，但是为了追求颗粒度更小的把控，我们还需要做一些设定。

在配置前还要稍微确定一下 Nginx 配置文件的分布结构。Nginx 的配置文件都默认都存放在 /etc/nginx 文件夹下（/etc 是不是很熟悉，前面出现过一次，是常用的配置项存放根目录）。

nginx.conf 文件我把它称为入口文件，全局配置项都记录在该配置项中，其中有一行配置 include /etc/nginx/conf.d/*.conf 表明各个站点的配置项。

### 运行用户

Nginx 的线程运行用户影响到外部访问权限，对系统安全性有着不可或缺的重要性，不过考虑到小破站也没啥安全性价值到不用做的太多。

Nginx 在安装时默认允许用户为 nginx:nginx ，为了与后续 php-fpm 统一我们新建一个用户和所属用户组 www:www。

```bash
# 新建用户组 www
groupadd www
# 新建用户 www 由于只用户权限区分，所以不需要登陆
useradd www -g www -s /sbin/nologin -M
```

修改 nginx.conf 配置

```nginx
user www www;
```

### Log

对应个人项目来说 log 从来不是被重点关注的对象，不过我认为接入公网的项目开着 debug 模式调试并不是一个特别好的选择，而规范的 log 可以快速方便的定位错误或者回溯复现问题甚至定位恶意攻击。

Nginx 配置文件（包涵入口文件和单站点文件）都可以对 log 进行一些配置，主要集中在 error_log，access_log，log_format 三个字段。前两者表示 log 的路径，建议从单站点区分 log。log_format 表示 log 的格式。

[Nginx 官方文档](http://nginx.org/en/docs/http/ngx_http_log_module.html#log_format)档记录了不同字符串的含义，依个人习惯配置即可，贴一下我的配置

```nginx
log_format  main  '[$time_local] [$remote_addr] [$request] [$status] [$body_bytes_sent] [$http_referer] [] [$http_x_forwarded_for] [$request_time] [$upstream_addr] [$upstream_response_time] [$http_host] [$request_body] [$uri] [$server_port] [$remote_user] []';
```

### PHP & WordPress 支持

这里一共要做两件事：

* Nginx 本身无法解析 PHP 文件，所以必须借助 FastCGI 代理到 php-fpm 去做解析。

* WordPress 设计之初是推荐使用 Apache 做服务，使用 Nginx 需要做额外配置。

听起来很复杂，其实 Nginx 和 Wordpress 已经给出了[解决方案](https://www.nginx.com/resources/wiki/start/topics/recipes/wordpress/)。

我们新建一个 blog.conf 作为博客的配置文件。

```bash
# 此处从 default.conf 拷贝过来可以少写一些格式
cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/blog.conf
vim /etc/nginx/conf.d/blog.conf
```

配置的优化项有很多，这里就记录几个重点：

```nginx
server {
  # 访问的域名
  server_name blog.domain.com;
  # wordpress 存放的目录
  root html;
  index index.php;
  location = / {
    # 字面意思，当访问的 url 不存在则优先访问 url/
    # 若仍然不存在则访问 /index.php
    # 因为 wordpress 的入口文件就是 index.php，就是 apache .htaccess 代替方案
    try_files $uri $uri/ /index.php?$args;
  }
  # 这个 location 就是从上一个打过来的
  location ~ \.php$ {
    # wp 的老式路由要确保 php 的 cgi.fix_pathinfo = 0;
    include fastcgi_params;
    fastcgi_intercept_errors on;
    # php-fpm 服务的监听端口默认是 9000
    fastcgi_pass 127.0.0.1:9000;
    # $document_root 指的就是上面的 root
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
  }
}
```

好了就这么简单，唯一还需要做的就是确保上述的 root 文件夹的所有者为 www，否则会影响 wp 的更新操作

```bash
chown -R www:www html
```

## 运行 Nginx

Yum 安装的 Nginx 可执行文件会自动拷贝到 `/usr/sbin` 下，该文件夹包涵在 CentOS 的环境变量中，所以可以在命令行中使用。

```bash
// 启动
nginx
// 停止
nginx -s stop
```

# yum 安装 MySQL

和 Nginx 相同，本人在安装工具的时候第一步骤就是查询官方是否有对应文档。值得称赞的是 Oracle 的文档做的很好，为每种操作系统和每种安装方式都单独写了示例（稍稍挽回了一点每次下载都诱导登录的流氓行为）。[我是传送门](https://dev.mysql.com/doc/refman/8.0/en/linux-installation-yum-repo.html)

## MySQL 源

文档指出要安装高版本的库同样需要先安装对应的 Yum 源。顺带一提 Centos7 自带的源其实是有 MySQL 的，只不过版本很低，如果没有版本需求可以略过这一步。

文档给出的安装包的命名格式代表这不同版本操作系统和不同版本的数据库。官方同样给出了 [MySQL 版本列表文档](https://dev.mysql.com/downloads/repo/yum/)，Centos7 安装 MySQL8 应当选择 `mysql80-community-release-el7-3.noarch.rpm`。

```bash
yum install mysql80-community-release-el7-3.noarch.rpm
```

安装完可以检查 `/etc/yum/repos.d` 文件夹下，可以发现增加了描述 MySQL 软件源的文件。在安装 Nginx 源时也提到了为什么是这个文件夹，这里不赘述。

就是因为上述提到的 CentOS7 自带低版本 MySQL ，在安装前我们需要确认默认安装的为我们所需要的是 MySQL8。

```bash
yum repolist enabled | grep "mysql.*-community.*"
```

如果不是则还需要修改默认安装版本。这里终于正式用上了在上文多次提到的 yum-config-manager 工具。

```bash
yum-config-manager --enable mysql80-community
```

## 安装 MySQL

一行命令搞定

```bash
yum install mysql-community-server
```

## 初始化 MySQL

安装完成之后做一些基本设置。应当使用 start、stop、restart 等命令去控制服务的状态。而且值得注意的是 MySQL 的服务名为 mysqld。

```bash
# 启动 mysql 服务
systemctl start mysqld
# 检查状态
systemctl status mysqld
```

首次启动服务需要初始化 root 账号密码，该 root 账号特指 ‘root’@‘localhost’，该账号默认密码被记录在 log 中：

```bash
grep 'temporary password' /var/log/mysqld.log
```

得到默认密码之后，我们需要启动进入服务并修改密码，否则为了安全考虑其他功能将不能得到激活。

```bash
mysql -uroot -p
```

根据提示输入密码之后进入 MySQL bash 模式，并为 root 用户修改密码

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
```

值得注意的是 MySQL 默认使用[validate_password](https://dev.mysql.com/doc/refman/8.0/en/validate-password-options-variables.html)作为密码校验规则。

默认规定必须使用 8 位以上混合大小写字母、数字、特殊符号的密码。有时候我们不希望使用如此复杂的密码，所以我们可以去修改密码校验规则。当然在密码尚未初始化前修改规则是被禁止的，我们可以先设定一个复杂的临时密码，回头再做修改。

```sql
-- 修改规则的命令
set global [rule_name]=[rule_value];
```

## 远程访问

我们有时候会期望使用 WorkBanch、Navicat 等工具远程连接数据库，这时候需要设置对于的白名单用户该访问才会被允许。

MySQL 的用户表存储在 `mysql` 数据库的 `user` 表中，我们可以打印出来观察一下特征。

```sql
use mysql;
select host,user,authentication_string,plugin from user;
```

可以发现用户主要受限于 user，password，host 三者去管制其登陆，在宽松的氛围下我们可以设置 host 为 ‘%’，意为允许所有的 ip 登录访问数据库。

```sql
GRANT ALL ON *.* TO 'root'@'%';
```

同样的，需要为其设置密码

```sql
ALTER USER 'root'@'%' IDENTIFIED BY 'password';
```

至此完成 MySQL 的基本设置。

# Yum 安装 PHP7.+

Centos7 官方源自带 PHP5 版本，不过这不是我们想要的，WordPress 要求 PHP 版本至少高于 7.2，因此我们不得不参照前两步相同的方法：设置第三方源、Yum 安装。

遗憾的是，PHP 并没有提供官方的 Yum 源。查询了一下国内几个大的开源的源，仅搜狐存有较高版本的 PHP，不过使用起来似乎有点问题（？存疑，似乎是校验证书不通过）。

所幸服务器在 aws，使用国内源反而舍近求远，我这边使用的是 Remi 的源。

## 前置环境

安装前先装一下 gcc 环境

```bash
yum -y install gcc gcc-c++
```
## 安装 Remi 源

启用 Remi 源前必须先启用 EPEL。

那么什么是 EPEL 源呢？看一下官网给出的介绍

> Extra Packages for Enterprise Linux (or EPEL) is a Fedora Special Interest Group that creates, maintains, and manages a high quality set of additional packages for Enterprise Linux, including, but not limited to, Red Hat Enterprise Linux (RHEL), CentOS and Scientific Linux (SL), Oracle Linux (OL).

大概意思是较为权威的第三方软件的源，这个项目目前由 Fedora 维护，我们可以在[它的官网](https://fedoraproject.org/wiki/EPEL?rd=EPEL/en)找到使用方法。

```bash
yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
```

在安装 Remi 源之前同样建议先查阅一下[它的官方文档](http://rpms.remirepo.net/)，也许你会发现比本笔记更优雅的安装方式。

```bash
yum install http://rpms.remirepo.net/enterprise/remi-release-7.rpm
```

好了又到了 yum-config-manager 出场的时候了，我们需要确定需要安装的 PHP 版本

```bash
yum-config-manager --enable remi-php71 [ 安装PHP 7.1 ]
yum-config-manager --enable remi-php72 [ 安装PHP 7.2 ]
yum-config-manager --enable remi-php73 [ 安装PHP 7.3 ]
```

## 安装 PHP

安装 PHP 以及所需要的基本模块。

```bash
yum -y install php php-mcrypt php-devel php-cli php-gd php-pear php-curl php-fpm php-mysql php-ldap php-zip php-fileinfo 
```

查看 PHP 版本，检查是否安装成功

```bash
php -v
```

## 启动 php-fpm

启动前我们需要设置 php-fpm 的运行用户，与 Nginx 保持一致。

找到 php-fpm 配置文件，通常路径在 /etc/php-fpm.d/www.conf

```ini
user=www
group=www
```

其次，还必要设置的是前面提到的 php.ini 文件中的 cgi.fix_pathinfo 选项。php.ini 通常在 /etc/php.ini

```ini
cgi.fix_pathinfo=0
```

启动 php-fpm

```bash
systemctl start php-fpm
```

设置开机启动

```bash
systemctl enable php-fpm.service
```

这样一来，构成运行 WP 的基本环境就搭建完成了，可以打印 `phpinfo()` 从公网访问来校验 php 是否得到了正确的解析。

# 写在最后

其实现代化前端应用构建已经很少用到这种传统 lnmp 模式，或者说尽量减少和 OS 直接打交道吧。就以我搭建博客这件事来说，其实我更希望专注于站点本身，而不是要时刻关注服务器内存消耗或者 sql 服务是不是挂了，这些都非常消耗心智。

但在今年上半年办了 visa 卡之后我还是毫不犹豫的入了 aws 的 vps，并且以我记忆中仅存的 linux 知识复习了一遍。可以说 php、apache、nginx、mysql 这些名词代表着我进入计算机 web 应用构建的初期，那时候懵懵懂懂跟着教程瞎捣鼓希望搭建一个个人网站。直至今日我仍然在做这件事情，但是境遇却不同往日。

所以当我来到了人生的新起点，我毫不犹豫的重启了建站计划，同样保持着我的学习习惯：使用陌生的技术做熟悉的东西。这篇文档是我第一次从都到位具体的写下 lnmp 的安装步骤，也许还不完整还会修修补补，但我相信我会坚持下去。