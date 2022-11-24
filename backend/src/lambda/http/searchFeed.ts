import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { findByFeedName } from '../../businessLogic/feedServices'
import { getUserId } from '../utils'
import { SearchFeedRequest } from '../../requests/SearchFeedRequest'
import { FeedItem } from '../../models/FeedItem'

// TODO: Search todo item by name
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const name: SearchFeedRequest = JSON.parse(event.body)

    const result: FeedItem[] = await findByFeedName(getUserId(event), name)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: result
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
