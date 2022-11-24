import { FeedsAccess } from '../dataLayer/feedsAcess'

const todosAcess: FeedsAccess = new FeedsAccess()
const s3_bucket = process.env.ATTACHMENT_S3_BUCKET
const AWS_REGION = process.env.AWS_REGION
export async function updatePresignedUrlForFeedItem(
  userId: string,
  feedId: string
) {
  const FeedItem = await todosAcess.getFeedByIdForUser(userId, feedId)
  const attachmentUrl = await createAttachmentUrl(feedId)
  return await todosAcess.updatePresignedUrlForfeedItem(
    {
      itemName: FeedItem.itemName,
      dueDate: FeedItem.dueDate,
      done: FeedItem.done,
      attachmentUrl: attachmentUrl
    },
    userId,
    feedId
  )
}

export async function createAttachmentUrl(
  attachmentId: string
): Promise<string> {
  return `https://${s3_bucket}.s3.${AWS_REGION}.amazonaws.com/${attachmentId}`
}
