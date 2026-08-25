import neo4j, { Driver } from 'neo4j-driver';
import 'dotenv/config';

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME || 'cognodb';
const password = process.env.COGNODB_PASSWORD;

if (!uri || !password) {
  throw new Error('Missing COGNODB_URI or COGNODB_PASSWORD environment variable.');
}

export const driver: Driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

export async function verifyDatabase() {
  await driver.verifyConnectivity();
}

export async function closeDatabase() {
  await driver.close();
}
