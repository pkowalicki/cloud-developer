import * as React from 'react'
import { Form, Button, Checkbox } from 'semantic-ui-react'
import { createGroup } from '../api/groups-api'
import Auth from '../auth/Auth'

interface CreateGroupProps {
  auth: Auth
}

interface CreateGroupState {
  name: string
  description: string
  public: boolean
  uploadingGroup: boolean
}

export class CreateGroup extends React.PureComponent<
  CreateGroupProps,
  CreateGroupState
> {
  state: CreateGroupState = {
    name: '',
    description: '',
    public: false,
    uploadingGroup: false
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

      this.setUploadState(true)
      const group = await createGroup(this.props.auth.getIdToken(), {
        name: this.state.name,
        description: this.state.description,
        public: this.state.public ? 1 : 0
      })

      console.log('Created description', group)

      alert('Group was created! Go to Home page.')
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
        <h1>Upload new group</h1>

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
        Create
      </Button>
    )
  }
}
