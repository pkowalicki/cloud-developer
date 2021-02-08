import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { dynamoDB, ses } from './awsClients'

const logger = createLogger('data-layer-emails-access')

export class EmailsAccess {

    constructor(
        private readonly sesClient: AWS.SES = ses,
        private readonly docClient: DocumentClient = dynamoDB,
        private readonly sourceEmail = process.env.EMAIL,
        private readonly emailsTable = process.env.EMAILS_TABLE) {
    }

    async sendEmailToAll(subject: string, bodyText: string): Promise<void> {
        const emailsResponse = await this.sesClient.listVerifiedEmailAddresses().promise()
        const registeredEmails = emailsResponse.VerifiedEmailAddresses
    
        const messageParams = {
            Destination: {
                ToAddresses: registeredEmails
            },
            Message: {
                Body: {
                    Text : { Data: bodyText }
                },
                Subject: { Data: subject }
            },
            Source: this.sourceEmail
        }
    
        logger.info(`Sending emails to ${registeredEmails.length} recipients`, {receipients: registeredEmails})
        await this.sesClient.sendEmail(messageParams).promise()
    }

    async registerEmail(email: string, user: string): Promise<void> {
        logger.info(`Registering email ${email}`)
        await this.sesClient.verifyEmailIdentity({EmailAddress : email}).promise()
        await this.saveNewUserEmail(email, user)
    }

    async deregisterEmail(user: string): Promise<void> {
        logger.info(`Deregistering email for user ${user}`)
        const email = await this.getEmail(user)
        await this.sesClient.deleteIdentity({
            Identity: email
        }).promise()

        await this.deleteUserEmail(user)
    }

    async getEmail(user: string): Promise<string> {
        logger.info(`Fetching email for user ${user}`)

        const item = await this.docClient.query({
            TableName: this.emailsTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId' : user
            }
        }).promise()

        if (item.Count !== 0){
            const email = item.Items[0].email
            logger.info(`Found registered email ${email} for user ${user}`)

            return email
        }

        logger.info(`No registered email found for user ${user}`)

        return undefined
    }

    private async saveNewUserEmail(email: string, user: string) {
        await this.docClient.put({
            TableName: this.emailsTable,
            Item: {
                userId: user,
                email: email
            }
        }).promise()
    }

    private async deleteUserEmail(user: string) {
        await this.docClient.delete({
            TableName: this.emailsTable,
            Key: {
                userId: user
            }
        }).promise()
    }
} // end of emails access class

