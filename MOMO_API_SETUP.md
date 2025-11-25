# MoMo Payment Gateway API Integration

This document explains how to set up and use the MoMo Payment Gateway API integration.

## Overview

The MoMo API integration allows customers to pay using MoMo Wallet. The integration includes:

- Payment creation
- Payment status queries
- Payment callbacks (return URL)
- Payment webhooks (notify URL)

## Setup Instructions

### 1. Get MoMo Credentials

1. Register at [MoMo Developer Portal](https://developers.momo.vn/)
2. Create a new application
3. Get your credentials:
   - Partner Code
   - Access Key
   - Secret Key

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# MoMo Payment Gateway Configuration
NEXT_PUBLIC_MOMO_PARTNER_CODE=your_partner_code
NEXT_PUBLIC_MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key  # Server-side only, never expose to client
NEXT_PUBLIC_MOMO_ENVIRONMENT=sandbox  # or 'production'
```

**Important:**
- `MOMO_SECRET_KEY` should **never** be exposed to the client
- Use `sandbox` for testing, `production` for live payments
- Keep your secret key secure and never commit it to version control

### 3. API Endpoints

The integration creates the following API routes:

#### Create Payment
- **Endpoint:** `/api/payment/momo/create`
- **Method:** POST
- **Body:**
  ```json
  {
    "amount": 100000,
    "orderId": "ORDER-123",
    "orderInfo": "Payment for order",
    "returnUrl": "https://yoursite.com/orders/ORDER-123",
    "notifyUrl": "https://yoursite.com/api/payment/momo/notify",
    "extraData": "optional_data"
  }
  ```

#### Query Payment Status
- **Endpoint:** `/api/payment/momo/query`
- **Method:** POST
- **Body:**
  ```json
  {
    "orderId": "ORDER-123"
  }
  ```

#### Payment Callback (Return URL)
- **Endpoint:** `/api/payment/momo/callback`
- **Method:** GET
- **Query Parameters:**
  - `orderId`: Order ID
  - `errorCode`: Error code (0 = success)
  - `message`: Status message
  - `signature`: Signature for verification

#### Payment Webhook (Notify URL)
- **Endpoint:** `/api/payment/momo/notify`
- **Method:** POST
- **Body:** MoMo webhook payload

## How It Works

### Payment Flow

1. **Customer selects MoMo payment** in checkout
2. **System creates payment request** via `/api/payment/momo/create`
3. **MoMo returns payment URL** (payUrl or deeplink)
4. **Customer redirected to MoMo** to complete payment
5. **MoMo redirects back** to `returnUrl` (callback)
6. **MoMo sends webhook** to `notifyUrl` (notify)

### Signature Verification

All MoMo API requests and responses are signed using HMAC SHA256. The signature is automatically generated and verified:

- **Request signature:** Generated before sending to MoMo
- **Response signature:** Verified when receiving from MoMo

## Testing

### Sandbox Mode

1. Set `NEXT_PUBLIC_MOMO_ENVIRONMENT=sandbox`
2. Use test credentials from MoMo Developer Portal
3. Test with MoMo sandbox test accounts

### Production Mode

1. Set `NEXT_PUBLIC_MOMO_ENVIRONMENT=production`
2. Use production credentials
3. Ensure webhook URLs are publicly accessible (HTTPS required)

## Error Handling

The integration handles various error scenarios:

- **Invalid credentials:** Returns error with message
- **Network errors:** Catches and logs errors
- **Invalid signatures:** Rejects webhook/callback
- **Payment failures:** Returns appropriate error codes

## Security Best Practices

1. **Never expose secret key** to client-side code
2. **Always verify signatures** on webhooks and callbacks
3. **Use HTTPS** in production for all webhook URLs
4. **Validate order amounts** before processing payments
5. **Log all payment transactions** for audit purposes

## Troubleshooting

### Common Issues

1. **"MoMo configuration is incomplete"**
   - Check that all environment variables are set
   - Ensure `MOMO_SECRET_KEY` is in `.env.local` (not `.env`)

2. **"Invalid signature"**
   - Verify secret key is correct
   - Check that signature generation matches MoMo's algorithm

3. **"Payment creation failed"**
   - Verify partner code and access key
   - Check that environment matches credentials (sandbox vs production)

4. **Webhook not receiving**
   - Ensure webhook URL is publicly accessible
   - Check that URL uses HTTPS in production
   - Verify webhook URL is correctly configured in MoMo dashboard

## Support

For MoMo API documentation and support:
- [MoMo Developer Portal](https://developers.momo.vn/)
- [MoMo API Documentation](https://developers.momo.vn/docs)

