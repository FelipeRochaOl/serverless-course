'use strict';
//const { promises: { readFile } } = require('fs')
const axios =  require('axios')
class Handler {
  constructor({ rekoSvs, translateSvs }) {
    this.rekoSvs = rekoSvs,
    this.translateSvs = translateSvs
  }
  async detecteImageProperties(buffer) {
    const { Labels } = await this.rekoSvs.detectLabels({
      Image: {
        Bytes: buffer
      }
    }).promise()
    const workingItems = Labels.filter(({ Confidence }) => Confidence > 80)
    const names = workingItems.map(({ Name }) => Name).join(' and ')

    return { names, workingItems }
  }
  formatTextResults(texts, workingItems) {
    const finalText = []
    for (const indexText in texts) {
       const nameInPortuguese = texts[indexText]
       const { Confidence } = workingItems[indexText]
       finalText.push(
         `${ Confidence.toFixed(0) }% de ser um ${ nameInPortuguese }`
       )
    }
    return finalText.join('\n')
  }
  async getImageBuffer(imageUrl) {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    })
    const buffer = Buffer.from(response.data, 'base64')
    return buffer
  }
  async translateText(text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }
    const { TranslatedText } = await this.translateSvs
                            .translateText(params)
                            .promise()
    return TranslatedText.split(' e ')
  }
  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters
      console.info('Download images buffer...')
      // const imgBuffer = await readFile('./images/cat.jpeg')
      const imgBuffer = await this.getImageBuffer(imageUrl)
      console.info('Detected labels...')
      const { names, workingItems} = await this.detecteImageProperties(imgBuffer)

      console.info('Translating to Portuguese...')
      const texts = await this.translateText(names)

      console.info('Handling final object...')
      const finalText = this.formatTextResults(texts, workingItems)
      console.info('Finishing...')

      return {
        statusCode: 200,
        body: 'A imagem tem\n\n '.concat(finalText)
      }
    } catch (error) {
      console.error('Error: ', error)
      return {
        statusCode: 500,
        body: error.message
      }
    }
  }
}

//factore
const aws = require('aws-sdk');
const reko = new aws.Rekognition()
const translate = new aws.Translate()
const handler = new Handler({
  rekoSvs: reko,
  translateSvs: translate
})

module.exports.main = handler.main.bind(handler)