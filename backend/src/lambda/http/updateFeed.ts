import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateFeed } from '../../businessLogic/feedServices'
import { UpdateFeedRequest } from '../../requests/UpdateFeedRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const feedId = event.pathParameters.feedId
    const updatedFeed: UpdateFeedRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedFeed" object
    await updateFeed(updatedFeed, feedId, getUserId(event))
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
