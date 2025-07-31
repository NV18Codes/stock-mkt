# Backend Specifications for Broker Authentication Flow

## Overview
This document provides detailed specifications for implementing the broker authentication flow with TOTP and MPIN verification. The frontend is now ready and requires these backend endpoints to function properly.

## Authentication Flow

### Step 1: Initial Broker Connection
**Endpoint**: `POST /api/users/me/broker/connect`

**Request Body**:
```json
{
  "broker": "Angel One",
  "clientId": "string",
  "password": "string"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "unique_session_id",
    "message": "Credentials verified successfully",
    "nextStep": "TOTP_REQUIRED"
  },
  "message": "Broker connection initiated"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid credentials format
- `401 Unauthorized`: Invalid client ID or password
- `403 Forbidden`: Account locked or suspended
- `500 Internal Server Error`: Server error

### Step 2: TOTP Verification
**Endpoint**: `POST /api/users/me/broker/verify-totp`

**Request Body**:
```json
{
  "sessionId": "session_id_from_step_1",
  "totp": "123456"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "same_session_id",
    "message": "TOTP verified successfully",
    "nextStep": "MPIN_REQUIRED"
  },
  "message": "TOTP verification successful"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid TOTP format (not 6 digits)
- `401 Unauthorized`: Invalid TOTP code
- `403 Forbidden`: Session expired
- `429 Too Many Requests`: Too many TOTP attempts
- `500 Internal Server Error`: Server error

### Step 3: MPIN Verification
**Endpoint**: `POST /api/users/me/broker/verify-mpin`

**Request Body**:
```json
{
  "sessionId": "session_id_from_previous_steps",
  "mpin": "1234"
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "same_session_id",
    "message": "MPIN verified successfully",
    "connectionStatus": "CONNECTED",
    "brokerProfile": {
      "brokerName": "Angel One",
      "accountId": "ACTUAL_ACCOUNT_ID",
      "status": "ACTIVE",
      "lastSync": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Broker connection completed successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid MPIN format (not 4 digits)
- `401 Unauthorized`: Invalid MPIN
- `403 Forbidden`: Session expired or account locked
- `429 Too Many Requests`: Too many MPIN attempts
- `500 Internal Server Error`: Server error

## Session Management

### Session Requirements
- **Session ID**: Unique identifier for each authentication attempt
- **Expiration**: 10 minutes from creation
- **State Tracking**: Track current step (CREDENTIALS_VERIFIED, TOTP_VERIFIED, MPIN_VERIFIED)
- **Security**: Store session data securely with encryption

### Session Storage
```json
{
  "sessionId": "unique_id",
  "userId": "user_id",
  "broker": "Angel One",
  "clientId": "encrypted_client_id",
  "currentStep": "TOTP_REQUIRED",
  "createdAt": "2024-01-15T10:00:00Z",
  "expiresAt": "2024-01-15T10:10:00Z",
  "attempts": {
    "totp": 0,
    "mpin": 0
  }
}
```

## Security Requirements

### Rate Limiting
- **TOTP Attempts**: Maximum 3 attempts per session
- **MPIN Attempts**: Maximum 3 attempts per session
- **Session Creation**: Maximum 5 sessions per user per hour
- **IP-based Limits**: Maximum 10 authentication attempts per IP per hour

### Data Protection
- **Password**: Never store in plain text, use secure hashing
- **MPIN**: Encrypt before storage
- **Session Data**: Encrypt sensitive information
- **Logging**: Log authentication attempts without sensitive data

### Validation Rules

#### Client ID
- **Format**: Alphanumeric, 8-20 characters
- **Validation**: Must be valid broker client ID format

#### Password
- **Length**: Minimum 8 characters
- **Complexity**: At least one uppercase, one lowercase, one number
- **Special Characters**: Optional but recommended

#### TOTP
- **Format**: Exactly 6 digits (0-9)
- **Validation**: Must be valid TOTP for the user's authenticator app
- **Time Window**: Accept TOTP within ±30 seconds of current time

#### MPIN
- **Format**: Exactly 4 digits (0-9)
- **Validation**: Must match user's registered MPIN
- **Case Sensitivity**: Not applicable (digits only)

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "details": "Technical details for debugging"
  },
  "data": null
}
```

