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

export function isMyGroup(user: string, group: Group): boolean {
  return group.userId === user
}

export function canSeeImages(user: string, group: Group): boolean {
  return (group.userId === user) || group.public === 1
}

export async function updateGroup(user: string, groupId: string, updateRequest: UpdateGroupRequest): Promise<boolean> {
  return await groupAccess.updateGroup(user,groupId,updateRequest as GroupUpdate)
}

export async function getGroup(group: string): Promise<Group> {
  return groupAccess.findGroup(group)
}

export async function deleteGroup(group: string, user: string): Promise<void> {
  await groupAccess.deleteGroup(group, user)
}
