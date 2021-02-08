import Axios from "axios"
import { apiEndpoint } from '../config'


export async function getEmail(idToken: string): Promise<string> {
    console.log('Fetching user registered email')

    const response = await Axios.get(`${apiEndpoint}/emails`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
    })

    if (response.status == 204)
        return ''

    return response.data.email
}

export async function registerEmail(idToken: string, email: string): Promise<void> {
    console.log('Registering user email')

    const response = await Axios.post(`${apiEndpoint}/emails`, {email}, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        }
    })
}

export async function deregisterEmail(idToken: string): Promise<void> {
    console.log('Deregistering email')

    await Axios.delete(`${apiEndpoint}/emails`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        }
    })
}