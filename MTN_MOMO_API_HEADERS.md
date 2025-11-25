# MTN MoMo API Headers Specification

This document details the required and optional headers for MTN MoMo API integration.

## Request-to-Pay Headers

### Required Headers

| Header | Required | Type | Description |
|--------|----------|------|-------------|
| `Authorization` | ✅ Yes | string | Bearer Authentication Token generated using CreateAccessToken API Call |
| `X-Reference-Id` | ✅ Yes | string (UUID v4) | Resource ID of the created request to pay transaction. This ID is used for validating the status of the request. Must be a 'Universal Unique ID' generated using UUID version 4. |
| `X-Target-Environment` | ✅ Yes | string | The identifier of the Wallet Platform system where the transaction shall be processed. This parameter is used to route the request to the Wallet Platform system that will initiate the transaction. Values: `sandbox` or `production` |
| `Ocp-Apim-Subscription-Key` | ✅ Yes | string | Your subscription key (Primary or Secondary) from MTN Developer Portal |
| `Content-Type` | ✅ Yes | string | Should be `application/json` |

### Optional Headers

| Header | Required | Type | Description |
|--------|----------|------|-------------|
| `X-Callback-Url` | ❌ No | string | URL to the server where the callback should be sent. MTN MoMo will send payment status updates to this URL via POST request. |

## Implementation Details

### X-Reference-Id (UUID v4)

The `X-Reference-Id` must be a valid UUID version 4 format:
- Format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- Example: `550e8400-e29b-41d4-a716-446655440000`
- Generated automatically in our implementation

### X-Callback-Url

The callback URL receives payment status updates:
- Method: POST
- Content-Type: application/json
- Payload includes:
  - `financialTransactionId`: The transaction ID
  - `externalId`: Your order ID
  - `amount`: Payment amount
  - `status`: Payment status (SUCCESSFUL, FAILED, PENDING, etc.)
  - `reason`: Reason for failure (if applicable)

### Authorization Token

The Bearer token is obtained from the `/collection/token/` endpoint:
- Uses Basic Authentication (API User + API Key)
- Token expires after a certain time (typically 1 hour)
- Automatically refreshed in our implementation

## Example Request

```javascript
POST /collection/v1_0/requesttopay
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Ocp-Apim-Subscription-Key: abc123def456...
  X-Target-Environment: sandbox
  X-Reference-Id: 550e8400-e29b-41d4-a716-446655440000
  X-Callback-Url: https://yoursite.com/api/payment/mtn-momo/notify
  Content-Type: application/json

Body:
{
  "amount": "100.00",
  "currency": "GHS",
  "externalId": "ORDER-123",
  "payer": {
    "partyIdType": "MSISDN",
    "partyId": "233244123456"
  },
  "payerMessage": "Payment for order ORDER-123",
  "payeeNote": "Payment for order ORDER-123"
}
```

## Response

MTN MoMo returns:
- **202 Accepted**: Payment request created successfully (asynchronous)
- **400 Bad Request**: Invalid request
- **401/403: Authentication errors

After 202, you must query the payment status using the `X-Reference-Id` (UUID).

## Status Query

To check payment status, use the `X-Reference-Id`:

```javascript
GET /collection/v1_0/requesttopay/{X-Reference-Id}
Headers:
  Authorization: Bearer <token>
  Ocp-Apim-Subscription-Key: <subscription_key>
  X-Target-Environment: sandbox
```

## Callback Payload Example

When payment status changes, MTN MoMo sends POST to `X-Callback-Url`:

```json
{
  "financialTransactionId": "550e8400-e29b-41d4-a716-446655440000",
  "externalId": "ORDER-123",
  "amount": "100.00",
  "currency": "GHS",
  "payer": {
    "partyIdType": "MSISDN",
    "partyId": "233244123456"
  },
  "payerMessage": "Payment for order ORDER-123",
  "payeeNote": "Payment for order ORDER-123",
  "status": "SUCCESSFUL",
  "reason": null
}
```

## Our Implementation

Our implementation automatically:
1. ✅ Generates UUID v4 for `X-Reference-Id`
2. ✅ Sets `Authorization` Bearer token (auto-refreshed)
3. ✅ Sets `X-Target-Environment` from config
4. ✅ Sets `X-Callback-Url` if provided
5. ✅ Sets `Ocp-Apim-Subscription-Key` from config
6. ✅ Sets `Content-Type: application/json`

All headers are properly formatted according to MTN MoMo API specification.

