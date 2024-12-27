import { parse } from 'yaml';

const yamlContent = `
key1: value1
key2:
  - value2a
  - value2b

service:
  name: notification
  port: 3000

log:
  level: ["log", "error", "warn", "debug", "verbose"]

grpc:
  options:
    maxReceiveMessageLength: 100000000 # 100Mb

store:
  mongo:
    clientUrl: mongodb://root:123456Aa@10.10.15.37:27017
    dbName: notification

cache:
  store:
    nodes:
      - host: 10.10.15.37
        port: 7001
      - host: 10.10.15.37
        port: 7002

grpcClients:
  - name: SUBSCRIPTION_REPO
    transport: 4 #Transport.GRPC
    options:
      url: "0.0.0.0:4130"
      package: "halome.internal.subscription.v3.services"
      protoPath:
        - "@halomeapis/halome-proto-files/halome/internal/subscription/v3/services/subscription.proto"
  - name: USER_PROFILE_REPO
    transport: 4 #Transport.GRPC
    options:
      url: "0.0.0.0:4100"
      package: "halome.internal.user.v3.services"
      protoPath:
        - "@halomeapis/halome-proto-files/halome/internal/user/v3/services/data_user_profile.proto"
  - name: CHANNEL_REPO
    transport: 4 #Transport.GRPC
    options:
      url: "0.0.0.0:4900"
      package: "halome.internal.channel.v3.services"
      protoPath:
        - "@halomeapis/halome-proto-files/halome/internal/channel/v3/services/data_channel.proto"

kafka:
  enabled: true
  outgoingStreamId: notification
  subscriptions:
    - websocket
    - commands-message.notifications
    - commands-chat.notifications
    - commands-iam.notifications
    - call-service.notifications
  transport:
    type: "KAFKA"
    options:
      client:
        clientId: "notification"
        brokers: ["10.10.15.36:9092"]
      consumer:
        groupId: "local-notification-consumers"
        retry:
          maxRetryTime: 10
        allowAutoTopicCreation: false
      producer:
        allowAutoTopicCreation: false
      topic:
        numPartitions: 16

notificationOption:
  sound: "default"
  offlineTimeAfterLastPing: 5 #seconds
  outdatedSecond: 15
  deleteAfterDays: 10

apns:
  bundleId: com.ziichat.ios.media.beta
  options:
    token:
      key: |
        -----BEGIN PRIVATE KEY-----
        MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgQNcnQHuEfhaKD/jT
        LMsdd73YRxLnnKa8gLxky381qiSgCgYIKoZIzj0DAQehRANCAASPsDyeyBRV0UiU
        6o3chPz6uBchq2mZcqQgZ6nyoAs6qLdO7sWj2g7qeAxjowx7k4Mdo4UbfoG03Ins
        vK8JH8ls
        -----END PRIVATE KEY-----
      keyId: 8SJJXJWMAX
      teamId: 5MBUW9X833
    production: true

fcm:
  serviceAccount:
    type: "service_account"
    project_id: "zii-sandbox"
    private_key_id: "681aa7d939da33ec156bd24caef3f9b341ceb7de"
    private_key: "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDgHpfqbLxq6M+0\\nVrwTUUkgdwe4F1ISpSMYs7KRZkZmRdxXMzcmDA1sW5f62gQbgnmMbsENDkXiInuS\\ndt36stiJk1zRm+M9OgphDNGneeieUsjSyHyIg/+om0aD7ZdtbYippowIqvFd6JLH\\nsO95AuEr27XELNFo7dhXGtI/WFno8H3270YgQKukHw/BFANHqfm2U4ei5bu+Dc9Q\\nqlKcv8LlLbPLFH53yx6Xh5qEp34t1lb/BYcexVGeaqw8dxZ9OfpT6fTissvg7s3B\\nNDXuIvRN8kQeRR3HCu+VsbeSEJVwJvDLUg7G2In3ghma6mhC+MjI6+G0DB4Iuf+C\\nEQQ4Ne5rAgMBAAECggEAOJYg3zSTIh8kCjF4DRyR7RuAnG9u7nw5b0w3wtRi5AGx\\nj2bD/tw+K2S468JOFTANRnLUVVqMNHtmXeWbSGgNmjbV0aqdZmEYK8bTzIhQPmFC\\niU3Le6BwVX7XAApmGF/2iHcfljSq+n31SWwYGqKqfatcqmpyeR7MZ7nC6fGByfkt\\nfwn20fzmWaR3Fh3kNBlw1FbA3wWttluBwQH1UdMOXvDhRuiTN6owrF5QtUKzD3rC\\nmwXf6yeHa1v4bpYn9YzvgYNp8FS+TTGj2ZZGcpagM3Y2o2GCdK4T6XL8xEGb/ktD\\nmBM3TLm8kTk7APIp4znmjnwfMjtq+nLd99TDC0xuCQKBgQD9XplGiR6JBY1XOgcG\\nj1GHOGnpoL7PpufZAoJUapulrX4hRGFI0gJv3Fj8T5yk4LGpK8K4Hi/a6jTAqDXE\\nTG0LMbVJz6NHaVIqabipJJc7fhpXV/qQQOIzFWerywRkom+RuN8m81yGCAniLo0C\\nbnZhG3Rny9Rlv0YJH7yz/xgsVQKBgQDickElQ2CSQBcV8sqsVR6WJABHc4AKLl3z\\nQ9dqHCqT+T2b56jbgmUuysrn2yogW3TxEN/2+qbITNegkRMRzfUYnr/K7vDIN1Cg\\nwSnknmVTcaohAt+qZ9fQO+yQ/si7nJN+5A3TwtJO/HvhL0xCJdQkX1e8BmhfiAkw\\npyIodiRvvwKBgFsedz8PtwSOE5uoCbjJOAfKOQTFQ3oIS18W8OoNAPbfYvnxzo7S\\nv/+cnf/3XZ1KFXqCe1+ds5YmHlye4d87oQeik9D8tHrNHLiWFsv1ldHWcwCwajMQ\\nsoiujP8SXv0WEcu1UcN/R+oH4A4QsbOLKFWZ+w4NFtCUrko/uKx+9CGVAoGACiwX\\nwRTFwcwfPV0qvZMVTKlRWeRWXB65GbRyeNHLF9qaaeZ+L14sLW3ur3uo6Msy9aFM\\nbkvUMitBhHT/5kzaNcDr3LHfHx9c/9uthheXdaglfFYktgL0LuaCOgE4AzWFaq3T\\n8S9PQz0UU4lMY6xPW1LtHgUrqx7xSr43SpoECQECgYEA2Jk5I3Ur8oEmz5UJD2yu\\nTqhK0vQXIQVws0sqrypI8M2PZGM9+vLq3/ujWSG9VvflmwNLX8ldOtb4Z7HmZFC1\\nCoNbSbiCkLP2IH4EgOZjoCdekXwutA2Fmi9pYkOGBFsbyw7brku4uIC9tw1D/8GY\\nNlVfo1UaWqgV/pTIWX3ogRI=\\n-----END PRIVATE KEY-----\\n"
    client_email: firebase-adminsdk-uq5v1@zii-sandbox.iam.gserviceaccount.com
    client_id: "115241389257611967172"
    auth_uri: "https://accounts.google.com/o/oauth2/auth"
    token_uri: "https://oauth2.googleapis.com/token"
    auth_provider_x509_cert_url: https://www.googleapis.com/oauth2/v1/certs
    client_x509_cert_url: https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-uq5v1%40zii-sandbox.iam.gserviceaccount.com
  system:
    senderId: 540761922266
    serverKey: AAAAfefsGto:APA91bF2NFUPdYXsDHr_nYhGhH3AzgI5Ga7HC32GM-UJfz7SB9xhkBPXoL2qomZSjpkBL8ky7lzhoEWX0ELXBW4OS7fD8UiY3hudof5uSufIdQIC28uyJ2YI_yeIjCskpjcxYfPR7qoH
  endpoint:
    topicURI: https://iid.googleapis.com/iid
    groupURI: https://fcm.googleapis.com/fcm/notification

opentelemetry:
  enabled: true
  serviceName: "call-service"
  endpoint: "http://localhost:4317"
`;


export const yamlContentConfig = parse(yamlContent);