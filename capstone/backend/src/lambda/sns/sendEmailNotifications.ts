import { SNSHandler, SNSEvent } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { EmailsAccess } from '../../dataLayer/emailsAccess'

const logger = createLogger('lambda-send-email-notifications')
const emailAccess = new EmailsAccess()

export const handler: SNSHandler = async (event: SNSEvent) => {
  logger.info(`Processing notification event`, { ...event })

  for (const snsRecord of event.Records) {
    const messageAttributes = snsRecord.Sns.MessageAttributes
    const subject = `Group ${messageAttributes.groupName.Value} made public`
    const body = `Group ${messageAttributes.groupName.Value} was made public. Enjoy images!`
    await emailAccess.sendEmailToAll(subject,body)
  }
}
