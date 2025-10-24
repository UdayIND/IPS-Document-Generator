# AWS Lambda Deployment Guide

## Deploy the PDF Retrieval Lambda Function

### 1. Create Lambda Function

```bash
# Create the Lambda function
aws lambda create-function \
    --function-name get-client-pdf \
    --runtime python3.9 \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/advisor-dashboard-lambda-role \
    --handler lambda_get_client_pdf.lambda_handler \
    --zip-file fileb://lambda_get_client_pdf.zip \
    --description "Retrieve PDF files from S3 for Financial Advisor Dashboard"
```

### 2. Create Deployment Package

```bash
# Create a zip file for deployment
zip lambda_get_client_pdf.zip lambda_get_client_pdf.py
```

### 3. Update Function Code

```bash
# Update the function code
aws lambda update-function-code \
    --function-name get-client-pdf \
    --zip-file fileb://lambda_get_client_pdf.zip
```

### 4. Set Environment Variables

```bash
# Set environment variables for the Lambda function
aws lambda update-function-configuration \
    --function-name get-client-pdf \
    --environment Variables='{
        "DEFAULT_BUCKET": "advisor-ips-documents-bucket",
        "DEFAULT_PREFIX": "ips-output/pdf/"
    }'
```

### 5. Configure IAM Permissions

The Lambda function needs the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::advisor-ips-documents-bucket",
                "arn:aws:s3:::advisor-ips-documents-bucket/*"
            ]
        }
    ]
}
```

### 6. Test the Function

```bash
# Test the Lambda function
aws lambda invoke \
    --function-name get-client-pdf \
    --payload '{"clientName": "Client_Name_1", "bucketName": "advisor-ips-documents-bucket", "prefix": "ips-output/pdf/"}' \
    response.json

# View the response
cat response.json
```

### 7. S3 Bucket Structure

Ensure your S3 bucket has the following structure:
```
advisor-ips-documents-bucket/
└── ips-output/
    └── pdf/
        ├── Client_Name_1_2024-01-15.pdf
        ├── Client_Name_2_2024-01-16.pdf
        └── ...
```

### 8. Frontend Integration

The dashboard will automatically call this Lambda function when users click the download button. The function:

1. **Searches S3** for PDFs matching the client name
2. **Retrieves the PDF** content from S3
3. **Returns base64-encoded** PDF data to the frontend
4. **Handles errors** gracefully with fallback to mock PDF

### 9. Monitoring

Monitor the Lambda function using CloudWatch:
- **Logs**: Check CloudWatch Logs for debugging
- **Metrics**: Monitor invocation count, duration, and errors
- **Alarms**: Set up alarms for high error rates

### 10. Security Considerations

- **IAM Roles**: Use least-privilege access
- **VPC**: Consider VPC configuration for enhanced security
- **Encryption**: Enable S3 server-side encryption
- **CORS**: Configure CORS for web application access

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Check IAM role permissions
2. **Function Not Found**: Verify function name in AWS console
3. **S3 Access Error**: Check bucket permissions and existence
4. **Timeout**: Increase Lambda timeout for large PDFs
5. **Memory**: Increase memory allocation if needed

### Debug Steps:

1. Check CloudWatch logs for error messages
2. Verify S3 bucket and object existence
3. Test Lambda function independently
4. Check IAM permissions
5. Verify client name matching logic
