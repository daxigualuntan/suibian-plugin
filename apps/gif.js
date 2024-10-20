import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import YAML from "yaml"
import { checkOnline, onlyGroup, returnErr, getTypeAndRecall } from '../tools/check.js'
import { Chehui } from '../tools/dealMsg.js';
import { queryList } from '../tools/query.js';
import { readYAML } from '../tools/yaml.js'


const mlData = await readYAML(`./plugins/suibian-plugin/config/zhiling.yaml`, "utf-8")
const app = mlData.gif

const data = await readYAML(`./plugins/suibian-plugin/config/gifs.yaml`, "utf-8")

export class MangHe extends plugin {
    constructor() {
        super(app)
    }


    // 更新gif库
    async updateGif(e) {
        try {
            if(!e.isMaster) throw {
                msg:`你没有权限操作！`,
                type:`权限不足`,
                img:`./plugins/suibian-plugin/res/img/暂无权限.png`
            }
            await checkOnline(app, app.rule[0].reg)  // 检查指令是否上线
            const childDir = await queryList(data.index.rootDir, 'utf-8')
            const obj = {
                index: { rootDir: data.index.rootDir, isRecall: data.index.isRecall, errimg: data.index.errimg, recallTime: data.index.recallTime },
                reslist: childDir
            }
            // console.log(YAML.stringify(obj));
            await fs.writeFile(`./plugins/suibian-plugin/config/gifs.yaml`, YAML.stringify(obj), 'utf-8', (err) => {
                if (err) throw {
                    msg: `GIF库更新失败！请检查日志`,
                }
                else return e.reply(`GIF更新成功！,请发送“#重启”来重新加载`, true)
            })
        } catch (err) {
            returnErr(e, err)
        }
    }

    // 随机获取gif 1
    async getGif(e) {
        try {
            await onlyGroup(e)
            await checkOnline(app, app.rule[1].reg)  // 检查指令是否上线  

            let resMsg
            const list = data.reslist
            if (!list) {
                throw {
                    img: data.index.errimg,
                    msg: `GIF库空空如也，请先尝试发送“更新gif”指令来更新GIF库`,
                    type: `空空如也`
                }
            }

            const randomNum = Math.floor(Math.random() * list.length)
            const randomGif = list[randomNum]
            const randomGifName = randomGif.split('.').slice(0, -1).join('.')
            const imgUrl = data.index.rootDir + '/' + randomGif
            const msg = [segment.image(imgUrl), `\r\n车牌号：${randomGifName.replace(/#\([^)]*\)|#/g,'')}\r\n服务器是否收录：${randomGifName.includes('#')?'✅':'❌'}`]       

            resMsg = await e.reply(msg, true)
            // 判断是否发送成功
            let errJudge = 'error' in resMsg
            if (errJudge) throw ({ msg: `十分甚至九分的操蛋~~~图片半路裂开了了（恼）\r\n被撅的车牌号是${randomGifName.replace(/#\([^)]*\)|#/g,'')}，可反馈给主人对图片进行和谐`, type: `QQ风控` })
            return await Chehui(resMsg, e, data.index.recallTime)
        } catch (err) {
            returnErr(e, err)
        }
    }

}
