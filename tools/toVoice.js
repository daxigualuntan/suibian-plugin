import { segment } from 'oicq'
 // 文字转语音
 const toVoice = async function(e, param) {
    let word = encodeURI(param)
    let msg = segment.record(`http://tts.youdao.com/fanyivoice?word=${word}&le=zh&keyfrom=speaker-target`)
    await e.reply(msg)
}

export {
    toVoice
}