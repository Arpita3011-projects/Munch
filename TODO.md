# Orders Feature Implementation

## Backend Steps
- [x] 1. Add `getOrdersByUser(userId)` method to `orderService.js`
- [x] 2. Add `getOrders` controller to `orderController.js`
- [x] 3. Add `GET /` route to `orders.js`

## Frontend Steps
- [x] 4. Implement `OrdersPage.jsx` — list all user orders
- [x] 5. Implement `OrderDetailPage.jsx` — full order details

## Re-order Feature (P1)
- [x] 1. Create `useReorder.js` hook — fetches menu data, deduplicates, preserves quantity/size/add-ons, skips unavailable items
- [x] 2. Add Re-order button to `OrdersPage.jsx` — shown for every order except cancelled, with loading/success/error states
- [x] 3. Add Re-order button to `OrderDetailPage.jsx` — navigates to `/cart` on success after 1.5s delay
- [x] 4. Build passes with 0 errors and 0 warnings (verified)

## Verification
- [x] 6. Verify checkout creates an order
- [x] 7. Build passes with no errors
- [ ] 8. Verify clicking an order opens detail page (manual)
- [ ] 9. Verify refreshing detail page still works (manual)
- [ ] 10. Verify no console errors or React warnings (manual)
- [ ] 11. Verify Re-order button works on OrdersPage (manual)
- [ ] 12. Verify Re-order button works on OrderDetailPage (manual)
- [ ] 13. Verify unavailable items are skipped gracefully (manual)
- [ ] 14. Verify cancelled order does not show Re-order button (manual)

