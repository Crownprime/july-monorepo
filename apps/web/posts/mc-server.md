---
title: minecraft 开服指北
date: Wed Jan 05 2022 15:24:27 GMT+0800 (中国标准时间)
---

应群友强烈要求我又开始捣鼓 mc 的服务器，这次就不偷懒弄什么面板服了直接阿里云走起。

初步估计了一下会一起玩的朋友不超过 10 个，同时在线率不超过 50%。经过我反复试探 1.19.2 版本的 server 大约分配 1G 左右的内存即可流畅跑起来。那么除开基础服务，当玩家加入游戏后的计算还需要大量开销，所以选用了 4G 内存 2 核 CPU 的机器。

# Mod or Plugin

可以确定的是 mod 服更加古老，在稍早一段时间绝大部分的 mod 的 mc 的支持都停留在 1.7.+ 的版本，比如当时人气超高的和风 mod（虽然在近年来逐渐有大佬接坑，支持度逐渐上来了）。不过主要的原因是小伙伴们倾向于原版体验，所以这次的服务器被决定为插件服，而服务器核心无可争议的选择了 [paper](https://paper.readthedocs.io/en/latest/server/getting-started.html)。

paper 是 spigot 的一个分支，而 spigot 来自于 bukkit。所以几乎所有的 plugin 都支持 paper，而 paper 极佳的内部优化也让它从其他分支脱颖而出。

# 环境预处理

首先我们需要有个 OS，为了尽可能为 server 预留资源，我选择 CentOS。阿里云有个自己封装的 AliOS 我也适用了一下主打安全稳定，但全家桶装的太多反而不利于我们用所以直接放弃。

> 2020年12月08日，CentOS官方宣布了停止维护CentOS Linux的计划，并推出了CentOS Stream项目。CentOS计划把Red Hat Enterprise Linux（RHEL）的复刻版本CentOS Linux转向CentOS Stream，因此对CentOS Linux存在以下影响：
>
> - CentOS Linux 7作为RHEL 7的复刻版本于2020年08月06日停止更新，但会延续当前的支持计划，于2024年6月30日停止维护（EOL）。
> - CentOS Linux 8作为RHEL 8的复刻版本，生命周期缩短，于2021年12月31日停止更新并停止维护（EOL）。
> - CentOS官方不再提供CentOS Linux 9及后续版本，而是提供CentOS Stream版本。

所以毋庸置疑，我们只能选择 CentOS Stream 版本了。

## java

1.18+ 版本的 paper 核心要求 java17 的环境

![图片](/images/2c9a9140d7fd452b5b4c091ac9ddd426ed07a2b60a8599e0d46522b94961704a.png)

### 卸载系统自带 jdk

纯净的 CentOS 并没有自带 java，不过不妨碍我们先检查一下

```bash
rpm -qa|grep java
```

### 查找 java 列表

```bash
# 确保最新
yum update
yum -y list java*
```

万军丛中找到我们所需要的 jdk，由于我装过 jdk 所以不会在列表里显示，所以下图是用 `yum search jdk` 查询得到的，两者等效

![图片](/images/6cec485fb23e377b304981c772a6c48d04e01ea4d1f5087680658d514c8e64a5.png)

这里需要注意的是 java runtime environment 其实缩写为 jre，意为 java 运行时环境不具备开发能力，因此他的体积更小。如果我们不做太复杂的功能 jre 就够了，还有些例如 headless 版本的包表示删减版，主要是去掉一些对图形界面或者鼠标键盘等外设 IO 的支持，所以他占用更少的服务器资源。

![图片](/images/b8b5556ec3c90f921c2885090ac9585306e25bbeec30212877190a8be024719a.png)

### 安装 java

```bash
yum install -y javaj-17-openjdk-headless.x86_64
# 或者 yum install -y java-17-openjdk.x86_64
# 验证是否安装成功
java -version
```

能够正确显示 java 版本号就说明安装成功了。

![图片](/images/6be2892d3fb66aaff9ec39b19ed6b49264ca703dde01860e67d661c9e50ef0b5.png)

## screen

由于我们使用的是远程云服务器，多是采用 ssh 会话的形式和服务器交流，包括启动 mc server，而 centos 会在中断会话是 kill 会话中的进程，所以我们需要 screen 来帮我们 24 小时驻守进程。

```bash
yum -y install screen
# 某些 centos 会缺少 libnsl
yum -y install libnsl
```

如果是 centos8 及以上 os，直接 install screen 会找不到该软件，因为 screen，iftop 等已经不再 centos8 的源里不存在这些软件，所以需要先安装 epel，至于 epel 是什么玩意，可以参照我之前的一片文章有提到 [LNMP 环境搭建踩坑记录](https://www.july.icu/post/lnmp-install#%E5%AE%89%E8%A3%85%20Remi%20%E6%BA%90)

![图片](/images/0672b64a6cdb23dd03829fb6229af070793d3d2593b8723daf81e1520b06b835.png)

```bash
yum -y install epel-release
```

# 下载 paper 核心

接下来我们需要把 mc 核心搞到服务器上去，比较小白的方法是在自己的电脑上下载下来之后通过 ftp 传到服务器上去，不过我们的服务器本身就是通公网的，所以我们可以用更优雅的方式。

首先我们需要有个合适的目录，维护整洁的服务器是一个程序员的基本功。

```bash
# 这个文件夹常常用来存放一些资源，我们可以把下载的东西都先塞到这里
cd /usr/local/src
# 建立一个文件夹用来存放服务启动文件
mkdir mc-server
```

我们可以使用 wget 命令来下载 http 请求的内容

```bash
cd mc-server
wget https://api.papermc.io/v2/projects/paper/versions/1.19.2/builds/142/downloads/paper-1.19.2-142.jar
```

# 编辑启动脚本

我们写一个 shell 脚本，方便我们一键启动 server

```bash
vim start.sh
```

启动命令形如 `java -Xms[xxx]M -Xmx[xxx]M -jar [paper-xxx].jar nogui`，其中我们需要关心该 server 的内存占用量。在确保不影响服务器正常运行的同时尽可能占用空余内存，我这里使用大约空闲内存的 3/4 左右。

```bash
# start.sh
java -Xmx2715M -jar paper.jar nogui
```

保存之后还需要对该脚本赋予执行权限

```bash
chmod +x start.sh
```

然后我们尝试用 screen 启动一次服务

```
# 创建一个名为 mc 的会话
screen -S mc
# 进入创建的会话进程启动 mc
./start.sh
```

顺利的话会出现如下报错，不要紧张，这是要求我们同意一些协议。

![图片](/images/bd1e54745779de95403472691dd91608781de5213574eb2bf38440d61d4fee39.png)

先 `ls` 下，我们发现目录多了很多文件。

![图片](/images/4dd16dedcff6167b903333db4908a73768f53dc4d095fa87a74972270ef12d90.png)

我们需要修改 eula.text 中的 `eula=false` 改为 `eula=true`，然后保存重新启动服务。

至此 mc 已经可以玩了！

需要注意的是一般的云服务器商，如阿里云会带有默认的防火墙安全组，我们需要对 25565 端口号做豁免。

![图片](/images/654f4369725375013937be3f90dfee1d5ba2eafd0586712fd2169040b54dce5b.png)

当然我们已经可以退出 ssh 链接了，不过我们还需要记忆一下 screen 一些常规操作符

```
# 退出会话
screen -d
# 会话列表
screen -ls
# 进入会话，id 和 name 分别对应会话的 id 和 name
screen -x [id].[name]
```

# 优化配置

## 交换内存

在 window 中我们也称为虚拟内存，如今动辄 16G、23G 内存的家庭机确实用不上这个技术，不过在内存稀缺的过去当内存空间出现不足时 OS 会尝试把部分不活跃内存存储到硬盘上，硬盘的存读速度非常慢但好过内存溢出强制 kill 进程，给用户缓冲的余地。

### 检查 swap 信息

在“寸土寸金”的服务器上，很明显我们需要它。我们能做的是在内存溢出的边缘最大化的利用服务器资源，但难免遇到意外之事，比如访问量激增，游戏自动备份等。为了防止出现这种情况直接打挂服务器我们需要设置一定的交换内存。

```
swapon -s
```

在纯净的 OS 上使用 swapon 查询可能得不到任何信息，因为虚拟内存并没有被设置，我们可以通过检查内存来查看

```
free -m
```

可以看到在 Swap 一栏都为 0

![图片](/images/2348e791953dc34a7866334203692f253250943dd502ae2fe468d94dbc9f6df3.png)

### 检查磁盘信息

按照上面说的原理，我们需要在磁盘上化一块区域用来供给内存用，所以我们可以先检查一下磁盘

```
df -h
```

我们主要的存储分区有 60G 的空间，我们可以大方的划出 4 个 G 来做交换空间

![图片](/images/45ca4bc8cba9c4a57751a9b691aae99fe3f7bc89d8dd611870d3d5cedb174927.png)

### 创建交换内存

第一步我们可以在分区根目录创建一个文件 swapfile ，当然可以是其他位置或者其他名称

```
fallocate -l 4G /swapfile
// 需要给此文件管理员可读权限，同时不允许其他用户读取（否则就相当于非法访问内存了）
chmod 600 /swapfile
```

第二步为我们创建的文件写入标准的格式头，这一步的作用是声明该文件会被用于存储内存信息，否则无法识别

```
mkswap /swapfile
```

最后我们将其制定为交换内存

```
swapon /swapfile
```

走到这一步我们的交换内存已经生效了，不过系统重启还是会失效，所以我们可以在 `/etc/fstab` 增加一行永久让他生效

```
# /etc/fstab
/swapfile    swap    swap    sw  0   0
```

## 世界生成与加载

server.properties

```yml
# 视距，计算公式，假设 view-distance=x，则单个玩家加载区块数量=(2x+1)^2
view-distance=5
# 1.18 新增参数，决定了多少区块范围内的实体会被记入 Tick
simulation-distance=3
```

paper.yml

```yml
# 关闭出生点常加载
keep-spawn-loaded: false
# 阻止玩家进入未加载的区块
prevent-moving-into-unloaded-chunks: true
# 区块在玩家离开后一定时间卸载以释放资源
delay-chunk-unloads: 5s
# 每 tick 自动保存区块的数量，这个不建议调整，需要针对服务器人数做判断
max-auto-save-chunks-per-tick: 12
```


# plugins

## luckperms

权限控制插件。将对应插件下载到 plugins 文件夹中，启动一次服务就会在 plugins 文件夹中生成配置文件。

LP 基本无需配置，只需要了解它默认是使用 h2 作为存储模式，同时也支持远程数据库或者本地纯文本文件。

![图片](/images/f03b7123ca6628957b2e08311c2c2b3aa5eb84cacdeb78525022f147d6adcd9b.png)

LP 里存在 “用户 user”、“用户组 group”两个主体概念，通过“继承 parent”将权限节点或者用户组串联起来，LP 的命令使用 `/lp` 作为前缀，如下就是一个简单的将用户 A 设置为用户组 B：

```
/lp user A parent set B
```

# 光影与材质

虽然是插件服，但不影响光影和材质的安装（需要关注的是部分材质包会带有 mod 作为原版不存在物品或机制的补充，这在插件服是不可行的）。

材质包的使用比较简单，把网上下载的材质包拖到对应文件夹即可，这里不做赘述。

而想要使用光影我们必须用到 [OptiFine](https://www.optifine.net/downloads) 

> OptiFine is a Minecraft optimization mod.
>
> It allows Minecraft to run faster and look better with full support for HD textures and many configuration options.

通过 OptiFine 作者对它的概述，我们可以知道这个特殊的模组可以解放 mc 的一些能力，并且提供一些 API。

运行它之后，它会为 mc 创建特殊的副本，使用它安装游戏即可。

光影包我使用的是 [BSL Shader](https://www.bslshaders.com/)，BSL 整体上更加自然不会出现瞎眼效果。