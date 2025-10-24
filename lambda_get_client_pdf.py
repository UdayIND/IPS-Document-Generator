import boto3
import json
import base64
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    """
    AWS Lambda function to retrieve PDF files from S3 based on client name.
    Matches the S3 path structure: ips-output/pdf/
    """
    
    try:
        # Parse the event
        body = json.loads(event) if isinstance(event, str) else event
        
        bucket_name = body.get('bucketName', 'advisor-ips-documents-bucket')
        client_name = body.get('clientName', '')
        prefix = body.get('prefix', 'ips-output/pdf/')
        
        if not client_name:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'success': False,
                    'error': 'Client name is required'
                })
            }
        
        # Initialize S3 client
        s3 = boto3.client('s3')
        
        # Get client PDFs from S3
        pdf_files = get_client_pdf(bucket_name, client_name, prefix)
        
        if not pdf_files:
            return {
                'statusCode': 404,
                'body': json.dumps({
                    'success': False,
                    'error': f'No PDF files found for client: {client_name}'
                })
            }
        
        # Get the first matching PDF file
        pdf_key = pdf_files[0]
        
        # Retrieve the PDF content from S3
        try:
            response = s3.get_object(Bucket=bucket_name, Key=pdf_key)
            pdf_content = response['Body'].read()
            
            # Encode PDF content as base64 for transmission
            pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'success': True,
                    'pdfContent': pdf_base64,
                    'fileName': pdf_key.split('/')[-1],
                    's3Key': pdf_key,
                    'clientName': client_name
                })
            }
            
        except ClientError as e:
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'success': False,
                    'error': f'Error retrieving PDF from S3: {str(e)}'
                })
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': f'Lambda function error: {str(e)}'
            })
        }

def get_client_pdf(bucket_name, client_name, prefix='ips-output/pdf/'):
    """
    Retrieve all PDFs in S3 that match a client name (case-insensitive).
    Based on the S3 path structure shown in the image.
    """
    s3 = boto3.client('s3')

    # Convert to lowercase for case-insensitive matching
    client_name_lower = client_name.lower()

    try:
        # List all objects under the prefix
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)

        if 'Contents' not in response:
            print("No files found in that prefix.")
            return []

        # Filter matching files (case-insensitive)
        matching_pdfs = [
            obj['Key']
            for obj in response['Contents']
            if client_name_lower in obj['Key'].lower() and obj['Key'].lower().endswith('.pdf')
        ]

        if not matching_pdfs:
            print(f"No matching PDF found for client '{client_name}'.")
        else:
            print("Matching PDFs found:")
            for key in matching_pdfs:
                print(f" - {key}")

        return matching_pdfs
        
    except ClientError as e:
        print(f"Error listing S3 objects: {e}")
        return []

def generate_presigned_url(bucket_name, key, expiration=3600):
    """
    Generate a presigned URL for S3 object access.
    """
    s3 = boto3.client('s3')
    
    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': key},
            ExpiresIn=expiration
        )
        return url
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        return None

# Example usage for testing
if __name__ == "__main__":
    # Test the function locally
    test_event = {
        'bucketName': 'advisor-ips-documents-bucket',
        'clientName': 'Client_Name_1',
        'prefix': 'ips-output/pdf/'
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
