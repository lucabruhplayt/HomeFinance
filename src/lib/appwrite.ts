import { Client, Account, Databases, Storage } from 'appwrite'

export const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1'
export const APPWRITE_PROJECT_ID = '6a31a8380039fc3454c9'
export const APPWRITE_DB_ID = 'homefinance'
export const APPWRITE_BUCKET_ID = 'photos'

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export { ID, Query } from 'appwrite'
