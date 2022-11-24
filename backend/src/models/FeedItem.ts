export interface FeedItem {
  userId: string
  feedId: string
  createdAt: string
  itemName: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
