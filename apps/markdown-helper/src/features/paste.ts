import * as path from 'path'
import * as fs from 'fs'
import * as vscode from 'vscode'
import * as crypto from 'crypto'
// import * as sharp from 'sharp'

import { getTmpFolder, getClipboardContext, getCurrentRoot, edit } from '../utils'

export const paste = async () => {
  try {
    const images = await getClipboardImages()
    // const a = await getMetadata(images)
    // console.log(a)
    const localImages = moveImagesToLocal(images)
    editMarkdownFile(localImages)
  } catch (err) {
    console.log(err)
  }
}

const getClipboardImages = async () => {
  let savePath = getTmpFolder()
  savePath = path.join(savePath, `pic_${new Date().getTime()}.png`)
  let images = await getClipboardContext(savePath)
  images = images.filter(img => ['.jpg', '.jpeg', '.gif', '.bmp', '.png', '.webp', '.svg'].find(ext => img.endsWith(ext)))

  if (!images.length) {
    const msg = '无法获取到剪切板中的图片信息，请先复制图片'
    vscode.window.showErrorMessage(msg)
    throw new Error(msg)
  }
  return images
}

// const getMetadata = async (images: string[]) => {
//   const imagesSharp = images.map(async image => {
//     const imageSharp = sharp(image)
//     const { width, height } = await imageSharp.metadata()
//     return {
//       width,
//       height,
//       image: imageSharp
//     }
//   })
//   return imagesSharp
// }

const moveImagesToLocal = (images: string[]) => {
  const md5 = crypto.createHash('md5')
  const rootPath = getCurrentRoot()
  const imgLocalPath = vscode.workspace.getConfiguration('markdownHelper').get<string>('imgLocalPath') || ''
  return images.map(image => {
    const hash = md5.update(fs.readFileSync(image)).digest('base64')
    const fileName = hash + path.extname(image)
    const localUrl = path.resolve(rootPath, imgLocalPath, fileName)
    const localFolder = path.dirname(localUrl)
    if (!fs.existsSync(localFolder)) {
      fs.mkdirSync(localFolder)
    }
    fs.copyFileSync(image, localUrl)
    return fileName
  })
}

const editMarkdownFile = async (images: string[]) => {
  const imgLocalPath = vscode.workspace.getConfiguration('markdownHelper').get<string>('imgHostPath') || ''
  const insertSrc = images.reduce((prev, current) => `${prev}![图片](${path.resolve(imgLocalPath, current)})\n`, '')
  return edit(insertSrc)
}