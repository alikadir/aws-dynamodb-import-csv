const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const AWS = require('aws-sdk');

const tableName = 'sample-dynamodb-table';

AWS.config.update({ region: 'eu-central-1' });

/*
// credentials not required for default profile

var credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.credentials = credentials;
*/

const docClient = new AWS.DynamoDB.DocumentClient();

// remove (S) in header in exported csv file
const contents = fs
  .readFileSync(`./csv/${tableName}.csv`, 'utf-8')
  .replace(new RegExp(' \\(S\\)', 'g'), '')
  .replace(new RegExp(' \\(BOOL\\)', 'g'), '')
  .replace(new RegExp(' \\(N\\)', 'g'), '');

const data = parse(contents, { columns: true });

// String and Binary type attributes must have lengths greater than zero.
for (item of data) for (prop in item) if (item[prop] === '') delete item[prop];

data.forEach(item => {
  if (!item.maybeempty) delete item.maybeempty; //need to remove empty items
  docClient.put({ TableName: tableName, Item: item }, (err, res) => {
    console.log(item);
    if (err) console.log(err);
  });
});

