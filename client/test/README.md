# API Test Scripts (No UI)

Thu muc nay chua cac file test API chay doc lap bang Node, khong can mo giao dien.

## Yeu cau

- Da cai dependencies trong `client/` (`npm install`).
- Backend dang chay va truy cap duoc.

## Bien moi truong

- `API_BASE_URL`: default `http://localhost:8000/api`
- `API_TOKEN`: JWT Bearer token (can cho endpoint auth-protected)
- Bien test tuy chon: `TEST_PRODUCT_ID`, `TEST_ORDER_ID`, `TEST_USER_ID`, `TEST_VOUCHER_ID`, `TEST_REVIEW_ID`, `TEST_CART_ID`, `TEST_CATEGORY_ID`, `TEST_USERNAME`, `TEST_PASSWORD`

## Chay tung file

Tu thu muc `client/`:

```bash
node test/auth.test.mjs
node test/product.test.mjs
node test/category-navbar.test.mjs
node test/hello.test.mjs
node test/order.test.mjs
node test/voucher.test.mjs
node test/review.test.mjs
node test/cart.test.mjs
node test/user.test.mjs
```

## Vi du (PowerShell)

```powershell
$env:API_BASE_URL="http://localhost:8000/api"
$env:API_TOKEN="<your-jwt-token>"
node test/order.test.mjs
```

Moi file se in:

- HTTP status
- Payload rut gon
- Loi chi tiet neu fail
