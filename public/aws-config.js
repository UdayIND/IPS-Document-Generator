// AWS Configuration for Financial Advisor Dashboard
// This file handles AWS service integration

// AWS Configuration
const AWS_CONFIG = {
    region: 'us-east-1', // Change to your preferred region
    accessKeyId: '', // Will be set via environment variables
    secretAccessKey: '', // Will be set via environment variables
    sessionToken: '' // Optional, for temporary credentials
};

// AWS Services Configuration
const AWS_SERVICES = {
    // Lambda functions for backend processing
    lambda: {
        generateIPS: 'generate-ips-document', // Lambda function name for IPS generation
        updateKPIs: 'update-dashboard-kpis', // Lambda function for KPI updates
        processTasks: 'process-task-updates', // Lambda function for task management
        sendNotifications: 'send-notifications' // Lambda function for notifications
    },
    
    // DynamoDB tables for data storage
    dynamodb: {
        clients: 'advisor-clients-table',
        tasks: 'advisor-tasks-table',
        kpis: 'advisor-kpis-table',
        notifications: 'advisor-notifications-table'
    },
    
    // S3 buckets for document storage
    s3: {
        documents: 'advisor-documents-bucket',
        reports: 'advisor-reports-bucket',
        ipsDocuments: 'advisor-ips-documents-bucket'
    },
    
    // SNS topics for notifications
    sns: {
        marketAlerts: 'advisor-market-alerts',
        clientActivity: 'advisor-client-activity',
        systemUpdates: 'advisor-system-updates'
    }
};

// Initialize AWS SDK
function initializeAWS() {
    // Check if AWS SDK is loaded
    if (typeof AWS === 'undefined') {
        console.error('AWS SDK not loaded. Please include the AWS SDK script.');
        return false;
    }
    
    // Configure AWS
    AWS.config.update(AWS_CONFIG);
    
    // Initialize services
    const lambda = new AWS.Lambda();
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const s3 = new AWS.S3();
    const sns = new AWS.SNS();
    
    return {
        lambda,
        dynamodb,
        s3,
        sns
    };
}

// KPI Data Management
class KPIManager {
    constructor(awsServices) {
        this.aws = awsServices;
    }
    
    async fetchKPIs() {
        try {
            const params = {
                FunctionName: AWS_SERVICES.lambda.updateKPIs,
                Payload: JSON.stringify({})
            };
            
            const result = await this.aws.lambda.invoke(params).promise();
            return JSON.parse(result.Payload);
        } catch (error) {
            console.error('Error fetching KPIs:', error);
            return null;
        }
    }
    
    async updateKPI(kpiType, value) {
        try {
            const params = {
                TableName: AWS_SERVICES.dynamodb.kpis,
                Item: {
                    kpiType: kpiType,
                    value: value,
                    timestamp: new Date().toISOString(),
                    advisorId: 'steve-seid' // Replace with actual advisor ID
                }
            };
            
            await this.aws.dynamodb.put(params).promise();
            return true;
        } catch (error) {
            console.error('Error updating KPI:', error);
            return false;
        }
    }
}

// Task Management
class TaskManager {
    constructor(awsServices) {
        this.aws = awsServices;
    }
    
    async fetchTasks() {
        try {
            const params = {
                TableName: AWS_SERVICES.dynamodb.tasks,
                FilterExpression: 'advisorId = :advisorId',
                ExpressionAttributeValues: {
                    ':advisorId': 'steve-seid'
                }
            };
            
            const result = await this.aws.dynamodb.scan(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    }
    
    async addTask(taskText) {
        try {
            const params = {
                TableName: AWS_SERVICES.dynamodb.tasks,
                Item: {
                    taskId: Date.now().toString(),
                    advisorId: 'steve-seid',
                    taskText: taskText,
                    completed: false,
                    createdAt: new Date().toISOString(),
                    dueDate: new Date().toISOString()
                }
            };
            
            await this.aws.dynamodb.put(params).promise();
            return true;
        } catch (error) {
            console.error('Error adding task:', error);
            return false;
        }
    }
    
    async updateTaskStatus(taskId, completed) {
        try {
            const params = {
                TableName: AWS_SERVICES.dynamodb.tasks,
                Key: {
                    taskId: taskId
                },
                UpdateExpression: 'SET completed = :completed, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':completed': completed,
                    ':updatedAt': new Date().toISOString()
                }
            };
            
            await this.aws.dynamodb.update(params).promise();
            return true;
        } catch (error) {
            console.error('Error updating task:', error);
            return false;
        }
    }
}

// Document Management (IPS Generation)
class DocumentManager {
    constructor(awsServices) {
        this.aws = awsServices;
    }
    
