# Instructions for using webhook auto deployment
## Introduction
This document explains how to use this script to implement automatic deployment of multiple projects using Webhooks.

## Installation
Install globally using `npm i @brewer/webhook-manager -g`.

## Quick Start
### 1. Configure projects
   Configure the projects that need to be automatically deployed in the config.json file.

- port The port on which the service will run, default is 3200.
- project The projects to be deployed.
Each (project) needs to define the following attributes:

- name - The name of the project, used for logging purposes.
- path - **The absolute path** of the project deployment directory, which must contain `deploy.sh`.
- command (optional) - The command to be executed after deployment is complete.
For example:

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

To standardize and facilitate management, create a folder named webhookConfig (mkdir webhookConfig && cd webhookConfig) and create a config.json file in it.

### 2. Start the service
   Run `brewer-webhook` in the webhookConfig folder to start the service. Logs will also be generated in this directory.

### 3. Check the service status
   Access http://your-server-url:3200/webhook/health to check if the service is running properly. If it returns "health", the service is running properly.
   Deployment logs can be viewed in the `./logs/webhook.log` file in the current directory.

### 4. `Configure Webhooks` according to the following steps
   Configure a Webhook for each project in the code hosting platform (e.g. Github, Gitlab, Bitbucket). The Webhook address is http://your-server-url:3200/webhook/:project, where :project corresponds to the project name defined in config.json.

### 5. Check if the Webhook is set up correctly
   Modify the project files, `push` the project, and check the requests in Github and the error logs in `logs` to resolve any issues.

At this point, we have completed the setup of a service that listens to multiple projects.

## Example of `deploy.sh`
This file needs to be placed in the `/var/www/project1` directory.
If the command to be executed is relatively simple, it can be replaced with `app2.command`.


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
When pushing from Github to the server, the deploy.sh in the project(:project) directory will be executed.

This is a Bash script that automatically executes the deployment process of the project in the Web server. The following is a breakdown of the script's functionality:

### Note
- The project needs to be pulled into the server first (some may require permission configuration).
- It is best to manage it inside the deploy.sh file.


## `webhook`Setting Flow
1. Settings
2. Webhooks
3. Add webhook
4. Content type ===> json
5. Payload URL ===> `https://yoursite.com/webhook/` + app1
6. Secret ===> keep empty
7. SSL verification ===> if fail you can use`Disable (not recommended)`
8. Just the push event.
9. Active yes
10. click `Add webhook`

## Tool Introduction
This is a Node.js web server script used to listen for webhook requests and trigger deployment scripts. It uses the Express.js framework to handle HTTP requests, the body-parser middleware to parse JSON request bodies, the child_process module to generate shell commands, and the winston module for logging.

The script reads a JSON configuration file that defines the deployment settings for different projects. When a webhook request is received, the script checks the project name in the URL path based on the configuration file. If it finds a match, it generates a shell command to execute the deployment script for that project. If a post-deployment command is defined in the configuration, it also generates a shell command to execute it.

The script also provides a health endpoint at /webhook/health for checking the server status.

Overall, this script provides a simple way to automate the deployment process for multiple projects using webhooks.

## Notes
- This script requires a Node.js environment. If Node.js is not installed, please install it first.
- Before starting the service, ensure that the configuration information in the config.json file is correct.
- If the service cannot run normally, check the error information in the terminal output or log file.
- Restart is required after modifying the configuration file!
- It is recommended to use pm2 to start the project: `pm2 start brewer-webhook --name webhooks`.