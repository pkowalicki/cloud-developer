import * as React from 'react'
import { Card } from 'semantic-ui-react'
import { GroupModel } from '../types/GroupModel'
import { Link } from 'react-router-dom'
import Auth from '../auth/Auth'

interface GroupCardProps {
  group: GroupModel
  auth: Auth
}

interface GroupCardState {
}

export class Group extends React.PureComponent<GroupCardProps, GroupCardState> {

  render() {
    let publicInfo

    if (this.props.group.public)
      publicInfo = 'Public'
    else
      publicInfo = 'Private'

    let ownershipInfo

    if (this.props.group.userId == this.props.auth.parseUserId())
      ownershipInfo = 'Mine'
    else
      ownershipInfo = 'Others'

    return (
      <Card>
        <Card.Content>
          <Card.Header>
            <Link to={`/images/${this.props.group.id}`}>{this.props.group.name} ({publicInfo}) ({ownershipInfo})</Link>
          </Card.Header>
          <Card.Description>{this.props.group.description}</Card.Description>
        </Card.Content>
      </Card>
    )
  }
}
