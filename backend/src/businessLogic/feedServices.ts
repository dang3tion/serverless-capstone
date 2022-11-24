import * as uuid from 'uuid'
import { FeedsAccess } from '../dataLayer/feedsAcess'
import { FeedItem } from '../models/FeedItem'
import { FeedUpdate } from '../models/FeedUpdate'
import { CreateFeedRequest } from '../requests/CreateFeedRequest'
import { SearchFeedRequest } from '../requests/SearchFeedRequest'
import { UpdateFeedRequest } from '../requests/UpdateFeedRequest'

// Feed: Implement businessLogic
const feedsAcess: FeedsAccess = new FeedsAccess()

export async function createFeed(
  createFeedReq: CreateFeedRequest,
  userId: string
): Promise<FeedItem> {
  const feedId = uuid.v4()
  const FeedItem: FeedItem = {
    userId: userId,
    feedId: feedId,
    createdAt: new Date().toDateString(),
    itemName: createFeedReq.itemName,
    dueDate: createFeedReq.dueDate,
    done: false
  }
  return feedsAcess.save(FeedItem)
}

export async function deleteFeed(
  feedId: string,
  userId: string
): Promise<void> {
  await feedsAcess.delete(feedId, userId)
}

export async function getFeedsForUser(userId: string): Promise<FeedItem[]> {
  return feedsAcess.findByUserId(userId)
}

export async function findByFeedName(
  userId: string,
  searchFeedRequest: SearchFeedRequest
): Promise<FeedItem[]> {
  return feedsAcess.findByFeedName(userId, searchFeedRequest.itemName)
}
export async function updateFeed(
  updateFeedReq: UpdateFeedRequest,
  feedId: string,
  userId: string
) {
  const updateFeed: FeedUpdate = {
    itemName: updateFeedReq.itemName,
    dueDate: updateFeedReq.dueDate,
    done: updateFeedReq.done
  }
  return feedsAcess.update(feedId, userId, updateFeed)
}
