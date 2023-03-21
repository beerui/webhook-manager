# Webhook 自动部署使用说明
[中文文档](./README.md)
[English](./README_en.md)

## 简介
本文档介绍了如何使用本脚本实现 Webhook 自动部署多个项目。

## 安装
全局安装 `npm i @brewer/webhook-manager -g`

## 快速开始

### 1. 配置项目
在 config.json 文件中配置需要自动部署的项目。
- `port` 服务启动的端口号 默认 3200
- `project` 项目

每个项目(project)需要定义以下属性：

- `name` - 项目名称，用于日志记录
- `path` - 项目部署**绝对路径**, 路径下需包含 `deploy.sh` 
- `command` (可选) - 部署完成后需要执行的命令

例如：
```json
{
  "port": 3200,
  "app1": { 
    "name": "My Project 1", 
    "path": "/var/www/project1",
    "command": "" 
  },
  "app2": {
    "name": "My Project 2",
    "path": "/var/www/project2",
    "command": "cd /var/www/project2 && git pull origin main && npm i && npm run build"
  }
}

```
为了规范和便于管理，新建文件夹webhookConfig(`mkdir webhookConfig && cd webhookConfig`)
在文件夹中新建：`config.json`。

### 2. 启动服务
在`webhookConfig`文件夹中运行`brewer-webhook`进行服务启动。日志也将自动生成在此目录下。[API示例](./API.md)

### 3. 检查服务状态
访问 http://your-server-url:3200/webhook/health 可以检查服务是否正常运行。如果返回 health 则表示服务正常。
部署日志可以在当前目录下的 `./logs/webhook.log` 中查看。

### 4. 根据下方`webhook设置流程`进行github的推送设置
在代码托管平台（如 Github、Gitlab、Bitbucket）中为每个项目配置 Webhook。Webhook 地址为 http://your-server-url:3200/webhook/:project 其中 :project 为项目名称，对应 config.json 中定义的项目名称。

### 5. 检测webhook是否设置正确
修改项目文件，`push`项目， 查看github中的请求和`logs`日志中的报错并解决。

到此，我们完成了一个监听多项目的服务搭建。

## deploy.sh 示例
这个文件需要放在`/var/www/project1`目录。
若需要执行的命令比较简单，可以使用`app2.command`这种形式替代

```bash
#! /bin/bash
WEB_PATH=/var/www/project1
echo "开始构建"
cd $WEB_PATH
echo "拉取main分支的代码"
git reset --hard origin/main
git clean -f
git pull
git checkout main
echo "检查权限"

# 建议手动进行安装 之后每一次只需要 npm run build即可
npm install 

npm run build
echo "Finished."
```
在github推送到服务器时，就会执行项目(:project)目录下的`deploy.sh`

这是一个 Bash 脚本，可自动执行 Web 服务器中项目的部署过程。 以下是脚本功能的详细解释：

1. 将 WEB_PATH 变量设置为 /var/www/project1。
2. 将当前目录更改为 WEB_PATH。
3. 将代码重置为原始/主分支的状态。
4. 清除 Git 未跟踪的任何文件的目录。
5. 检查主分支。
6. 使用 `npm install` 安装项目依赖项。
7. 使用 `npm run build` 构建项目。

### 注意：
- 项目需要自己首先拉取到服务器中（有些可能没用权限,需要配置.）
- 拉取后需要执行的脚本，最好放在`deploy.sh`这里面进行管理。


## `webhook`设置流程
在github的某一个项目中按照以下步骤进行
1. Settings
2. Webhooks
3. Add webhook
4. Content type ===> json
5. Payload URL ===> `https://yoursite.com/webhook/` + app1
6. Secret ===> 保持为空
7. SSL verification ===> 若SSL验证失败可以暂时使用`Disable (not recommended)`
8. Just the push event.
9. Active 勾选
10. 点击 `Add webhook` 按钮


## 工具介绍
这是一个 Node.js Web 服务器脚本，用于侦听 Webhook 请求并触发部署脚本。 它使用 Express.js 框架处理 HTTP 请求，使用 body-parser 中间件解析 JSON 请求主体，使用 child_process 模块生成 shell 命令，使用 winston 模块进行日志记录。

该脚本读取一个 JSON 配置文件，该文件定义了不同项目的部署设置。 当收到 webhook 请求时，脚本会根据配置文件检查 URL 路径中的项目名称，如果找到匹配的配置，它会生成一个 shell 命令来执行该项目的部署脚本。 如果在配置中定义了部署后命令，它还会生成一个 shell 命令来执行它。

该脚本还在 /webhook/health 提供了一个健康端点，用于检查服务器状态。

总的来说，此脚本提供了一种使用 webhook 自动执行多个项目部署过程的简单方法。


## 注意事项
- 本脚本需要 Node.js 环境。如果没有安装 Node.js，请先安装。
- 在启动服务之前，请确保 config.json 文件中的配置信息正确。
- 如果服务无法正常运行，请检查终端输出或日志文件中的错误信息。
- 每次修改完配置文件后，必需重启！
- 建议使用pm2来启动项目 `pm2 start brewer-webhook --name webhooks`


## `nginx`中的`webhook.conf`配置示例

`nginx`配置完成后可以使用`GET`请求`/webhook/health`接口来进行测试服务是否启动成功并且可以访问成功。
若访问返回`health`则成功！

```
upstream webhook {
    server 127.0.0.1:3200;
}

server {
    listen 80;
    server_name yoursite.com;
    
    return 301 https://yoursite.com$request_uri;
}

server {
    listen 443 ssl;
    server_name  yoursite.com;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    ssl_certificate /data/ssl/cert.crt;
    ssl_certificate_key /data/ssl/private.key;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE:!MD5;
    ssl_prefer_server_ciphers on;


    location / {
        proxy_pass http://webhook/;
    }
}
```

## pm2基础

```bash
npm install pm2 -g  # 安装
pm2 list            # 查看应用列表
pm2 stop webhook    # 停止应用
pm2 restart webhook # 重启应用
pm2 delete webhook  # 删除应用
pm2 logs webhook    # 查看日志 等同于`tail -f ./logs/webhook.log`

pm2 startup         # 开机启动
pm2 save            # 存入当前配置
```
