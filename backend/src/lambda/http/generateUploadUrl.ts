import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'

import { getUserId } from '../utils'
import { updatePresignedUrlForFeedItem } from '../../businessLogic/attachmentUtils'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  accessKeyId: process.env.AWS_KEY,
  ecretAccessKey: process.env.AWS_SECRET_KEY,
  signatureVersion: 'v4'
})
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const feedId: string = event.pathParameters.feedId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId: string = getUserId(event)
    const presignedURL: string = s3.getSignedUrl('putObject', {
      Bucket: process.env.ATTACHMENT_S3_BUCKET,
      Key: feedId,
      Expires: parseInt(process.env.SIGNED_URL_EXPIRATION)
    })
    await updatePresignedUrlForFeedItem(userId, feedId)
    return {
      headers: {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
      },
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: presignedURL
      })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
