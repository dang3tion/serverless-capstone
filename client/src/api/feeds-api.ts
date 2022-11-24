import { apiEndpoint } from '../config'
import { Feed } from '../types/Feed'
import { CreateFeedRequest } from '../types/CreateFeedRequest'
import Axios from 'axios'
import { UpdateFeedRequest } from '../types/UpdateFeedRequest'

export async function getFeeds(idToken: string): Promise<Feed[]> {
  console.log('Fetching feeds')

  const response = await Axios.get(`${apiEndpoint}/feeds`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
  console.log('Feeds:', response.data)
  return response.data.items
}

export async function searchFeed(
  idToken: string,
  value: string
): Promise<Feed[]> {
  const response = await Axios.post(
    `${apiEndpoint}/feeds/search`,
    { itemName: value },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  console.log(response.data.items)
  return response.data.items
}

export async function createFeed(
  idToken: string,
  newFeed: CreateFeedRequest
): Promise<Feed> {
  const response = await Axios.post(
    `${apiEndpoint}/feeds`,
    JSON.stringify(newFeed),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.item
}

export async function patchFeed(
  idToken: string,
  feedId: string,
  updatedFeed: UpdateFeedRequest
): Promise<void> {
  await Axios.patch(
    `${apiEndpoint}/feeds/${feedId}`,
    JSON.stringify(updatedFeed),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
}

export async function deleteFeed(
  idToken: string,
  feedId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/feeds/${feedId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  feedId: string
): Promise<string> {
  const response = await Axios.post(
    `${apiEndpoint}/feeds/${feedId}/attachment`,
    '',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.uploadUrl
}

export async function uploadFile(
  uploadUrl: string,
  file: Buffer
): Promise<void> {
  await Axios.put(uploadUrl, file)
}
