import fs from 'fs'

// 遍历目录 获取目录下的所有元素并发送出去
const queryList = async function (url) {
    const fatherContents = fs.readdirSync(url, 'utf8');
    // console.log(fatherContents);
    return fatherContents
}

export {
    queryList,
}