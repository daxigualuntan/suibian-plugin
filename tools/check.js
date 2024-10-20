import { readYAML } from '../tools/yaml.js'

const default_chehui = await readYAML(`./plugins/suibian-plugin/config/default_chehui.yaml`, "utf-8")
// 检查指令是否可用
const checkOnline = async function (app, reg, errmsg) {
    let whatApp = app.rule.find(item => item.reg === reg)
    // console.log(whatApp.isOnline);
    if (!whatApp.isOnline) {
        throw {
            img: errmsg && errmsg.img ? errmsg.img : `./plugins/suibian-plugin/res/img/下线.png`,
            msg: errmsg && errmsg.msg ? errmsg.msg : `该指令尚未上线或处于维护中`,
            type: errmsg && errmsg.type ? errmsg.type : `指令下线`,
        }
    } else if (whatApp.isOnline) {
        return whatApp
    }
}

// 检查部分搜索指令后是否带参数
const checkParam = async function (e, num) {
    let param = e.msg.slice(num).trim()  // 截取要搜索的内容
    // console.log(param);
    if (!param) {
        throw {
            img: `./plugins/suibian-plugin/res/img/缺少参数.png`,
            msg: `指令后面的参数不能为空！`,
            type: `无效参数`
        }
    } else if (param) {
        return param
    }
}

// 处理指令执行错误的函数
const returnErr = async function (e, err) {
    logger.info(err);
    let msg = []
    err.img ? msg.push(segment.image(err.img)) : msg.push(segment.image(`./plugins/suibian-plugin/res/img/未知错误.png`))
    msg.push(`\r\n执行指令时出现错误\r\n`)
    err.type ? msg.push(`错误原因： ${err.type}\r\n`) : msg.push(`错误原因： 未知错误\r\n`)
    err.msg ? msg.push(`错误描述： ${err.msg}`) : msg.push(`错误描述： 未知错误`)
    await e.reply(msg, true)
    return err
}

// 判断随机到的文件类型发送并设置对应的撤回时间
const getTypeAndRecall = async function (dir, list, index, vtime, itime) {
    const imgArr = [`.jpg`, `.png`, `.gif`, `.jpeg`]
    let recallTime
    const viedeoArr = [`.mp4`, `.MP4`, `avi`]
    // 判断文件类型
    const isImg = imgArr.find(item => item === list[index].match(/.[^.]+$/)[0])
    const isVideo = viedeoArr.find(item => item === list[index].match(/.[^.]+$/)[0])
    if (isImg && !isVideo) return {
        msg: segment.image(dir + '/' +list[index]),
        recallTime: recallTime = itime ? itime : default_chehui.recallImg
    }
    if (!isImg && isVideo) return {
        msg: segment.video(dir + '/' +list[index]),
        recallTime: recallTime = vtime ? vtime : default_chehui.recallVideo
    }
}

// 仅限群聊使用功能
const onlyGroup = async function (e) {
    if (!e.isGroup) throw {
        img: `./plugins/suibian-plugin/res/img/禁止.png`,
        msg: `该功能只能在群聊使用！`,
        type: `使用范围限制`
    }
}

export {
    checkOnline,
    checkParam,
    returnErr,
    getTypeAndRecall,
    onlyGroup
}