# MTN MoMo API Key vs Subscription Key - Explained

## Important: They Are NOT the Same!

The **Subscription Key** and **API Key** are **completely different** and serve different purposes in MTN MoMo authentication.

## What Each Key Does

### 1. Subscription Key (Primary/Secondary)

- **Purpose:** Identifies your application/product subscription
- **Where:** Found in MTN Developer Portal → Products → Collections
- **Used for:** API endpoint access (sent in `Ocp-Apim-Subscription-Key` header)
- **Example:** `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

### 2. API Key

- **Purpose:** Authenticates your API User (for Basic Auth)
- **Where:** Generated in MTN Developer Portal → API User → Generate API Key
- **Used for:** Getting access tokens (used with API User for Basic Auth)
- **Example:** `xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx234`

## Authentication Flow

MTN MoMo uses a **two-step authentication** process:

### Step 1: Get Access Token (Uses API User + API Key)

```
POST /collection/token/
Headers:
  Authorization: Basic <base64(apiUser:apiKey)>
  Ocp-Apim-Subscription-Key: <subscription_key>
```

### Step 2: Make API Calls (Uses Access Token + Subscription Key)

```
POST /collection/v1_0/requesttopay
Headers:
  Authorization: Bearer <access_token>
  Ocp-Apim-Subscription-Key: <subscription_key>
```

## What Happens If You Don't Have an API Key?

### ❌ Without API Key:

1. **Cannot get access token** - Step 1 fails
2. **Cannot make payment requests** - Step 2 never happens
3. **Error:** "Failed to get MTN MoMo access token"
4. **Error:** "401 Unauthorized" or "403 Forbidden"

### ✅ With API Key:

1. **Can get access token** - Step 1 succeeds
2. **Can make payment requests** - Step 2 succeeds
3. **Payment flow works correctly**

## How to Generate API Key

### Step-by-Step:

1. **Log into MTN Developer Portal**

   - Go to [https://momodeveloper.mtn.com/](https://momodeveloper.mtn.com/)

2. **Navigate to API User**

   - Click on "API User" in the menu
   - If you don't have one, create a new API User first

3. **Generate API Key**

   - Find your API User
   - Click "Generate API Key" or "Create API Key"
   - **IMPORTANT:** Copy the key immediately - you can't view it again!

4. **Save the API Key**
   - Store it securely in `.env.local`
   - Never commit it to version control

## Common Mistakes

### ❌ Mistake 1: Using Subscription Key as API Key

```env
# WRONG - This won't work!
MTN_MOMO_API_KEY=your_subscription_key_here
```

**Result:** Authentication fails because API Key format/validation is different

### ❌ Mistake 2: Not Generating API Key

```env
# WRONG - Missing API Key
MTN_MOMO_SUBSCRIPTION_KEY=your_subscription_key
MTN_MOMO_API_USER=your_api_user
MTN_MOMO_API_KEY=  # Empty or missing
```

**Result:** Cannot authenticate, all API calls fail

### ✅ Correct Configuration

```env
# CORRECT - All three are different
MTN_MOMO_SUBSCRIPTION_KEY=abc123def456...  # From Products → Collections
MTN_MOMO_API_USER=my_api_user_123          # Username you created
MTN_MOMO_API_KEY=xyz789abc123...           # Generated for API User
```

## Verification Checklist

Before using MTN MoMo API, ensure you have:

- [ ] **Subscription Key** (Primary or Secondary) from Products → Collections
- [ ] **API User** created in API User section
- [ ] **API Key** generated for that API User
- [ ] All three are **different values** (not the same!)
- [ ] All three are saved in `.env.local`

## Testing Your Credentials

You can test if your credentials work by checking the token endpoint:

```bash
# Test Basic Auth (API User + API Key)
curl -X POST \
  https://sandbox.momodeveloper.mtn.com/collection/token/ \
  -H "Authorization: Basic <base64(apiUser:apiKey)>" \
  -H "Ocp-Apim-Subscription-Key: <subscription_key>"
```

If successful, you'll get an access token. If not, check:

- API User is correct
- API Key is correct (and was generated for this API User)
- Subscription Key is correct

## Summary

| Credential           | Purpose             | Where to Get           | Required? |
| -------------------- | ------------------- | ---------------------- | --------- |
| **Subscription Key** | API endpoint access | Products → Collections | ✅ Yes    |
| **API User**         | Basic Auth username | API User section       | ✅ Yes    |
| **API Key**          | Basic Auth password | Generate for API User  | ✅ Yes    |

**All three are required and must be different values!**

## Troubleshooting

**Error: "Failed to get MTN MoMo access token"**

- ✅ Check API User is correct
- ✅ Check API Key is correct (not subscription key!)
- ✅ Verify API Key was generated for this API User
- ✅ Check Subscription Key is correct

**Error: "401 Unauthorized"**

- ✅ API User and API Key don't match
- ✅ API Key might be wrong or expired
- ✅ Regenerate API Key if needed

**Error: "403 Forbidden"**

- ✅ Subscription Key is wrong
- ✅ Wrong environment (sandbox vs production)
- ✅ Product not subscribed (Collections)
