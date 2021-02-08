import * as React from 'react'
import { Form, Button, ButtonProps } from 'semantic-ui-react'
import { deregisterEmail, getEmail, registerEmail } from '../api/emails-api'
import Auth from '../auth/Auth'

interface EmailRegistrationProps {
    auth: Auth
}

interface EmailRegistrationState {
    email: string
    registeringEmail: boolean
    firstRegistration: boolean
}

export class EmailRegistration extends React.PureComponent<
    EmailRegistrationProps,
    EmailRegistrationState
    > {
    state: EmailRegistrationState = {
        email: '',
        registeringEmail: false,
        firstRegistration: true
    }

    async componentDidMount() {
        const email = await getEmail(this.props.auth.getIdToken())
        this.setState({ email })

        if (email !== '')
            this.setFirstRegistrationState(false)
    }

    handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ email: event.target.value })
    }

    handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault()

        try {
            this.setRegisteringState(true)
            await registerEmail(this.props.auth.getIdToken(), this.state.email)
            console.log('Email registered')
            alert('Verification email sent! Check your inbox to finish registration.')
            this.setFirstRegistrationState(false)
        } catch (e) {
            alert('Could not register email: ' + e.message)

        } finally {
            this.setRegisteringState(false)
        }
    }

    handleDeregister = async (event: React.MouseEvent<HTMLButtonElement>, data: ButtonProps) => {
        event.preventDefault()

        try {
            this.setRegisteringState(true)
            await deregisterEmail(this.props.auth.getIdToken())
            console.log('Email deregistered')
            alert('Email deregistered.')
            this.setState({email : ''})
            this.setFirstRegistrationState(true)

        } catch (e) {
            alert('Could not deregister email')

        } finally {
            this.setRegisteringState(false)
        }
    }

    setRegisteringState(registeringEmail: boolean) {
        this.setState({
            registeringEmail: registeringEmail
        })
    }

    setFirstRegistrationState(firstRegistration: boolean) {
        this.setState({ firstRegistration })
    }

    render() {
        return (
            <div>
                <h1>Register email for notifications</h1>

                <Form onSubmit={this.handleSubmit}>
                    <Form.Field>
                        <label>Email</label>
                        <input
                            placeholder="Email for notifications"
                            value={this.state.email}
                            onChange={this.handleEmailChange}
                        />
                    </Form.Field>
                    {this.renderButtons()}
                </Form>
            </div>
        )
    }

    renderButtons() {
        if (this.state.firstRegistration) {
            return (
                <Button loading={this.state.registeringEmail} type="submit">
                    Register
                </Button>
            )
        } else {
            return (
                <>
                    <Button loading={this.state.registeringEmail} type="submit">
                        Update
                    </Button>
                    <Button onClick={this.handleDeregister} loading={this.state.registeringEmail} type="button">
                        Deregister
                    </Button>
                </>
            )
        }
    }
}
