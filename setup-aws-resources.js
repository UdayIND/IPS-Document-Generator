#!/usr/bin/env node

// AWS Resource Setup Script for Financial Advisor Dashboard
// This script creates the necessary AWS resources for the dashboard

const AWS = require('aws-sdk');

// Configuration
const CONFIG = {
    region: 'us-east-1',
    stackName: 'advisor-dashboard-stack',
    resources: {
        // DynamoDB Tables
        tables: [
            {
                name: 'advisor-clients-table',
                keySchema: [
                    { AttributeName: 'clientId', KeyType: 'HASH' }
                ],
                attributeDefinitions: [
                    { AttributeName: 'clientId', AttributeType: 'S' }
                ],
                billingMode: 'PAY_PER_REQUEST'
            },
            {
                name: 'advisor-tasks-table',
                keySchema: [
                    { AttributeName: 'taskId', KeyType: 'HASH' }
                ],
                attributeDefinitions: [
                    { AttributeName: 'taskId', AttributeType: 'S' }
                ],
                billingMode: 'PAY_PER_REQUEST'
            },
            {
                name: 'advisor-kpis-table',
                keySchema: [
                    { AttributeName: 'kpiType', KeyType: 'HASH' },
                    { AttributeName: 'timestamp', KeyType: 'RANGE' }
                ],
                attributeDefinitions: [
                    { AttributeName: 'kpiType', AttributeType: 'S' },
                    { AttributeName: 'timestamp', AttributeType: 'S' }
                ],
                billingMode: 'PAY_PER_REQUEST'
            },
            {
                name: 'advisor-notifications-table',
                keySchema: [
                    { AttributeName: 'notificationId', KeyType: 'HASH' }
                ],
                attributeDefinitions: [
                    { AttributeName: 'notificationId', AttributeType: 'S' }
                ],
                billingMode: 'PAY_PER_REQUEST'
            }
        ],
        
        // S3 Buckets
        buckets: [
            'advisor-documents-bucket',
            'advisor-reports-bucket',
            'advisor-ips-documents-bucket'
        ],
        
        // SNS Topics
        topics: [
            'advisor-market-alerts',
            'advisor-client-activity',
            'advisor-system-updates'
        ],
        
        // Lambda Functions
        lambdaFunctions: [
            {
                name: 'generate-ips-document',
                runtime: 'python3.9',
                handler: 'lambda_ips_generator.lambda_handler',
                description: 'Generates Investment Policy Statement documents'
            },
            {
                name: 'update-dashboard-kpis',
                runtime: 'python3.9',
                handler: 'lambda_kpi_updater.lambda_handler',
                description: 'Updates dashboard KPI metrics'
            },
            {
                name: 'process-task-updates',
                runtime: 'python3.9',
                handler: 'lambda_task_processor.lambda_handler',
                description: 'Processes task updates and notifications'
            },
            {
                name: 'send-notifications',
                runtime: 'python3.9',
                handler: 'lambda_notification_sender.lambda_handler',
                description: 'Sends notifications via SNS'
            }
        ]
    }
};

// Initialize AWS services
const dynamodb = new AWS.DynamoDB();
const s3 = new AWS.S3();
const sns = new AWS.SNS();
const lambda = new AWS.Lambda();
const iam = new AWS.IAM();

async function createDynamoDBTables() {
    console.log('Creating DynamoDB tables...');
    
    for (const table of CONFIG.resources.tables) {
        try {
            await dynamodb.createTable({
                TableName: table.name,
                KeySchema: table.keySchema,
                AttributeDefinitions: table.attributeDefinitions,
                BillingMode: table.billingMode
            }).promise();
            
            console.log(`✅ Created table: ${table.name}`);
        } catch (error) {
            if (error.code === 'ResourceInUseException') {
                console.log(`⚠️  Table ${table.name} already exists`);
            } else {
                console.error(`❌ Error creating table ${table.name}:`, error.message);
            }
        }
    }
}

async function createS3Buckets() {
    console.log('Creating S3 buckets...');
    
    for (const bucketName of CONFIG.resources.buckets) {
        try {
            await s3.createBucket({
                Bucket: bucketName,
                CreateBucketConfiguration: {
                    LocationConstraint: CONFIG.region
                }
            }).promise();
            
            // Set bucket policy for public read access to documents
            const bucketPolicy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Sid: 'PublicReadGetObject',
                        Effect: 'Allow',
                        Principal: '*',
                        Action: 's3:GetObject',
                        Resource: `arn:aws:s3:::${bucketName}/*`
                    }
                ]
            };
            
            await s3.putBucketPolicy({
                Bucket: bucketName,
                Policy: JSON.stringify(bucketPolicy)
            }).promise();
            
            console.log(`✅ Created bucket: ${bucketName}`);
        } catch (error) {
            if (error.code === 'BucketAlreadyOwnedByYou') {
                console.log(`⚠️  Bucket ${bucketName} already exists`);
            } else {
                console.error(`❌ Error creating bucket ${bucketName}:`, error.message);
            }
        }
    }
}

