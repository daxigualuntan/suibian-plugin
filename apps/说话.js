import plugin from '../../../lib/plugins/plugin.js'
import { checkOnline, returnErr, checkParam } from '../tools/check.js'
import appList from '../config/appList.json' assert { type: 'json' };
import { toVoice } from '../tools/toVoice.js'

let thisApp = appList.app.find(array => array.id === `sh`)

export class Speak extends plugin {
    constructor() {
        super(thisApp)
    }
    // 说话
    async say(e) {
        try {
            let check_online = await checkOnline(thisApp, `7-1`)
            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }

            // 检测指令后参数是否为空
            let check_param = await checkParam(e, 1)
            if (check_param.empty) throw {
                msg: check_param.msg,
                type: check_param.type
            }
            
            let param = e.msg.slice(1).trim()

            toVoice(e,param)

        } catch (err) {
            returnErr(e, err)
        }
    }

}