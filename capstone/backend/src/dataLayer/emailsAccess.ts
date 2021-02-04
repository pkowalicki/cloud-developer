import { createLogger } from '../utils/logger'
import { ses } from './awsClients'

const logger = createLogger('data-layer-emails-access')

export class EmailsAccess {

    constructor(
        private readonly sesClient: AWS.SES = ses,
        private readonly sourceEmail = process.env.EMAIL) {
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

    async registerEmail(email: string): Promise<void> {
        logger.info(`Registering email ${email}`)
        await this.sesClient.verifyEmailIdentity({EmailAddress : email}).promise()
    }
} // end of emails access class