async function createSNSTopics() {
    console.log('Creating SNS topics...');
    
    for (const topicName of CONFIG.resources.topics) {
        try {
            const result = await sns.createTopic({
                Name: topicName
            }).promise();
            
            console.log(`✅ Created topic: ${topicName} (ARN: ${result.TopicArn})`);
        } catch (error) {
            console.error(`❌ Error creating topic ${topicName}:`, error.message);
        }
    }
}

async function createLambdaFunctions() {
    console.log('Creating Lambda functions...');
    
    // Note: This is a placeholder. In a real implementation, you would:
    // 1. Create the Lambda function code files
    // 2. Package them into ZIP files
    // 3. Upload to S3
    // 4. Create the Lambda functions
    
    for (const func of CONFIG.resources.lambdaFunctions) {
        console.log(`📝 Lambda function ${func.name} needs to be created manually`);
        console.log(`   - Runtime: ${func.runtime}`);
        console.log(`   - Handler: ${func.handler}`);
        console.log(`   - Description: ${func.description}`);
    }
}

async function createIAMRole() {
    console.log('Creating IAM role for Lambda functions...');
    
    const roleName = 'advisor-dashboard-lambda-role';
    const trustPolicy = {
        Version: '2012-10-17',
        Statement: [
            {
                Effect: 'Allow',
                Principal: {
                    Service: 'lambda.amazonaws.com'
                },
                Action: 'sts:AssumeRole'
            }
        ]
    };
    
    const permissionsPolicy = {
        Version: '2012-10-17',
        Statement: [
            {
                Effect: 'Allow',
                Action: [
                    'dynamodb:GetItem',
                    'dynamodb:PutItem',
                    'dynamodb:UpdateItem',
                    'dynamodb:DeleteItem',
                    'dynamodb:Scan',
                    'dynamodb:Query'
                ],
                Resource: 'arn:aws:dynamodb:*:*:table/advisor-*'
            },
            {
                Effect: 'Allow',
                Action: [
                    's3:GetObject',
                    's3:PutObject',
                    's3:DeleteObject'
                ],
                Resource: 'arn:aws:s3:::advisor-*/*'
            },
            {
                Effect: 'Allow',
                Action: [
                    'sns:Publish'
                ],
                Resource: 'arn:aws:sns:*:*:advisor-*'
            }
        ]
    };
    
    try {
        // Create role
        await iam.createRole({
            RoleName: roleName,
            AssumeRolePolicyDocument: JSON.stringify(trustPolicy),
            Description: 'Role for Financial Advisor Dashboard Lambda functions'
        }).promise();
        
        // Attach policies
        await iam.putRolePolicy({
            RoleName: roleName,
            PolicyName: 'advisor-dashboard-permissions',
            PolicyDocument: JSON.stringify(permissionsPolicy)
        }).promise();
        
        console.log(`✅ Created IAM role: ${roleName}`);
    } catch (error) {
        if (error.code === 'EntityAlreadyExists') {
            console.log(`⚠️  IAM role ${roleName} already exists`);
        } else {
            console.error(`❌ Error creating IAM role:`, error.message);
        }
    }
}

async function main() {
    console.log('🚀 Setting up AWS resources for Financial Advisor Dashboard...\n');
    
    try {
        await createDynamoDBTables();
        console.log('');
        
        await createS3Buckets();
        console.log('');
        
        await createSNSTopics();
        console.log('');
        
        await createIAMRole();
        console.log('');
        
        await createLambdaFunctions();
        console.log('');
        
        console.log('✅ AWS resource setup completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Create Lambda function code files');
        console.log('2. Deploy Lambda functions');
        console.log('3. Update aws-config.js with your actual resource names');
        console.log('4. Configure environment variables for AWS credentials');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Run the setup
if (require.main === module) {
    main();
}

module.exports = {
    CONFIG,
    createDynamoDBTables,
    createS3Buckets,
    createSNSTopics,
    createLambdaFunctions,
    createIAMRole
};
