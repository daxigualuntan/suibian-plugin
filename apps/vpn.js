import plugin from '../../../lib/plugins/plugin.js'
import { checkOnline, returnErr } from '../tools/check.js'
import appList from '../config/appList.json' assert { type: 'json' };
import { Chehui } from '../tools/dealMsg.js';
import { readYAML } from '../tools/yaml.js'

let thisApp = appList.app.find(array => array.id === `tz`)

export class VPN extends plugin {
    constructor() {
        super(thisApp)
    }
    // 梯子
    async getVPN(e) {
        try {
            let check_online = await checkOnline(thisApp, `3-1`)
            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }

            const VPNdata = await readYAML(`./plugins/suibian-plugin/config/config.yaml`, "utf-8")

            let msg = [`${VPNdata.VPNdata.url}\r\n\r\n以下提供几个常用网址：`, segment.image(`./plugins/suibian-plugin/res/img/wz.png`), `方便的话可点击以下邀请链接进行注册${VPNdata.VPNdata.yqlink}`]

            let resMsg = await e.reply(msg, true)
            return Chehui(resMsg, e, VPNdata.VPNdata.recallTimer)
        } catch (err) {
            returnErr(e, err)
        }
    }

}
