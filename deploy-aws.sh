#!/bin/bash

# AWS Deployment Script for Financial Advisor Dashboard
# This script deploys the dashboard to AWS S3 and sets up the necessary resources

set -e

echo "🚀 Deploying Financial Advisor Dashboard to AWS..."

# Configuration
BUCKET_NAME="advisor-dashboard-bucket"
REGION="us-east-1"
STACK_NAME="advisor-dashboard-stack"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Create S3 bucket for hosting
echo "📦 Creating S3 bucket for hosting..."
if ! aws s3 ls "s3://$BUCKET_NAME" 2>/dev/null; then
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    echo "✅ Created bucket: $BUCKET_NAME"
else
    echo "⚠️  Bucket $BUCKET_NAME already exists"
fi

# Configure bucket for static website hosting
echo "🌐 Configuring bucket for static website hosting..."
aws s3 website "s3://$BUCKET_NAME" --index-document index.html --error-document index.html

# Set bucket policy for public read access
echo "🔓 Setting bucket policy for public access..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file://bucket-policy.json
rm bucket-policy.json

# Sync files to S3
echo "📤 Uploading files to S3..."
aws s3 sync . "s3://$BUCKET_NAME" --exclude "*.git/*" --exclude "node_modules/*" --exclude "*.log"

# Set up AWS resources
echo "🔧 Setting up AWS resources..."
if command -v node > /dev/null 2>&1; then
    node setup-aws-resources.js
else
    echo "⚠️  Node.js not found. Please install Node.js to set up AWS resources automatically."
    echo "📋 Manual setup required:"
    echo "   1. Create DynamoDB tables: advisor-clients-table, advisor-tasks-table, advisor-kpis-table, advisor-notifications-table"
    echo "   2. Create S3 buckets: advisor-documents-bucket, advisor-reports-bucket, advisor-ips-documents-bucket"
    echo "   3. Create SNS topics: advisor-market-alerts, advisor-client-activity, advisor-system-updates"
    echo "   4. Create Lambda functions for IPS generation and KPI updates"
fi

# Get the website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo ""
echo "✅ Deployment completed!"
echo "🌐 Website URL: $WEBSITE_URL"
echo ""
echo "📋 Next steps:"
echo "1. Configure AWS credentials in your browser"
echo "2. Update aws-config.js with your actual resource names"
echo "3. Test the dashboard functionality"
echo "4. Set up Lambda functions for backend processing"
echo ""
echo "🔧 To configure AWS credentials:"
echo "   - Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables"
echo "   - Or use AWS IAM roles for EC2/ECS"
echo "   - Or configure AWS credentials in your browser"
