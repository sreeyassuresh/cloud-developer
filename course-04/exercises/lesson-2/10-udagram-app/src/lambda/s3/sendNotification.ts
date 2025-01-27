import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda'
 //import { S3Handler, S3Event } from 'aws-lambda'
 import 'source-map-support/register'

     
import * as AWS  from 'aws-sdk'

import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE
const stage = process.env.STAGE
const apiId = process.env.API_ID

const connectionParams = {
  apiVersion: "2018-11-29",
  endpoint: `${apiId}.execute-api.us-east-1.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

// export const handler: S3Handler = async(event: S3Event) => {
//     for (const record of event.Records) {
//         const key = record.s3.object.key
//          console.log('Processing S3 item with key: ', key)
     

//      const connections = await docClient.scan({
//                 TableName: connectionsTable
//              }).promise()

//              const payload = {
//                         imageId: key
//                     }
                
//                     for (const connection of connections.Items) {
//                         const connectionId = connection.id
//                         await sendMessageToClient(connectionId, payload)
//                     } 

//     }                       
// }

export const handler: SNSHandler = async (event: SNSEvent) => {
  console.log('Processing SNS event ', JSON.stringify(event))
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    console.log('Processing S3 event', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)

    await processS3Event(s3Event)
  }

}

async function processS3Event(s3Event: S3Event) {
  for (const record of s3Event.Records) {
    const key = record.s3.object.key
    console.log('Processing S3 item with key: ', key)

    const connections = await docClient.scan({
        TableName: connectionsTable
    }).promise()

    const payload = {
        imageId: key
    }

    for (const connection of connections.Items) {
        const connectionId = connection.id
        await sendMessageToClient(connectionId, payload)
    }
  }
}

async function sendMessageToClient(connectionId, payload) {
  try {
    console.log('Sending message to a connection', connectionId)

    await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(payload),
    }).promise()

  } catch (e) {
    console.log('Failed to send message', JSON.stringify(e))
    if (e.statusCode === 410) {
      console.log('Stale connection')

      await docClient.delete({
        TableName: connectionsTable,
        Key: {
          id: connectionId
        }
      }).promise()

    }
  }
}