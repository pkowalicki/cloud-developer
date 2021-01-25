import { S3EventRecord, SNSEvent, SNSHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
//import * as Jimp from 'jimp'
import Jimp from 'jimp/es'

const s3 = new AWS.S3()

const imagesBucketName = process.env.IMAGES_S3_BUCKET
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event ', JSON.stringify(event))
    
    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message

        console.log('Processing S3 event', s3EventStr)
        const s3Event = JSON.parse(s3EventStr)

        for (const record of s3Event.Records) {
        // "record" is an instance of S3EventRecord
        await processImage(record) // A function that should resize each image
    }
  }
}

async function processImage(imageS3Record: S3EventRecord) {
    console.log('Getting original image from S3 ...');
    const key = imageS3Record.s3.object.key;
    const imageObject = await s3.getObject({
        Bucket : imagesBucketName,
        Key : key
    }).promise();

    console.log('Resizing to thumbnail ...');
    const imageBytes= imageObject.Body;
    console.log('Buffer OK');
    Jimp.read(imageBytes).then((image: Jimp) => {
        console.log('Jimp read');
        image.resize(150, Jimp.AUTO);
        console.log('image resized');
        image.getBufferAsync(Jimp.MIME_JPEG).then((convertedBuffer) => {
            console.log('Storing thumbnail ...');
            s3.putObject({
                Bucket: thumbnailBucketName,
                Key: `${key}.jpeg`,
                Body: convertedBuffer
            }).promise().then((result) => {
                console.log(result);
                console.log("Image with id `${key}` converted to thumbnail successfully.");
                });
            });
        })
}
