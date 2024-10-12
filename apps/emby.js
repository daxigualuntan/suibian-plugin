import plugin from '../../../lib/plugins/plugin.js'
import request from 'request'
import schedule from "node-schedule";
import {
    segment
} from 'oicq'
import fs from 'fs'
import {
    checkOnline,
    returnErr
} from '../tools/check.js'
import {
    Chehui
} from '../tools/dealMsg.js';
import appList from '../config/appList.json' assert {
    type: 'json'
};
import chcd from '../config/chcd.json' assert {
    type: 'json'
}

// emby地址配置
const embyServerUrl = 'http://127.0.0.1:8096'; // 替换为自己的emby地址
const apiKey = '7634c6456d4a48479ff64014a5826b9f';  // 替换为自己的embyAPI key
const timeoutTime = 1   // 自定义注册无密码删除时间 单位：h
const deleteTime = timeoutTime * 60 * 60 * 1000;
const currentTimeStamp = new Date().getTime(); //获取当前时间

let thisApp = appList.app.find(array => array.id === `emby`)

export class Emby extends plugin {
    constructor() {
        super(thisApp)
    }
    // emby注册
    async embyReg(e) {
        try {
            let check_online = await checkOnline(thisApp, `8-1`)
            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }

            let user = {
                "Name": e.user_id,
                "CopyFromUserId": "3c9fc6391a274967bd5ca57e5924c248",
                "UserCopyOptions": [
                    "UserPolicy"
                ]
            }

            request({
                url: `${embyServerUrl}/emby/Users/New?api_key=${apiKey}`,
                method: "POST",
                json: true,
                body: user
            }, async function (err, r, body) {
                if (err) throw err
                // logger.info(r.statusCode)
                let sc = r.statusCode
                switch (sc) {
                    case 400:
                        return await e.reply(`注册失败，你的账号已存在或不在白名单内，如有疑问请联系管理员\r\n错误码：` + sc, true);
                    case 401:
                        return await e.reply(`注册接口未经认证授权，需要管理员进行身份验证。\r\n错误码：` + sc, true);
                    case 403:
                        return await e.reply(`禁止访问，没有请求操作的权限。\r\n错误码：` + sc, true);
                    case 404:
                        return await e.reply(`资源未找到或不可用\r\n错误码：` + sc, true);
                    case 200:
                        let remsg = [segment.image(`./plugins/suibian-plugin/res/emby/1.png`), segment.image(`./plugins/suibian-plugin/res/emby/2.png`), segment.image(`./plugins/suibian-plugin/res/emby/3.png`), `注册成功，请及时登陆学习资料库http://v4.wf-nas.asia:62600按照以上图片指示设置密码，${timeoutTime}小时内未及时设置密码账号会被清除`]
                        let resMsg = await e.reply(remsg, true)
                        await Chehui(resMsg, e, chcd.embyzc)
                        return resMsg
                }
            })
        } catch (err) {
            returnErr(e, err)
        }
    }

    // 删除注册超过指定时间未设置密码的账号
    async embyDeleteUserWithoutPassword(e) {
        if (!e.isMaster) return e.reply(`吊毛，你没有权限操作！`, true)
        let qlList = []
        let msg = ``
        request.get(`${embyServerUrl}/emby/Users?api_key=${apiKey}`, async (error, response, body) => {
            if (error) {
                console.error('请求错误:', error);
            } else {
                const users = JSON.parse(body);
                // 遍历所有用户
                users.forEach(user => {
                    // 检查用户注册时间是否超过指定小时且没有密码
                    if (user.DateCreated && !user.HasPassword && currentTimeStamp - new Date(user.DateCreated).getTime() > deleteTime) {
                        qlList.push(user)
                        // logger.info(qlList[0].Id)
                    }
                })
                logger.info(qlList.length)

                function deleteUser(userId) {
                    return new Promise((resolve, reject) => {
                        request.delete(embyServerUrl + '/emby/Users/' + userId, {
                            qs: {
                                api_key: apiKey
                            }
                        }, (error, response, body) => {
                            if (error) {
                                console.error(`Error deleting user ${userId}: ${error}`);
                                reject(error);
                            } else {
                                console.log(`User ${userId} deleted successfully.`);
                                resolve();
                            }
                        });
                    });
                }

                // 使用Promise来处理删除用户的异步操作
                async function deleteUsers() {
                    for (let index = 0; index < qlList.length; index++) {
                        try {
                            await deleteUser(qlList[index].Id);
                        } catch (error) {
                            e.reply(`删除${qlList[index].Name}失败\r\n错误原因：${error}`);
                        }
                    }
                }

                deleteUsers()

                // 获取已删除的qq号
                let deleteList = qlList.map(obj => obj.Name)
                // console.log(deleteList);

                if (deleteList.length === 0) { msg = `暂未找到注册时间超过${timeoutTime}小时未设置密码的无用账号` }
                else { msg = `已删除${deleteList.length}个注册时间超过${timeoutTime}小时未设置密码的账号，\r\n删除账号列表如下：${deleteList}` }
                return e.reply(msg, true)

            }
        });
    }

    // 获取emby随机推荐
    async sjtj(e) {
        try {
            let check_online = await checkOnline(thisApp, `8-3`)
            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }

            let msg = []
            let nowUser = e.user_id
            let userIsCz
            let tjxx = []
            let resMsg

            request.get(`${embyServerUrl}/emby/Users?api_key=${apiKey}`, async (error, response, body) => {
                if (error) {
                    console.error('请求错误:', error);
                } else {
                    const users = JSON.parse(body);
                    // console.log(users);
                    // console.log(typeof(users));

                    // 查找该QQ号是否注册
                    userIsCz = users.find(item => item.Name == nowUser);
                    // logger.info(!userIsCz)
                    if (!userIsCz) return await e.reply(`吊毛，你都没有注册，还想开盲盒？先发送指令“#注册”进行注册吧！`, true)
                    if (!userIsCz.HasPassword) return await e.reply(`靓仔，你的账号还未设置密码，不能开盲盒，先去设密码吧`, true)
                    // console.log(`${embyServerUrl}/emby/Movies/Recommendations?CategoryLimit=1&ItemLimit=1&UserId=${userIsCz.Id}&api_key=${apiKey}`);

                    // 发送GET请求获取随机推荐
                    request.get(`${embyServerUrl}/emby/Movies/Recommendations?CategoryLimit=1&ItemLimit=1&UserId=${userIsCz.Id}&api_key=${apiKey}`, async (error, response, body) => {
                        if (error) {
                            throw {
                                msg: error,
                                type: null
                            }
                        } else {
                            // console.log(body); .map(item => item.Name);
                            const tjmv = JSON.parse(body)[0].Items
                            tjmv.forEach(function (item) {
                                tjxx.push(item.Name, item.Type, item.Id)
                            });
                            // console.log(tjxx);
                            // 这里可以对返回的随机推荐数据进行处理
                            // console.log((tjxx[1]!=="Movie"));
                            try {
                                if (tjxx[1] !== "Movie") {
                                    msg = [`随机emby资源：\r\n名称：${tjxx[0]}\r\n类型：${tjxx[1]}`]
                                }
                                else {
                                    msg = [`随机emby资源：\r\n名称：${tjxx[0]}\r\n类型：${tjxx[1]}\r\n预览：`, segment.image(`${embyServerUrl}/emby/Items/${tjxx[2]}/Images/Primary?maxHeight=500&maxWidth=1300`)]
                                }
                                resMsg = await e.reply(msg, true)
                                if (!resMsg) throw {
                                    msg: `服务端错误`,
                                    type: `未知错误`
                                }
                                await Chehui(resMsg, e, chcd.embytj)
                                return resMsg
                            } catch (error) {
                                returnErr(e,error)
                            }

                        }
                    });
                }
            });
        } catch (err) {
            returnErr(e, err)
        }
    }

    // 获取emby媒体库消息
    async getEmbyInfo(e) {
        try {
            let check_online = await checkOnline(thisApp, `8-4`)
            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }

            let resCounts
            // console.log(`${embyServerUrl}/emby/Items/Counts?api_key=${apiKey}`);

            request.get(`${embyServerUrl}/emby/Items/Counts?api_key=${apiKey}`, async (error, response, body) => {
                if (error) {
                    throw error
                } else {
                    console.log(1);
                    resCounts = JSON.parse(body)
                    let resMsg = await e.reply([segment.at(e.user_id), `当前服务器拥有:\r\n电影分类 资源${resCounts.MovieCount}部\r\n音频分类 资源${resCounts.SongCount}部\r\n音乐视频分类 资源${resCounts.MusicVideoCount}部`], true)
                    // console.log(resMsg);
                    return await Chehui(resMsg, e, chcd.embykc)
                }
            });

        } catch (err) {
            returnErr(e, err)
        }
    }

}