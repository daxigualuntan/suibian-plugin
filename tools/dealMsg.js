// 制作转发消息
const dealForwardMsg = async function (e, forwardMsg, title) {
    if (e.isGroup) {
        forwardMsg = await e.group.makeForwardMsg(forwardMsg)
    } else {
        forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
    }
    // 处理转发卡片，规避群风控
    forwardMsg.data = forwardMsg.data
        .replace('<?xml version="1.0" encoding="utf-8"?>', '<?xml version="1.0" encoding="utf-8" ?>')
        .replace(/\n/g, '')
        .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
        .replace(/___+/, `<title color="#777777" size="26">${title}</title>`)
    // 采用转发形式发送消息，减少风控
    let resMsg = await e.reply(forwardMsg, false)
    if (!resMsg) await e.reply('消息发送失败，可能被风控')
    return resMsg
}

// const Chehui = async function (messageId, messageType, timeoutTime) {
//     try {
//         if (!messageId || !messageType || !timeoutTime) {
//             throw new Error("缺少必要参数");
//         }

//         let target = null;
//         if (messageType === 'group') {
//             target = e.group;
//         } else if (messageType === 'friend') {
//             target = e.friend;
//         } else {
//             throw new Error("无效的消息来源类型");
//         }

//         setTimeout(() => {
//             target.recallMsg(messageId);
//         }, timeoutTime);

//         console.log("消息撤回操作已延迟执行");

//     } catch (error) {
//         console.error("发生错误：", error.message);
//     }
// }

// // 调用示例
// const messageId = 12345; // 假设消息ID为12345
// const messageType = 'group'; // 假设消息来源为群聊
// const timeoutTime = 5000; // 假设延迟执行时间为5000毫秒

// Chehui(messageId, messageType, timeoutTime)

// 撤回消息
const Chehui = async function (msgRes, e, timeoutTime) {
    if (msgRes && msgRes.message_id) {
        let target = null;
        if (e.isGroup) {
            target = e.group;
        } else {
            target = e.friend;
        }
        if (target != null) {
            setTimeout(() => {
                target.recallMsg(msgRes.message_id);
            }, timeoutTime);
        }
    }
}

export {
    dealForwardMsg,
    Chehui,
}