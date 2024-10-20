import plugin from '../../../lib/plugins/plugin.js'
import { checkOnline, returnErr } from '../tools/check.js'
import { readYAML } from '../tools/yaml.js'

const mlData = await readYAML(`./plugins/suibian-plugin/config/zhiling.yaml`, "utf-8")
const app = mlData.bindMl
// console.log(app);


export class BindMl extends plugin {
    constructor() {
        super(app)
    }

    // 阻止验车 0
    async bindYc(e) {
        try {
            await checkOnline(app, app.rule[0].reg)  // 检查指令是否上线
        } catch (err) {
            returnErr(e, err)
        }
    }

    // 阻止戒撸 1
    async bindJl(e) {
        try {
            // console.log(app.rule[1].errs);
            const errmsg = app.rule[1].errs
            const onlineInfo = await checkOnline(app, app.rule[1].reg, errmsg)  // 检查指令是否上线
            
        } catch (err) {
            returnErr(e, err)
        }
    }

    // 阻止撸 2
    async bindL(e) {
        try {
            const errmsg = app.rule[2].errs
            await checkOnline(app, app.rule[2].reg, errmsg)  // 检查指令是否上线
        } catch (err) {
            returnErr(e, err)
        }
    }

}