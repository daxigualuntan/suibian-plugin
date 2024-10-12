import plugin from '../../../lib/plugins/plugin.js'
import { checkOnline, returnErr, checkParam } from '../tools/check.js'
import appList from '../config/appList.json' assert { type: 'json' };

let thisApp = appList.app.find(array => array.id === `st`)

export class setu extends plugin {
    constructor() {
        super(thisApp)
    }
    // 来点色图
    async ldst(e) {
        try {
            let check_online = await checkOnline(thisApp, `6-1`)
            if (!check_online.online) throw {
                msg: check_online.msg,
                type: check_online.type
            }
            return e.reply(`自己看吧：https://www.cherryexps.com/api/se.php`)

        } catch (err) {
            returnErr(e, err)
        }
    }

}