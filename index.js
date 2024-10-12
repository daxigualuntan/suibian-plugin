import fs from 'fs'
import chalk from 'chalk'
const files = fs.readdirSync('./plugins/suibian-plugin/apps').filter(file => file.endsWith('.js'))

let ret = []

logger.info(chalk.rgb(253, 235, 255)('----(￣▽￣)随随便便----'))
logger.info(chalk.rgb(255, 207, 247)(`随便插件初始化~`))
logger.info(chalk.rgb(253, 235, 255)('-------------------------'))

files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

console.log(files);

let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status != 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}

export { apps }
