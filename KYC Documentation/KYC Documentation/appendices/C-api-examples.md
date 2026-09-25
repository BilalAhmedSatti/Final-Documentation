# Appendix C — API Examples

> Fictional data only. CNIC-shaped numbers are fake.

## Start KYC

`POST /kyc/applications`

```http
Idempotency-Key: 9f3c2a1b-0001
Authorization: Bearer <token>
Content-Type: application/json

{
  "channel": "MOBILE_ANDROID",
  "productCode": "CONVENTIONAL_SAVINGS",
  "device": {
    "deviceIdHash": "ab12...",
    "os": "Android 15",
    "appVersion": "1.0.0"
  }
}
```

```json
{
  "applicationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "trackingId": "TRK-20260912-8F2K",
  "state": "INITIATED",
  "tatPolicyDays": 2
}
```

## Submit identity

`POST /kyc/applications/{id}/identity`

```json
{
  "idType": "CNIC",
  "idNumber": "35202-1234567-1",
  "issueDate": "2019-04-15",
  "expiryDate": "2029-04-15",
  "fullName": "ALI RAZA",
  "fatherSpouseName": "AHMED RAZA",
  "motherMaidenName": "FATIMA",
  "dateOfBirth": "1992-08-20",
  "placeOfBirth": "LAHORE",
  "gender": "M"
}
```

## Verify identity

`POST /kyc/applications/{id}/identity/verify`

```json
{
  "preferredMethod": "AUTO"
}
```

```json
{
  "verificationId": "v-998877",
  "status": "IN_PROGRESS",
  "nextAction": "CAPTURE_BIOMETRIC"
}
```

## Biometric verification

`POST /kyc/applications/{id}/biometric/verify`

```json
{
  "sessionId": "bio-sess-441",
  "modality": "FINGER"
}
```

```json
{
  "status": "SUCCESS",
  "assuranceLevel": "BV_NADRA",
  "attemptsRemaining": 2,
  "fallbackAvailable": true
}
```

## Screening

`POST /kyc/applications/{id}/screen`

```json
{
  "lists": ["SANCTIONS", "PEP", "WATCHLIST"]
}
```

```json
{
  "screeningBatchId": "scr-55",
  "statuses": [
    {"type": "SANCTIONS", "status": "CLEAR"},
    {"type": "PEP", "status": "CLEAR"},
    {"type": "WATCHLIST", "status": "CLEAR"}
  ]
}
```

## Risk assessment

```json
{
  "riskRating": "LOW",
  "eddRequired": false,
  "score": 0.18,
  "modelVersion": "crp-2026.1",
  "factors": [
    {"code": "CHANNEL_DIGITAL", "contribution": 0.05},
    {"code": "BV_ASSURANCE", "contribution": -0.04}
  ]
}
```

## Decision

```json
{
  "decision": "APPROVE",
  "reasonCodes": ["STP_LOW_RISK"],
  "restrictions": []
}
```

## Status

`GET /kyc/applications/{id}`

```json
{
  "applicationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "trackingId": "TRK-20260912-8F2K",
  "state": "APPROVED",
  "nextSteps": ["ACCOUNT_PROVISIONING"],
  "restrictionFlags": []
}
```

## KYC refresh

`POST /kyc/customers/{customerId}/refresh`

```json
{
  "reason": "PERIODIC",
  "channel": "MOBILE_ANDROID"
}
```

```json
{
  "refreshApplicationId": "r-123",
  "state": "REFRESH_DUE"
}
```

## Error example

```json
{
  "type": "https://bank.example/errors/conflict",
  "title": "Illegal state transition",
  "status": 409,
  "detail": "Cannot screen while state=IDENTITY_CAPTURED",
  "currentState": "IDENTITY_CAPTURED",
  "correlationId": "c-901"
}
```
