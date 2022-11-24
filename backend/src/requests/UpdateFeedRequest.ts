/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateFeedRequest {
  itemName: string
  dueDate: string
  done: boolean
}