    async generateIPS(clientId, options) {
        try {
            const params = {
                FunctionName: AWS_SERVICES.lambda.generateIPS,
                Payload: JSON.stringify({
                    clientId: clientId,
                    options: options,
                    advisorId: 'steve-seid'
                })
            };
            
            const result = await this.aws.lambda.invoke(params).promise();
            const response = JSON.parse(result.Payload);
            
            if (response.success) {
                // Store document reference in S3
                await this.storeDocumentReference(response.documentUrl, clientId);
                return response;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error generating IPS:', error);
            return { success: false, error: error.message };
        }
    }
    
    async storeDocumentReference(documentUrl, clientId) {
        try {
            const params = {
                TableName: AWS_SERVICES.dynamodb.clients,
                Key: {
                    clientId: clientId
                },
                UpdateExpression: 'SET ipsDocumentUrl = :url, ipsGeneratedAt = :timestamp',
                ExpressionAttributeValues: {
                    ':url': documentUrl,
                    ':timestamp': new Date().toISOString()
                }
            };
            
            await this.aws.dynamodb.update(params).promise();
            return true;
        } catch (error) {
            console.error('Error storing document reference:', error);
            return false;
        }
    }
}

// Notification Management
class NotificationManager {
    constructor(awsServices) {
        this.aws = awsServices;
    }
    
    async fetchNotifications() {
        try {
            const params = {
                TableName: AWS_SERVICES.dynamodb.notifications,
                FilterExpression: 'advisorId = :advisorId',
                ExpressionAttributeValues: {
                    ':advisorId': 'steve-seid'
                },
                ScanIndexForward: false, // Sort by timestamp descending
                Limit: 10
            };
            
            const result = await this.aws.dynamodb.scan(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }
    
    async sendNotification(type, message, priority = 'normal') {
        try {
            const params = {
                TableName: AWS_SERVICES.dynamodb.notifications,
                Item: {
                    notificationId: Date.now().toString(),
                    advisorId: 'steve-seid',
                    type: type,
                    message: message,
                    priority: priority,
                    read: false,
                    createdAt: new Date().toISOString()
                }
            };
            
            await this.aws.dynamodb.put(params).promise();
            
            // Send SNS notification if high priority
            if (priority === 'high') {
                await this.sendSNSNotification(type, message);
            }
            
            return true;
        } catch (error) {
            console.error('Error sending notification:', error);
            return false;
        }
    }
    
    async sendSNSNotification(type, message) {
        try {
            const topicArn = AWS_SERVICES.sns[type] || AWS_SERVICES.sns.systemUpdates;
            
            const params = {
                TopicArn: topicArn,
                Message: JSON.stringify({
                    type: type,
                    message: message,
                    timestamp: new Date().toISOString()
                }),
                Subject: `Advisor Dashboard - ${type}`
            };
            
            await this.aws.sns.publish(params).promise();
            return true;
        } catch (error) {
            console.error('Error sending SNS notification:', error);
            return false;
        }
    }
}

// Export for use in main application
window.AWS_CONFIG = AWS_CONFIG;
window.AWS_SERVICES = AWS_SERVICES;
window.initializeAWS = initializeAWS;
window.KPIManager = KPIManager;
window.TaskManager = TaskManager;
window.DocumentManager = DocumentManager;
window.NotificationManager = NotificationManager;