### Error Codes
- `INVALID_CREDENTIALS`: Wrong client ID or password
- `INVALID_TOTP`: Wrong TOTP code
- `INVALID_MPIN`: Wrong MPIN
- `SESSION_EXPIRED`: Session has expired
- `TOO_MANY_ATTEMPTS`: Rate limit exceeded
- `ACCOUNT_LOCKED`: Account temporarily locked
- `BROKER_ERROR`: Broker API error
- `VALIDATION_ERROR`: Input validation failed

## Integration with Broker APIs

### Angel One Integration
- **Base URL**: `https://apiconnect.angelone.in/rest`
- **Authentication**: Use provided credentials to authenticate with Angel One
- **Error Mapping**: Map broker-specific errors to standard error codes
- **Timeout**: 30 seconds for broker API calls

### Required Broker API Calls
1. **Login**: `/auth/angelbroking/user/v1/loginByPassword`
2. **TOTP Verification**: `/secure/angelbroking/user/v1/verifyTOTP`
3. **MPIN Verification**: `/secure/angelbroking/user/v1/verifyMPIN`
4. **Profile Fetch**: `/secure/angelbroking/user/v1/getProfile`

## Database Schema

### Broker Connections Table
```sql
CREATE TABLE broker_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  broker VARCHAR(50) NOT NULL,
  client_id VARCHAR(100) NOT NULL,
  account_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  encrypted_credentials TEXT,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, broker)
);
```

### Authentication Sessions Table
```sql
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  broker VARCHAR(50) NOT NULL,
  current_step VARCHAR(20) NOT NULL,
  encrypted_data TEXT,
  attempts JSONB DEFAULT '{"totp": 0, "mpin": 0}',
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_session_id (session_id),
  INDEX idx_expires_at (expires_at)
);
```

## Testing Requirements

### Unit Tests
- Validate input formats (TOTP, MPIN, Client ID)
- Test session expiration logic
- Test rate limiting functionality
- Test error handling for all scenarios

### Integration Tests
- Test complete authentication flow
- Test with real broker APIs (sandbox environment)
- Test session management
- Test concurrent authentication attempts

### Security Tests
- Test rate limiting effectiveness
- Test session security
- Test data encryption
- Test input validation and sanitization

## Monitoring and Logging

### Required Logs
- Authentication attempts (success/failure)
- Session creation and expiration
- Rate limit violations
- Broker API errors
- Performance metrics

### Metrics to Track
- Authentication success rate
- Average authentication time
- Error rates by type
- Session usage patterns
- Broker API response times

## Deployment Considerations

### Environment Variables
```
BROKER_SESSION_SECRET=your_secret_key
BROKER_RATE_LIMIT_TOTP=3
BROKER_RATE_LIMIT_MPIN=3
BROKER_SESSION_TIMEOUT=600
ANGEL_ONE_API_URL=https://apiconnect.angelone.in/rest
```

### Health Checks
- Database connectivity
- Broker API connectivity
- Session storage availability
- Rate limiting functionality

## Frontend Integration Notes

### Current Frontend State
The frontend is already implemented with:
- Multi-step form with progress indicator
- Real-time validation
- Error handling and user feedback
- Session management
- Professional UI with animations

### Expected Behavior
1. User enters credentials → Step 1
2. Backend validates credentials → Returns session ID
3. User enters TOTP → Step 2
4. Backend validates TOTP → Returns success
5. User enters MPIN → Step 3
6. Backend validates MPIN → Returns broker profile
7. Connection complete → Form closes, profile updated

### Error Handling
- Display specific error messages for each step
- Allow users to go back to previous steps
- Reset form on critical errors
- Show loading states during API calls

## Implementation Priority

### Phase 1 (Critical)
1. Basic authentication endpoints
2. Session management
3. Input validation
4. Error handling

### Phase 2 (Important)
1. Rate limiting
2. Security enhancements
3. Monitoring and logging
4. Performance optimization

### Phase 3 (Nice to Have)
1. Advanced security features
2. Analytics and reporting
3. Multi-broker support
4. Advanced error recovery

## Contact Information
For any questions or clarifications regarding this specification, please contact the frontend development team.

---

**Note**: This specification is based on the current frontend implementation. Any changes to the API structure should be communicated to the frontend team to ensure proper integration. 