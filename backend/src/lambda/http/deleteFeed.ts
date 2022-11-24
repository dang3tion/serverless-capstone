import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteFeed } from '../../businessLogic/feedServices'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const feedId: string = event.pathParameters.feedId
    const userId: string = getUserId(event)
    // TODO: Remove a TODO item by id
    await deleteFeed(feedId, userId)
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 204,
      body: null
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
