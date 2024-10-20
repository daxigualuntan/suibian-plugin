import plugin from '../../../lib/plugins/plugin.js'
import { checkOnline, onlyGroup, returnErr, getTypeAndRecall } from '../tools/check.js'
import { Chehui } from '../tools/dealMsg.js';
import { queryList } from '../tools/query.js';
import { readYAML } from '../tools/yaml.js'

const mlData = await readYAML(`./plugins/suibian-plugin/config/zhiling.yaml`, "utf-8")
const app = mlData.zhangzui
console.log(app);

const data = await readYAML(`./plugins/suibian-plugin/config/config.yaml`, "utf-8")

export class ZhangZui extends plugin {
    constructor() {
        super(app)
    }
    // 张嘴有急事 0
    async zz(e) {
        try {
            await onlyGroup(e)
            await checkOnline(app, app.rule[0].reg)  // 检查指令是否上线 

            let resMsg

            // directory path
            const dir = data.zzData.dir;

            let pvList = []  // 媒体文件列表
            let sjIndex  // 随机索引
            let msg = []
            let chehuisj    // 控制撤回时间

            // 读取文件
            const fatherDir = await queryList(dir)
            fatherDir.forEach(item => {
                pvList.push(item)
            })

            sjIndex = Math.floor(Math.random() * pvList.length)

            const getTypeAndRecallData = await getTypeAndRecall(dir,pvList, sjIndex, data.zzData.recallItimer, data.zzData.recallVtimer)
            // console.log(getTypeAndRecallData);

            msg.push(getTypeAndRecallData.msg)
            chehuisj = getTypeAndRecallData.recallTime

            resMsg = await e.reply(msg)

            // 判断是否发送成功
            let errJudge = 'error' in resMsg

            if (errJudge) throw ({ img:`./plugins/suibian-plugin/res/img/略略略.gif`,msg: `Man! What can I say?  【${pvList[sjIndex]}】  out!`, type: `QQ风控` })

            return await Chehui(resMsg, e, chehuisj)
        } catch (err) {
            returnErr(e, err)
        }
    }
}