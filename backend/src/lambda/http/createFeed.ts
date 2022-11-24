import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateFeedRequest } from '../../requests/CreateFeedRequest'
import { getUserId } from '../utils'
import { createFeed } from '../../businessLogic/feedServices'
import { FeedItem } from '../../models/FeedItem'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newFeed: CreateFeedRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    const saveFeed: FeedItem = await createFeed(newFeed, getUserId(event))
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 201,
      body: JSON.stringify({
        item: saveFeed
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
