# Chugly API Contract

## Overview

This document defines the current Chugly backend API contract for the
Web and Mobile frontends.

**Base URL (development):** `http://localhost:3000/api/v1`

> The backend is the source of truth. Frontend applications should use
> these existing endpoints and request/response formats rather than
> inventing new ones.

------------------------------------------------------------------------

# Authentication

## 1. Register

**POST** `/auth/register`

### Request Body

``` json
{
  "email": "user@example.com",
  "username": "username",
  "password": "Password123"
}
```

### Success

**201 Created**

Creates the user and starts the email-verification flow.

------------------------------------------------------------------------

## 2. Login

**POST** `/auth/login`

### Request Body

``` json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Success

**200 OK**

The server generates an access token and refresh token and sets them in
cookies.

### Frontend notes

For Web, requests that need cookies should use:

``` ts
withCredentials: true
```

The backend uses HttpOnly cookies. In development they are usable over
`http://localhost`; in production they are marked `secure`. Do not store
HttpOnly authentication cookies in `localStorage`.

------------------------------------------------------------------------

## 3. Logout

**POST** `/auth/logout`

### Authentication

Required.

### Success

**200 OK**

Clears the authentication cookies and invalidates the stored refresh
token.

------------------------------------------------------------------------

## 4. Refresh Access Token

**POST** `/auth/refresh-access-token`

### Authentication

Uses the refresh token cookie.

### Success

**200 OK**

Generates a new access token and refresh token.

------------------------------------------------------------------------

## 5. Get Current User

**POST** `/auth/current-user`

### Authentication

Required.

### Success

**200 OK**

Returns the currently authenticated user.

------------------------------------------------------------------------

# Email Verification

## 6. Verify Email

**POST** `/auth/verify-email/:verificationToken`

### URL Parameter

`verificationToken`

Example:

``` text
/auth/verify-email/abc123
```

### Success

**200 OK**

``` text
Email verified successfully
```

The verification token is then invalidated.

### Web email flow

The backend sends verification links to the Web application rather than
posting directly to the API. Configure `WEB_APP_URL` to the Web origin
(for example, `http://localhost:5173`). The Web route should be:

``` text
/verify-email/:verificationToken
```

When opened, that Web page should send the `POST` request documented above.

------------------------------------------------------------------------

## 7. Resend Email Verification

**POST** `/auth/resend-email-verification`

### Authentication

Required.

### Success

**200 OK**

``` text
Verification email resent successfully
```

------------------------------------------------------------------------

# Password Management

## 8. Change Current Password

**POST** `/auth/change-current-password`

### Authentication

Required.

### Request Body

``` json
{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

### Success

**200 OK**

``` text
Password changed successfully
```

------------------------------------------------------------------------

## 9. Forgot Password

**POST** `/auth/forgot-password`

### Authentication

Not required.

### Request Body

``` json
{
  "email": "user@example.com"
}
```

### Success

**200 OK**

``` text
Password reset email sent successfully
```

The backend generates a temporary reset token and sends it through
email. Configure `FORGOT_PASSWORD_REDIRECT_URL` to the Web reset route,
for example `http://localhost:5173/reset-password`. If it is not set,
the backend uses `${WEB_APP_URL}/reset-password`.

The Web route should be `/reset-password/:resetToken`. The Web reset page
receives the token in its URL and sends the `POST` request documented below.

------------------------------------------------------------------------

## 10. Reset Password

**POST** `/auth/reset-forgot-password/:resetToken`

### Authentication

Not required.

### URL Parameter

`resetToken`

Example:

``` text
/auth/reset-forgot-password/abc123
```

### Request Body

``` json
{
  "newPassword": "NewPassword456"
}
```

### Success

**200 OK**

``` text
Password reset successfully
```

The reset token is invalidated after successful use.

------------------------------------------------------------------------

# Authentication Model

Chugly uses access and refresh tokens.

