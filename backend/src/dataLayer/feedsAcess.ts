import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { FeedItem } from '../models/FeedItem'
import { FeedUpdate } from '../models/FeedUpdate'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('FeedsAccess')

export class FeedsAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly feedsTable = process.env.FEEDS_TABLE,
    private readonly feedIndex = process.env.USER_DUEDATE_IDX
  ) {}

  async save(saveFeed: FeedItem): Promise<FeedItem> {
    await this.docClient
      .put({
        TableName: this.feedsTable,
        Item: saveFeed
      })
      .promise()
    logger.info('new feed has been created, feed id = ', saveFeed.feedId)
    return saveFeed
  }
  async delete(feedId: string, userId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.feedsTable,
        Key: { userId, feedId }
      })
      .promise()
    logger.info('deleted feed, feed id = ', feedId)
  }

  async findByUserId(userId: string): Promise<FeedItem[]> {
    const query = await this.docClient
      .query({
        TableName: this.feedsTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()
    logger.info('find by user id = ', userId)
    return query.Items as FeedItem[]
  }

  async update(
    feedId: string,
    userId: string,
    updateFeed: FeedUpdate
  ): Promise<void> {
    await this.docClient
      .update({
        TableName: this.feedsTable,
        Key: { userId, feedId },
        ConditionExpression: 'attribute_exists(feedId)',
        UpdateExpression:
          'set itemName = :itemName, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':itemName': updateFeed.itemName,
          ':dueDate': updateFeed.dueDate,
          ':done': updateFeed.done
        }
      })
      .promise()
    logger.info('updated feed id = ', feedId)
  }
  async getFeedByIdForUser(userId: string, feedId: string): Promise<FeedItem> {
    logger.info(`Getting feed item with id ${feedId} for user ${userId}.`)

    const result = await this.docClient
      .query({
        TableName: this.feedsTable,
        KeyConditionExpression: 'userId = :userId AND feedId = :feedId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':feedId': feedId
        }
      })
      .promise()

    logger.info(`Get feed item with id ${feedId} for user ${userId} success.`)

    const items = result.Items
    return items[0] as FeedItem
  }

  async updatePresignedUrlForfeedItem(
    feedItem: FeedUpdate,
    userId: string,
    feedId: string
  ) {
    const currentfeedItem = this.getFeedByIdForUser(userId, feedId)

    if (!currentfeedItem) {
      logger.error(`Not found feed item with id ${feedId} for user ${userId}.`)
      throw new Error(`Feed item not found with id ${feedId}`)
    }

    logger.info(
      `Updating attachmentUrl of feed item with id ${feedId} for user ${userId}.`
    )

    await this.docClient
      .update({
        TableName: this.feedsTable,
        Key: {
          userId: userId,
          feedId: feedId
        },
        UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': feedItem.attachmentUrl
        }
      })
      .promise()

    logger.info(
      `Update attachmentUrl of feed item with id ${feedId} for user ${userId} success.`
    )
  }
  async findByFeedName(userId: string, name: string): Promise<FeedItem[]> {
    logger.info(`search feed for ${userId} by name ${name}`)

    logger.info('Getting all feeds for userId:', userId)

    const result = await this.docClient
      .query({
        TableName: this.feedsTable,
        IndexName: this.feedIndex,
        FilterExpression: 'itemName = :itemName',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':itemName': name
        }
      })
      .promise()

    logger.info('Data query:', result.Items)

    const items = result.Items
    return items as FeedItem[]
  }
}

function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}
