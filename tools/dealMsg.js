import { returnErr } from '../tools/check.js'

// 制作转发消息
const dealForwardMsg = async function (e, forwardMsg, failMsg) {
    if (e.isGroup) {
        forwardMsg = await e.group.makeForwardMsg(forwardMsg)
    } else {
        forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
    }
    // 采用转发形式发送消息，减少风控
    let resMsg = await e.reply(forwardMsg, false)
    if (!resMsg) throw (failMsg)
    return resMsg
}

// 撤回消息
const Chehui = async function (msgRes, e, timeoutTime) {
    setTimeout(() => {
        e.isGroup
            ? e.group.recallMsg(msgRes.message_id)
            : e.friend.recallMsg(msgRes.message_id);
    }, timeoutTime);
}

export {
    dealForwardMsg,
    Chehui,
}