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

# Room System

All Room endpoints require authentication through the `verifyJWT`
middleware. The authenticated identity is always taken from `req.user._id`.
Clients must not submit a user ID to identify the acting user.

Room capacity is server-controlled at **100 members**. Nearby discovery is
server-controlled at exactly **1000 meters**. Room locations are stored as
GeoJSON points, but exact coordinates are not returned to clients.

Room member identity is anonymous and generated per room using names such as
`Chugly_4821`. Real usernames, email addresses, and password hashes are not
returned by Room endpoints.

## 11. Create Room

**POST** `/rooms`

### Authentication

Required.

### Request Body

Public room:

``` json
{
  "name": "Sunday Morning Run",
  "visibility": "public",
  "latitude": 40.7484,
  "longitude": -73.9857
}
```

Private room:

``` json
{
  "name": "Private Study Group",
  "visibility": "private",
  "password": "StudyPassword123",
  "latitude": 40.7484,
  "longitude": -73.9857
}
```

Private-room passwords are hashed with IronPass and are never returned.
The creator is automatically added as the only admin and receives an
anonymous display name.

### Success

**201 Created**

The response includes the room summary and anonymous membership list. Exact
coordinates and password hashes are excluded.

------------------------------------------------------------------------

## 12. Discover Nearby Rooms

**GET** `/rooms/nearby?latitude=40.7484&longitude=-73.9857`

### Authentication

Required.

The endpoint returns public and private rooms within exactly 1000 meters,
ordered by distance. Private rooms are discoverable but require a password
to join.

### Success

**200 OK**

``` json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "room-id",
      "name": "Sunday Morning Run",
      "visibility": "public",
      "memberCount": 12,
      "maxMembers": 100,
      "distanceMeters": 328.4,
      "isFull": false,
      "isMember": false,
      "isAdmin": false
    }
  ],
  "message": "Nearby rooms retrieved successfully",
  "success": true
}
```

The API does not accept a client-controlled radius. Invalid coordinates are
rejected.

------------------------------------------------------------------------

## 13. Get My Rooms

**GET** `/rooms/mine`

### Authentication

Required.

Returns rooms where the authenticated user is currently a member. This
supports persistent membership after a client reload or new login.

------------------------------------------------------------------------

## 14. Get Room

**GET** `/rooms/:roomId`

### Authentication

Required.

Returns room metadata. Anonymous member data is returned to current room
members and admins. Non-members receive an empty `members` array.

------------------------------------------------------------------------

## 15. Join Room

**POST** `/rooms/:roomId/join`

### Authentication

Required.

Public-room request:

``` json
{}
```

Private-room request:

``` json
{
  "password": "StudyPassword123"
}
```

The join operation atomically checks capacity and membership before adding
one member. A room cannot exceed 100 members. Repeating a join for a user
who is already a member is idempotent and returns the existing membership.

### Errors

- `403` — Invalid private-room password
- `409` — Room is full

------------------------------------------------------------------------

## 16. Leave Room

**POST** `/rooms/:roomId/leave`

### Authentication

Required.

A normal member is removed from the embedded membership list. The member
count is decremented atomically.

The creator cannot leave while other members remain. If the creator is the
only member, leaving closes and deletes the room because v1 has no admin
transfer functionality.

------------------------------------------------------------------------

## 17. Remove Room Member

**DELETE** `/rooms/:roomId/members/:membershipId`

### Authentication

Required. Only the room creator can remove members.

The creator cannot remove themselves. The removed member is deleted from the
embedded membership list and the member count is decremented atomically.

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
  `/rooms`                                  POST     Required
  `/rooms/nearby`                           GET      Required
  `/rooms/mine`                             GET      Required
  `/rooms/:roomId`                          GET      Required
  `/rooms/:roomId/join`                     POST     Required
  `/rooms/:roomId/leave`                    POST     Required
  `/rooms/:roomId/members/:membershipId`    DELETE   Required

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

### Room Creation

``` text
name
visibility
password (private rooms only)
latitude
longitude
```

### Nearby Room Discovery

``` text
latitude
longitude
```

Room discovery always uses the server-controlled 1000-meter radius.

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
10. Room capacity is controlled by the backend and is limited to 100 members.
11. Room discovery is controlled by the backend and is limited to 1000 meters.
12. Room passwords are hashed with IronPass and `passwordHash` is never
    returned.
13. Room members are represented by anonymous per-room display names.
14. Room endpoints use `req.user._id` and require `verifyJWT`.

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

## Room System

-   Create Room --- Complete
-   Nearby Discovery --- Complete
-   Join and Leave --- Complete
-   Admin Member Removal --- Complete

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
