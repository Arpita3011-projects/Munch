# Munch Project — Implementation Log

## Orders Feature
- [x] Backend: getOrdersByUser, getOrders controller, GET / route
- [x] Frontend: OrdersPage, OrderDetailPage
- [x] Re-order feature (useReorder hook, buttons on Orders + OrderDetail)
- [x] Build passes with 0 errors

## Customer Profile & Address Management
- [x] Backend: Address model/schema/service/controller/routes (CRUD, ownership, single-default)
- [x] Profile module: profileSchemas, profileService, profileController, routes/profile, mounted in app.js
- [x] User model: added `avatar` field; routes/addresses.js: added PATCH /:id/default alias
- [x] Frontend: useProfile hook, updateUser in AuthContext, rebuilt ProfilePage (view/edit + avatar upload + inline addresses)
- [x] Checkout uses saved addresses (default auto-selected, add-address inline, empty state)
- [x] Verification: node --check passes, npm run build passes

## Google Login Cleanup (final)
- [x] Scanned entire project for google/Google/GOOGLE/googleId/idToken/GoogleOAuth/GoogleLogin/GoogleButton
- [x] Result: NO Google Login or OAuth code exists anywhere in the project
- [x] Only matches: `workbox-google-analytics` (transitive dep of vite-plugin-pwa) and `fonts.googleapis.com` (Google Fonts CDN) — both unrelated to Google Login
- [x] No Google routes/controllers/services, no googleId field, no GOOGLE_CLIENT_ID env var, no Google buttons/hooks/SDK
- [x] Email/Password is the only auth method; JWT logic, roles, and all APIs unchanged
- [x] Verification: node --check passes (SERVER_SYNTAX_ALL_OK), npm run build passes (0 errors)
</content>