``` text
Login
  ↓
Access Token + Refresh Token
  ↓
HttpOnly Cookies
```

Protected request:

``` text
Frontend
   ↓
Access Token
   ↓
verifyJWT middleware
   ↓
req.user
   ↓
Controller
```

When the access token expires:

``` text
Frontend
   ↓
POST /auth/refresh-access-token
   ↓
Refresh Token
   ↓
New Access Token
```

------------------------------------------------------------------------

# Protected vs Public Endpoints

  Endpoint                                  Method   Authentication
  ----------------------------------------- -------- ----------------
  `/auth/register`                          POST     Public
  `/auth/login`                             POST     Public
  `/auth/logout`                            POST     Required
  `/auth/refresh-access-token`                     POST     Refresh token
  `/auth/current-user`                      POST      Required
  `/auth/verify-email/:verificationToken`   POST     Public
  `/auth/resend-email-verification`         POST     Required
  `/auth/change-current-password`                   POST     Required
  `/auth/forgot-password`                   POST     Public
  `/auth/reset-forgot-password/:resetToken`        POST     Public

------------------------------------------------------------------------

# Standard Response Format

Chugly currently uses the following response structure:

``` json
{
  "statusCode": 200,
  "data": {},
  "message": "Success message",
  "success": true
}
```

Example:

``` json
{
  "statusCode": 200,
  "data": {},
  "message": "Password reset successfully",
  "success": true
}
```

The success messages shown in individual endpoint sections are the
`message` field of this JSON response.

Errors use the same top-level fields with `success: false`, `data: null`,
and an `errors` array:

``` json
{
  "statusCode": 422,
  "data": null,
  "message": "Received data is not valid",
  "success": false,
  "errors": [
    {
      "email": "Please provide a valid email address"
    }
  ]
}
```

------------------------------------------------------------------------

# Validation

Frontend should validate basic input before making requests, but the
backend remains authoritative.

Current important fields include:

### Login

``` text
email
password
```

### Register

``` text
email
username
password
```

### Forgot Password

``` text
email
```

### Change Password

``` text
oldPassword
newPassword
```

### Reset Password

``` text
newPassword
```

------------------------------------------------------------------------

# Frontend Integration Rules

## Web

Recommended stack:

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   Axios
-   React Router

For cookie-based authentication:

``` ts
axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true
});
```

## Mobile

Recommended stack:

-   React Native
-   TypeScript
-   Expo
-   Axios

The mobile application uses the same backend API but may require a
platform-specific authentication/token-storage implementation.

------------------------------------------------------------------------

# Important Rules

1.  Do not invent authentication endpoints.
2.  Do not rename existing request fields without changing the backend
    contract intentionally.
3.  Do not store Web HttpOnly authentication cookies in `localStorage`.
4.  Do not expose password hashes to the frontend.
5.  Protected endpoints require authentication.
6.  The backend is the source of truth for authentication and
    authorization.
7.  Web and Mobile may have completely different UI implementations
    while using the same API.
8.  Backend bug fixes and security improvements are allowed without
    changing the API contract.
9.  Any intentional API breaking change should be documented and
    versioned.

------------------------------------------------------------------------

# Current Development Status

## Authentication

-   Register --- Complete
-   Login --- Complete
-   Logout --- Complete
-   Refresh Access Token --- Complete
-   Current User --- Complete
-   Email Verification --- Complete
-   Resend Verification --- Complete
-   Change Password --- Complete
-   Forgot Password --- Complete
-   Reset Password --- Complete

## Clients

-   Web frontend --- Not started
-   Android frontend --- Not started
-   iOS frontend --- Not started

------------------------------------------------------------------------

# Next Development Phase

1.  Build the Web frontend.
2.  Connect authentication to the existing API.
3.  Build the core Chugly product features.
4.  Build the Mobile frontend.
5.  Test both clients against the same backend.
6.  Deploy the backend and clients.
