import YAML from "yaml"
import fs from 'fs'
import { returnErr } from '../tools/check.js'

// 读取yaml文件
const readYAML = async function (dir, encode) {
    try {
        const yamlFile = encode ? await fs.readFileSync(dir, encode) : await fs.readFileSync(dir)
        return YAML.parse(yamlFile)
    } catch (error) {
        return error
    }
}

export {
    readYAML,
}