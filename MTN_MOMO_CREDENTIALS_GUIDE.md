# MTN MoMo Credentials Guide

This guide explains how to map MTN MoMo portal credentials to environment variables.

## MTN MoMo Credentials Mapping

### From MTN Developer Portal:

When you subscribe to the "Collections" product in the MTN Developer Portal, you receive:

1. **Primary Subscription Key** - A long alphanumeric string
2. **Secondary Subscription Key** - Another long alphanumeric string (for backup/failover)
3. **API User** - A username you create when setting up API authentication
4. **API Key** - A key generated for your API User

### To Environment Variables:

```env
# Use EITHER Primary OR Secondary Subscription Key
MTN_MOMO_SUBSCRIPTION_KEY=<Primary Subscription Key OR Secondary Subscription Key>

# Your API User (username you created)
MTN_MOMO_API_USER=<Your API User>

# Your API Key (generated for your API User)
MTN_MOMO_API_KEY=<Your API Key>

# Environment (sandbox or production)
MTN_MOMO_ENVIRONMENT=sandbox
MTN_MOMO_TARGET_ENVIRONMENT=sandbox
```

## Which Subscription Key to Use?

### Primary Subscription Key:
- **Use for:** Production environment (live payments)
- **When:** You want to use the primary key for all transactions
- **Set:** `MTN_MOMO_SUBSCRIPTION_KEY=<Primary Subscription Key>`

### Secondary Subscription Key:
- **Use for:** Backup/failover or testing
- **When:** Primary key has issues or you want to test with secondary
- **Set:** `MTN_MOMO_SUBSCRIPTION_KEY=<Secondary Subscription Key>`

### Recommendation:
- **For Sandbox/Testing:** Use either Primary or Secondary (both work in sandbox)
- **For Production:** Start with Primary, keep Secondary as backup

## Example Configuration

### Sandbox (Testing):
```env
MTN_MOMO_SUBSCRIPTION_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
MTN_MOMO_API_USER=my_api_user_123
MTN_MOMO_API_KEY=xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx234
MTN_MOMO_ENVIRONMENT=sandbox
MTN_MOMO_TARGET_ENVIRONMENT=sandbox
```

### Production (Live):
```env
MTN_MOMO_SUBSCRIPTION_KEY=prod_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
MTN_MOMO_API_USER=my_api_user_123
MTN_MOMO_API_KEY=prod_xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx234
MTN_MOMO_ENVIRONMENT=production
MTN_MOMO_TARGET_ENVIRONMENT=production
```

## Where to Find These Credentials

1. **Subscription Keys (Primary/Secondary):**
   - Log into [MTN Developer Portal](https://momodeveloper.mtn.com/)
   - Go to your Application
   - Navigate to "Products" → "Collections"
   - You'll see both Primary and Secondary Subscription Keys

2. **API User:**
   - In MTN Developer Portal, go to "API User"
   - Create a new API User or use existing one
   - The username you create is your `MTN_MOMO_API_USER`

3. **API Key:**
   - After creating API User, generate an API Key
   - This is your `MTN_MOMO_API_KEY`
   - **Important:** Copy and save this immediately - you can't view it again!

## Quick Reference

| MTN Portal Credential | Environment Variable | Notes |
|----------------------|---------------------|-------|
| Primary Subscription Key | `MTN_MOMO_SUBSCRIPTION_KEY` | Use Primary OR Secondary |
| Secondary Subscription Key | `MTN_MOMO_SUBSCRIPTION_KEY` | Use Primary OR Secondary |
| API User (username) | `MTN_MOMO_API_USER` | Username you created |
| API Key | `MTN_MOMO_API_KEY` | Key generated for API User |
| Environment | `MTN_MOMO_ENVIRONMENT` | `sandbox` or `production` |
| Target Environment | `MTN_MOMO_TARGET_ENVIRONMENT` | Usually same as `MTN_MOMO_ENVIRONMENT` |

## Important Notes

1. **Never commit credentials to version control**
   - Keep all credentials in `.env.local` (which is gitignored)
   - Never share credentials publicly

2. **Use different credentials for sandbox and production**
   - Sandbox credentials are for testing only
   - Production credentials are for real payments

3. **Subscription Key is interchangeable**
   - You can use Primary or Secondary - both work
   - Switch between them by changing `MTN_MOMO_SUBSCRIPTION_KEY`
   - Primary is recommended for production

4. **API User and API Key must match**
   - The API Key must be generated for the specific API User
   - They work together for Basic Authentication

## Troubleshooting

**Error: "MTN MoMo configuration is incomplete"**
- Check that all 4 credentials are set in `.env.local`
- Verify no typos in variable names

**Error: "Failed to get MTN MoMo access token"**
- Verify `MTN_MOMO_API_USER` and `MTN_MOMO_API_KEY` are correct
- Ensure API Key was generated for the API User
- Check that `MTN_MOMO_SUBSCRIPTION_KEY` is valid

**Error: "Invalid subscription key"**
- Verify you're using the correct subscription key (Primary or Secondary)
- Ensure environment matches (sandbox key for sandbox, production key for production)

