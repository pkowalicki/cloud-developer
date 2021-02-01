import * as uuid from 'uuid'

import { Group } from '../models/Group'
import { GroupAccess } from '../dataLayer/groupsAccess'
import { CreateGroupRequest } from '../requests/CreateGroupRequest'

const groupAccess = new GroupAccess()

export async function getAllGroups(user: string): Promise<Group[]> {
  return groupAccess.getAllGroups(user)
}

export async function createGroup(newGroup: CreateGroupRequest, user: string): Promise<Group> {

  const itemId = uuid.v4()

  return await groupAccess.createGroup({
    id: itemId,
    userId: user,
    name: newGroup.name,
    description: newGroup.description,
    createdAt: new Date().toISOString()
  })
}

export async function groupExists(id: string): Promise<boolean> {
  return groupAccess.findGroup(id) ? true : false
}
