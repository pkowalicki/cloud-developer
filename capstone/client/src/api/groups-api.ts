import { GroupModel } from '../types/GroupModel'
import { apiEndpoint } from '../config'
import { GroupUploadInfo } from '../types/GroupUploadInfo'
import Axios from 'axios'

export async function getGroups(): Promise<GroupModel[]> {
  console.log('Fetching groups')

  const response = await fetch(`${apiEndpoint}/groups`)
  const result = await response.json()

  return result.items
}

export async function getGroupsAuth(idToken: string): Promise<GroupModel[]> {
  console.log('Fetching groups')

  const response = await Axios.get(`${apiEndpoint}/groups`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Groups:', response.data)

  return response.data.items
}

export async function createGroup(
  idToken: string,
  newGroup: GroupUploadInfo
): Promise<GroupModel> {
  const reply = await fetch(`${apiEndpoint}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({
      name: newGroup.name,
      description: newGroup.description,
      public: newGroup.public
    })
  })
  const result = await reply.json()
  
  return result.newItem
}

export async function getGroup(idToken: string, groupId: string): Promise<GroupModel> {
  const response = await Axios.get(`${apiEndpoint}/groups/${groupId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Group fetched:', response.data)

  return response.data
}

export async function updateGroup(idToken: string, groupId: string, newGroup: GroupUploadInfo): Promise<void> {
  const response = await Axios.put(`${apiEndpoint}/groups/${groupId}`, newGroup, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Group updated')
}

export async function deleteGroup(idToken: string, groupId: string): Promise<void> {
  const response = await Axios.delete(`${apiEndpoint}/groups/${groupId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Group deleted') 
}
