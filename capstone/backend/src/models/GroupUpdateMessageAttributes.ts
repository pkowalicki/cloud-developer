import { SNS } from "aws-sdk";

export interface GroupUpdateMessageAttributes {
    groupId: SNS.MessageAttributeValue,
    groupName: SNS.MessageAttributeValue,
    userId: SNS.MessageAttributeValue,
    public: SNS.MessageAttributeValue
}