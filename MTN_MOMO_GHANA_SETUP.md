# MTN Mobile Money (MoMo) API Integration for Ghana

This document explains how to set up and use the MTN Mobile Money API integration for Ghana.

## Overview

The MTN MoMo API integration allows customers in Ghana to pay using MTN Mobile Money. The integration includes:

- Payment request creation
- Payment status queries
- Automatic phone number formatting for Ghana

## Setup Instructions

### 1. Get MTN MoMo Credentials

1. Register at [MTN Developer Portal](https://momodeveloper.mtn.com/)
2. Create a new application
3. Subscribe to the "Collections" product
4. Get your credentials from the portal:

   **Step 4a: Get Subscription Key**
   - Go to "Products" → "Collections"
   - Copy **Primary Subscription Key** OR **Secondary Subscription Key** (use one)
   
   **Step 4b: Create API User**
   - Go to "API User" section
   - Create a new API User (choose a username)
   - Save the username - this is your `MTN_MOMO_API_USER`
   
   **Step 4c: Generate API Key**
   - Still in "API User" section
   - Find your API User
   - Click "Generate API Key" or "Create API Key"
   - **⚠️ IMPORTANT:** Copy the API Key immediately - you can't view it again!
   - This is your `MTN_MOMO_API_KEY`
   
   **⚠️ CRITICAL:** The API Key is **NOT** the same as the Subscription Key!
   - Subscription Key = From Products → Collections
   - API Key = Generated for your API User
   - They are **different values** and both are required!

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# MTN Mobile Money (Ghana) Configuration
# Use EITHER Primary OR Secondary Subscription Key (not both)
MTN_MOMO_SUBSCRIPTION_KEY=your_primary_or_secondary_subscription_key
MTN_MOMO_API_USER=your_api_user
MTN_MOMO_API_KEY=your_api_key
MTN_MOMO_ENVIRONMENT=sandbox  # or 'production'
MTN_MOMO_TARGET_ENVIRONMENT=sandbox  # or 'production'
```

**Understanding MTN MoMo Credentials:**

1. **Subscription Key:**
   - MTN provides **Primary Subscription Key** and **Secondary Subscription Key**
   - Use **EITHER** Primary **OR** Secondary (not both)
   - Primary is typically used for production, Secondary for backup/failover
   - For sandbox/testing, use the sandbox subscription key
   - For production, use your production subscription key
   - Set this value in `MTN_MOMO_SUBSCRIPTION_KEY`

2. **API User:**
   - Created in the MTN Developer Portal under "API User"
   - This is a username you create for API authentication
   - Set this value in `MTN_MOMO_API_USER`

3. **API Key:**
   - Generated for your API User in the MTN Developer Portal
   - Used with API User for Basic Authentication
   - Set this value in `MTN_MOMO_API_KEY`

4. **Environment:**
   - `sandbox`: For testing (use sandbox credentials)
   - `production`: For live payments (use production credentials)
   - Set in `MTN_MOMO_ENVIRONMENT` and `MTN_MOMO_TARGET_ENVIRONMENT`

**Important:**
- All MTN MoMo credentials should **never** be exposed to the client
- Use `sandbox` for testing, `production` for live payments
- Keep your API key secure and never commit it to version control
- The `MTN_MOMO_TARGET_ENVIRONMENT` should match your MTN MoMo account environment
- You can switch between Primary and Secondary keys by changing `MTN_MOMO_SUBSCRIPTION_KEY`

### 3. API Endpoints

The integration creates the following API routes:

#### Create Payment
- **Endpoint:** `/api/payment/mtn-momo/create`
- **Method:** POST
- **Body:**
  ```json
  {
    "amount": 100.00,
    "phoneNumber": "0244123456",
    "orderId": "ORDER-123",
    "orderInfo": "Payment for order ORDER-123"
  }
  ```

#### Query Payment Status
- **Endpoint:** `/api/payment/mtn-momo/query`
- **Method:** POST
- **Body:**
  ```json
  {
    "referenceId": "ORDER-123"
  }
  ```

## How It Works

### Payment Flow

1. **Customer selects MTN MoMo payment** in checkout
2. **Customer enters phone number** (e.g., 0244123456)
3. **System creates payment request** via `/api/payment/mtn-momo/create`
4. **MTN MoMo sends push notification** to customer's phone
5. **Customer approves payment** on their phone
6. **System queries payment status** to confirm payment
7. **Order is completed** when payment is successful

### Phone Number Format

- **Input format:** 0244123456 (Ghana format with leading 0)
- **API format:** 233244123456 (automatically converted)
- The system automatically:
  - Removes leading 0
  - Adds country code 233
  - Validates format before sending

### Payment Status

MTN MoMo payment statuses:
- **PENDING:** Payment request sent, waiting for customer approval
- **SUCCESSFUL:** Payment approved and completed
- **FAILED:** Payment failed or was declined

## Testing

### Sandbox Mode

1. Set `MTN_MOMO_ENVIRONMENT=sandbox`
2. Use test credentials from MTN Developer Portal
3. Test with MTN MoMo sandbox test accounts
4. Use test phone numbers provided by MTN

### Production Mode

1. Set `MTN_MOMO_ENVIRONMENT=production`
2. Use production credentials
3. Ensure all webhook URLs are publicly accessible (HTTPS required)
4. Complete MTN MoMo production onboarding

## Error Handling

The integration handles various error scenarios:

- **Invalid phone number:** Returns error with format requirements
- **Network errors:** Catches and logs errors
- **Payment failures:** Returns appropriate error messages
- **Authentication errors:** Handles token refresh automatically

## Security Best Practices

1. **Never expose API credentials** to client-side code
2. **Use HTTPS** in production for all API calls
3. **Validate phone numbers** before processing payments
4. **Log all payment transactions** for audit purposes
5. **Store payment references** securely in database
6. **Implement retry logic** for failed payment queries

## Phone Number Validation

The system validates Ghana phone numbers:
- Must start with 0
- Must be 10 digits total
- Format: 0XXXXXXXXX

Examples:
- ✅ Valid: 0244123456
- ✅ Valid: 0200123456
- ❌ Invalid: 244123456 (missing leading 0)
- ❌ Invalid: 00244123456 (double zero)

## Troubleshooting

### Common Issues

1. **"MTN MoMo configuration is incomplete"**
   - Check that all environment variables are set
   - Ensure variables are in `.env.local` (not `.env`)

2. **"Invalid phone number format"**
   - Verify phone number starts with 0
   - Check that phone number is 10 digits
   - Ensure it's a valid Ghana phone number

3. **"Failed to get MTN MoMo access token"**
   - Verify API User and API Key are correct
   - Check subscription key is valid
   - Ensure environment matches credentials

4. **"Payment request failed"**
   - Verify phone number is registered with MTN MoMo
   - Check that customer has sufficient balance
   - Ensure target environment matches account

5. **"Payment status query failed"**
   - Wait a few seconds after creating payment request
   - Verify reference ID is correct
   - Check that payment request was created successfully

## Support

For MTN MoMo API documentation and support:
- [MTN Developer Portal](https://momodeveloper.mtn.com/)
- [MTN MoMo API Documentation](https://momodeveloper.mtn.com/docs)
- [MTN MoMo Support](https://momodeveloper.mtn.com/support)

## Notes

- MTN MoMo payments are push-based (customer approves on phone)
- No payment URL is returned (unlike redirect-based payments)
- Payment status must be queried to confirm completion
- Payments are typically instant once approved by customer

