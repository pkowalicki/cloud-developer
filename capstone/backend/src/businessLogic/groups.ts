import * as uuid from 'uuid'

import { Group } from '../models/Group'
import { GroupAccess } from '../dataLayer/groupsAccess'
import { CreateGroupRequest } from '../requests/CreateGroupRequest'
import { createLogger } from '../utils/logger'
import { UpdateGroupRequest } from '../requests/UpdateGroupRequest'
import { GroupUpdate } from '../models/GroupUpdate'

const groupAccess = new GroupAccess()
const logger = createLogger('business-layer-groups')

export async function getAllGroups(user: string): Promise<Group[]> {
  logger.info(`Getting groups for user ${user}`, {})
  return groupAccess.getAllGroups(user)
}

export async function createGroup(newGroup: CreateGroupRequest, user: string): Promise<Group> {

  const itemId = uuid.v4()

  return await groupAccess.createGroup({
    id: itemId,
    userId: user,
    name: newGroup.name,
    description: newGroup.description,
    public: newGroup.public,
    createdAt: new Date().toISOString()
  })
}

export async function groupExists(id: string): Promise<boolean> {
  return groupAccess.findGroup(id) ? true : false
}

export async function updateGroup(user: string, groupId: string, updateRequest: UpdateGroupRequest): Promise<boolean> {
  // TODO  send notifications for connected clients if public changes to true
  return await groupAccess.updateGroup(user,groupId,updateRequest as GroupUpdate)
}
