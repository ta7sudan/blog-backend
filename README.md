# blog-backend
blog backend

* helmet 配置, done
* fastify-cookie, done
* fastify-cors, done
* fastify-jwt, done
* fastify-postgre, done
* fastify-redis, done
* fastify-rate-limit, done
* 部署命令, cross-env, done
* 每个响应都要设置好 content-type
* JWT 校验, done
* 前后端项目共享同一套状态码
* fastify-autoload
* fastify-plugin
* fastify-multipart
* websocket
* JWT 获取
* gzip 在 nginx 层面做
* 微信公众号
* 微信机器人
* 后台登录授权
* 后台登录验证码
* 先 PM2 吧, 进一步地换 Pandora, 定制性会更好, 再进一步参考 egg-cluster 自己手写进程守护和平滑退出



* 请求登录页面, 给页面种 cookie 做一个临时身份 uuid, 30 分钟失效,  uuid 存 redis, 页面携带 cookie 请求后端生成验证码, 1 分钟失效,
* 给用户密码验证码登录, 先校验验证码, 从 cookie 取 uuid 查 redis 看验证码是否正确, 不正确重定向到错误页面, 正确则继续, 查库是否存在用户, 不存在重定向到错误页面, 存在重定向到后台并设置 cookie 作为用户身份授权, 此后的接口请求都必须有该 cookie