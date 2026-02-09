# Rommaana Developer API Reference

Welcome to the Rommaana API Reference. Rommaana is a leading Insurtech platform in Saudi Arabia, facilitating the interconnection between Insurance Companies (Insurers) and B2B Partners (Partners) to offer, manage, and sell a wide range of Insurance Products.

## 1. Getting Started

The Rommaana API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.

### API Base URLs
- **Staging**: `https://api.staging.rommaana.com`
- **Production**: `https://api.rommaana.com`
- **Local Development**: `http://localhost:8000` (Auth) and `http://localhost:8001` (Domain)

### Interactive Documentation
You can explore and test our APIs interactively using Swagger UI:
- **Auth Service**: `/docs`
- **Domain Service**: `/docs`

---

## 1.1. Security

Rommaana prioritizes the security of insurance data. All API communication must happen over HTTPS.

### Signing Algorithm
All tokens issued by Rommaana are signed using **RS256** (RSA Signature with SHA-256) or **ES256**. We provide a public JWKS (JSON Web Key Set) endpoint for signature verification at:
`GET /api/v1/auth/.well-known/jwks.json`

### Authentication Context (ACR/AMR)
We use ACR (Authentication Context Class Reference) to define the "strength" of a session:
- **AAL1**: Basic authentication (e.g., Email/Password).
- **AAL2**: Multi-Factor Authentication (MFA).
- **AAL3**: Hardware-backed or high-assurance authentication.

Certain sensitive operations (like binding a policy) may require a minimum ACR level of **AAL2**.

### DPoP Support
Demonstrating Proof-of-Possession (DPoP) is supported and may be required for specific high-value resource exchanges to prevent token replay attacks.

---

## 1.2. Authentication

Rommaana uses a multi-tiered token architecture to balance security and usability.

### Token Types

| Token | Name | Scope | Lifetime |
| :--- | :--- | :--- | :--- |
| **TST** | Tenant-Scoped Token | Grants access to tenant-wide operations. | 15 Minutes |
| **RST** | Resource-Scoped Token | Grants access to a specific resource (e.g., a specific Quote). | 5 Minutes |

### Authentication Flow

#### Step 1: Login
Authenticate with your Rommaana credentials to receive a TST.
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "partner@example.com",
  "password": "your-secure-password"
}
```

#### Step 2: Resource Access (TST to RST)
To perform actions on a specific resource (e.g., binding a policy), exchange your TST for an RST.
```http
POST /api/v1/auth/rst/exchange
Authorization: Bearer <TST>

{
  "resourceType": "policy",
  "resourceId": "uuid-here",
  "purpose": "bind"
}
```

---

## 1.3. General Implementation Notes

### Response Envelope
All API responses follow a standard JSON envelope:

```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-02-09T11:48:00Z"
}
```

### Naming Conventions
- **Fields**: All JSON fields use `camelCase`.
- **Resources**: Resource IDs are standard `UUID` v4 strings.
- **Dates**: All timestamps are returned in ISO 8601 format (UTC).

### HTTP Verbs
- `GET`: Retrieve a resource or list.
- `POST`: Create a new resource or perform an action.
- `PUT/PATCH`: Update an existing resource.
- `DELETE`: Remove a resource.

---

## 1.4. Limits and Errors

### Rate Limits
To ensure system stability, the following rate limits apply:
- **General APIs**: 60 requests per minute per identity.
- **Authentication (Login/Exchange)**: 10 requests per minute per identity.

### Session Limits
- **Max Sessions**: A single identity (user) is limited to **5 concurrent active sessions**.

### Standard Error Codes
When an error occurs, the `status` field will be `error`, and an `error` object will be provided:

| Code | Description |
| :--- | :--- |
| `invalid_tst` | The provided Tenant-Scoped Token is invalid or malformed. |
| `token_expired` | The token has expired. Please refresh or re-authenticate. |
| `acr_insufficient` | The operation requires a higher AAL level (e.g., MFA required). |
| `role_not_authorized` | Your user role does not have permission for this resource. |
| `validation_error` | The request body failed schema validation. |

---

## 1.5. Versioning

We use URI-based versioning to ensure backward compatibility.

### Current Version: `v1`
All production endpoints are prefixed with `/api/v1/`.

### Breaking Changes
We follow Semantic Versioning (SemVer). Breaking changes will result in a new major version (e.g., `/api/v2/`). Minor improvements and non-breaking additions are rolled out to the current version automatically.
