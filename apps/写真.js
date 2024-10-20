import plugin from '../../../lib/plugins/plugin.js'
import { checkOnline, checkParam, returnErr } from '../tools/check.js'
import { Chehui } from '../tools/dealMsg.js';
import { queryList } from '../tools/query.js';
import { readYAML } from '../tools/yaml.js'

const mlData = await readYAML(`./plugins/suibian-plugin/config/zhiling.yaml`, "utf-8")
const app = mlData.xiezhen

const dirXz = await readYAML(`./plugins/suibian-plugin/config/config.yaml`, "utf-8")
// console.log(dirXz.xieZhenData.dir);
let picNum = dirXz.xieZhenData.counts

export class XieZhen extends plugin {
    constructor() {
        super(app)
    }

    // 获取指定数量范围不重复的随机数
    async getRandomNumAndNoRepeat(n, range) {
        let numArr = []
        while (numArr.length < n) {
            const randomNumber = Math.floor(Math.random() * range); // 你需要的范围
            if (numArr.indexOf(randomNumber) === -1) {
                numArr.push(randomNumber);
            }
        }
        return numArr;
    }

    // 获取写真艺术家目录
    async getMl(e) {
        try {
            await checkOnline(app, app.rule[0].reg)  // 检查指令是否上线

            let msgArr = []
            let listsArr = await queryList(dirXz.xieZhenData.dir)
            listsArr.forEach((item, index) => {
                msgArr.push(`序号` + `${index + 1}` + ` : ` + item + `\r\n`)
            })
            msgArr.unshift(`当前服务器共有以下${listsArr.length}个写真艺术家：\r\n`)
            msgArr.push(`可回复"#看+艺术家序号"来获取${picNum}张随机写真\r\n如显示数量不对则是QQ风控了`)

            return await e.reply(msgArr, true)
        } catch (err) {
            returnErr(e, err)
        }
    }

    // 获取随机写真并发送
    async getRandomXz(e) {
        try {
            await checkOnline(app, app.rule[1].reg)  // 检查指令是否上线

            // 获取要搜索的内容
            let check_param = await checkParam(e, 2)

            let whoUkan = check_param - 1
            if (!Number.isFinite(whoUkan)) throw {
                msg: `找个厂上班吧，这个指令不适合你，让你输序号你看看你他妈输的什么`,
                type: `遇到憨批`
            }

            // 获取父级目录下的艺术家文件夹列表
            let fatherArtistList = await queryList(dirXz.xieZhenData.dir)

            // 判断序号是否输入有误
            if (whoUkan >= fatherArtistList.length || whoUkan < 0)
                throw {
                    msg: `蠢货，输数字都能输歪来！当前序号范围（1-${fatherArtistList.length}）,不清楚就发送指令“#写真”查看当前存在的写真艺术家序号！`,
                    type: `遇到憨批`
                }

            // 反馈用户
            const rework = await e.reply([segment.image(`./plugins/suibian-plugin/res/img/boki.GIF`), `正在对着【${fatherArtistList[whoUkan]}】的照片波奇中，稍等片刻~如果${dirXz.xieZhenData.recallReplyTimer / 1000}秒后这条消息撤回了还是没有导出来就是冲晕了`], true)

            await Chehui(rework, e, dirXz.xieZhenData.recallReplyTimer)

            // 根据用户输入的艺术家序号来遍历该艺术家文件夹下的所有元素
            let secondArtistList = await queryList(dirXz.xieZhenData.dir + '/' + fatherArtistList[whoUkan])
            // console.log(secondArtistList);

            // 随机遍历该艺术家文件夹下的子文件夹并获取子文件夹下的所有元素
            // [' (1).jpg',  ' (10).jpg'...]
            
            const secondRadom = await this.getRandomNumAndNoRepeat(1, secondArtistList.length)
            let thirdDir = dirXz.xieZhenData.dir + '/' + fatherArtistList[whoUkan] + '/' + secondArtistList[secondRadom]
            let thirdArtistList = await queryList(thirdDir)
            console.log(`thirdArtistList:${thirdArtistList.length}`);

            // 随机选出指定的数量的媒体文件发送
            // 随机文件 生成指定范围的随机整数
            let resendMediaList = []  // 随机选出的预发送文件列表

            // 判断文件夹里的图片数量是否足够
            if (picNum > thirdArtistList.length) picNum = thirdArtistList.length

            // 获取随机数
            const sjNum = await this.getRandomNumAndNoRepeat(picNum, thirdArtistList.length)    // 返回数组
            console.log(`随机数组为：${sjNum.join(',')}`);


            // 判断文件类型 以合适的发送方式保存到数组中
            await sjNum.forEach(item => {
                // 如果是视频文件
                if (thirdArtistList[item].match(/.[^.]+$/)[0] === '.mp4' || thirdArtistList[item].match(/.[^.]+$/)[0] === '.MP4') {
                    resendMediaList.push(segment.video(thirdDir + '/' + thirdArtistList[item]));
                }
                //如果是图片文件
                if (thirdArtistList[item].match(/.[^.]+$/)[0] === '.png' || thirdArtistList[item].match(/.[^.]+$/)[0] === '.jpg' || thirdArtistList[item].match(/.[^.]+$/)[0] === '.gif') {
                    resendMediaList.push(segment.image(thirdDir + '/' + thirdArtistList[item]));
                }
            })

            // 准备以转发形式发送
            const forwardMsg = []
            await resendMediaList.forEach(item => {
                forwardMsg.push({
                    message: item,
                    nickname: e.sender.card || e.sender.nickname,
                    user_id: e.sender.user_id
                })
            })
            await forwardMsg.unshift({
                message: `写真来源：${secondArtistList[secondRadom]}`,
                nickname: e.sender.card || e.sender.nickname,
                user_id: e.sender.user_id
            })

            let howToSend = e.isGroup ? await e.group.makeForwardMsg(forwardMsg) : await e.friend.makeForwardMsg(forwardMsg)

            const resMsg = await e.reply(howToSend)
            console.log(!resMsg);

            if (!resMsg) throw ({ msg: `草！司马QQ给我把图吞了,完全力不起来直接羊尾！`, type: `QQ风控` })
            return await Chehui(resMsg, e, dirXz.xieZhenData.timer)
        } catch (err) {
            returnErr(e, err)
        }
    }
}

