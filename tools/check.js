// 检查指令是否可用
const checkOnline = async function (app, index) {
    let thisZl = app.rule.find(array => array.index === index)
    // console.log(thisZl.isOnline);
    if (!thisZl.isOnline) {
        return {
            online: false,
            msg: `该指令尚未上线或处于维护中`,
            type: `无效指令`
        }
    } else if (thisZl.isOnline) {
        return {
            online: true,
            msg: ``
        }
    }
}

// 检查部分搜索指令后是否带参数
const checkParam = async function (e, num) {
    let param = e.msg.slice(num).trim()  // 截取要搜索的内容
    // console.log(param);
    if (!param) {
        return {
            empty: true,
            msg: `指令后面的参数不能为空！`,
            type: `无效参数`
        }
    } else if (param) {
        return {
            empty: false,
            msg: ``,
            param
        }
    }
}

// 处理指令执行错误的函数
const returnErr = async function (e, err) {
    logger.info(err);
    await e.reply(`执行指令时出现错误\n错误类型：${err.type ? err.type : '未知错误'}\n错误描述：${err.msg ? err.msg : '未知错误'}`, true)
    return err
}

export {
    checkOnline,
    checkParam,
    returnErr
}