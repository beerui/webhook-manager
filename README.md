# Webhook 自动部署 Auto Build With Config

一个管理github的webhook自动部署项目

## 开始 Start
1. 在服务器中安装 `npm i @brewer/webhook-manager -g`
2. 新建文件夹 `mkdir webhook && cd webhook`
3. 在`webhook`文件夹中新建配置文件 `config.json`
4. 配置完成后运行`brewer-webhook`
5. 查看日志 `tail -f ./logs/webhook.log`
6. 测试 `push`项目 查看日志中是否执行

## 项目启动流程
1. 读取配置中的文件
2. 生成日志文件`webhook/logs`
- 建议使用pm2来启动项目

## config.json 配置
`app1, app2`是项目名，但是必须是`github webhook`中的接口名。 如：`https://yoursite/webhook/app1`,
我们会拿`app1`来跟`config.json`中的配置进行匹配

### config.json 基本示例
``` json
{
  "port": 3200,                 // 启动的服务端口号
  "app1": {                     // 项目一：app1是webhook添加的接口地址
    "name": "project1",         // 日志中会输出名称，预留的可以是pm2启动的服务名称
    "path": "./project1",       // 项目路径（真实地址要写绝对路径）
    "command": ""               // 额外运行的命令
  },
  "app2": {
    "name": "project2",
    "path": "./project2",
    "command": "cd /data/project2 && git pull origin main && npm i && npm run build"
  }
}
```
每次修改完配置文件后，必需重启！

### deploy.sh 示例（必需）
这个文件需要放在监听项目中的根目录，非webhook中的目录。
若需要执行的命令比较简单，可以使用`app2.command`这种形式替代

```bash
#! /bin/bash
WEB_PATH=/data/app1
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
### 注意：
- 项目需要自己首先拉取到服务器中（有些可能没用权限,需要配置.）
- 这个文件必需，但是可以为空。


## `webhook`设置流程
在github的某一个项目中按照以下步骤进行
1. Settings
2. Webhooks
3. Add webhook
4. Content type ===> json
5. Payload URL ===> `https://yoursite/webhook/app1`
6. Secret ===> 保持为空
7. SSL verification ===> 若SSL验证失败可以暂时使用`Disable (not recommended)`
8. Just the push event.
9. Active 勾选
10. 点击 `Add webhook` 按钮

### `nginx`中的`webhook.conf`配置示例

`nginx`配置完成后可以使用`GET`请求`/webhook/health`接口来进行测试服务是否启动成功并且可以访问成功。
若访问返回`health`则成功！
```
upstream webhook {
    server 127.0.0.1:3200;
}

server {
    listen 80;
    server_name webhook.yoursite.com;
    
    return 301 https://webhook.yoursite.com$request_uri;
}

server {
    listen 443 ssl;
    server_name  webhook.yoursite.com;

    access_log /var/log/nginx/webhook_access.log;
    error_log /var/log/nginx/webhook_error.log;
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

## 如果你感兴趣 这是我们的运行流程
- 我们将运行一个node服务，用来接收来自github的推送。
- 当github接收到用户的push事件，就会推送到我们填写的地址。如：`webhook/app1`
- 我们在接收到推送之后，会运行`app1.path`目录下的`deploy.sh`的命令。
- 执行完毕后，会运行`app1.command`中的自定义命令,如果有的话。
- 到此，我们的流程就结束了。
