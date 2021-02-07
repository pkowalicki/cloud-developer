import * as React from 'react'
import { Form, Button, Checkbox } from 'semantic-ui-react'
import { updateGroup, getGroup } from '../api/groups-api'
import Auth from '../auth/Auth'
import { GroupModel } from '../types/GroupModel'
import { GroupUploadInfo } from '../types/GroupUploadInfo'

interface UpdateGroupProps {
  auth: Auth,
  groupId: string
}

interface UpdateGroupState {
  name: string
  description: string
  public: boolean
  uploadingGroup: boolean
}

export class UpdateGroup extends React.PureComponent<
  UpdateGroupProps,
  UpdateGroupState
> {
  state: UpdateGroupState = {
    name: '',
    description: '',
    public: false,
    uploadingGroup: false
  }

  async componentDidMount() {
    try {
        const group: GroupModel = await getGroup(this.props.auth.getIdToken(), this.props.groupId)
        this.setState({
            ...group,
            public: group.public ? true : false,
            uploadingGroup: false
        })
      } catch (e) {
        alert(`Failed to fetch group : ${e.message}`)
      }
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ description: event.target.value })
  }

  handlePublicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({public: !this.state.public})
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.name || !this.state.description) {
        alert('Name and description should be provided')
        return
      }

      const groupUpdate: GroupUploadInfo = {
        name: this.state.name,
        description: this.state.description,
        public: this.state.public ? 1 : 0
      }

      this.setUploadState(true)
      await updateGroup(this.props.auth.getIdToken(), this.props.groupId, groupUpdate)
      console.log('Updated group')
      alert('Group was updated!')

    } catch (e) {
      alert('Could not upload an image: ' + e.message)
      
    } finally {
      this.setUploadState(false)
    }
  }

  setUploadState(uploadingGroup: boolean) {
    this.setState({
      uploadingGroup
    })
  }

  render() {
    return (
      <div>
        <h3>Group belongs to you. You can upload images and update group.</h3>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Name</label>
            <input
              placeholder="Group name"
              value={this.state.name}
              onChange={this.handleNameChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <input
              placeholder="Group description"
              value={this.state.description}
              onChange={this.handleDescriptionChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Public</label>
            <input 
              type="checkbox"
              onChange={this.handlePublicChange}
              checked={this.state.public}
            />
          </Form.Field>
          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {
    return (
      <Button loading={this.state.uploadingGroup} type="submit">
        Update
      </Button>
    )
  }
}
