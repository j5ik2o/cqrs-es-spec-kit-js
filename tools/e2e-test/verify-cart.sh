#!/usr/bin/env bash

set -ue

EXECUTOR_ID=${EXECUTOR_ID:-UserAccount-01H42K4ABWQ5V2XQEP3A48VE0Z}
WRITE_API_SERVER_BASE_URL=${WRITE_API_SERVER_BASE_URL:-http://localhost:38080}
READ_API_SERVER_BASE_URL=${READ_API_SERVER_BASE_URL:-http://localhost:38082}

# Cart作成
echo -e "\nCreate Cart(${EXECUTOR_ID}):"
CREATE_CART_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${WRITE_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{
  "query": "mutation CreateCart(\$input: CreateCartInput!) { createCart(input: \$input) { cartId } }",
  "variables": {
    "input": {
      "name": "Cart Example",
      "executorId": "${EXECUTOR_ID}"
    }
  }
}
EOS
)

if echo $CREATE_CART_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $CREATE_CART_RESULT"
  exit 1
fi

echo "Result: $CREATE_CART_RESULT"

CART_ID=$(echo $CREATE_CART_RESULT | jq -r .data.createCart.cartId)

# アイテム追加
echo -e "\nAdd Item to Cart(${CART_ID}, ${EXECUTOR_ID}):"
ADD_ITEM_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${WRITE_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{
  "query": "mutation AddItemToCart(\$input: AddItemToCartInput!) { addItemToCart(input: \$input) { cartId, itemId } }",
  "variables": {
    "input": {
      "cartId": "${CART_ID}",
      "name": "Item 1",
      "quantity": 2,
      "price": 1000,
      "executorId": "${EXECUTOR_ID}"
    }
  }
}
EOS
)

if echo $ADD_ITEM_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $ADD_ITEM_RESULT"
  exit 1
fi

echo "Result: $ADD_ITEM_RESULT"

ITEM_ID=$(echo $ADD_ITEM_RESULT | jq -r .data.addItemToCart.itemId)

# 2つ目のアイテム追加
echo -e "\nAdd Second Item to Cart(${CART_ID}, ${EXECUTOR_ID}):"
ADD_ITEM_2_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${WRITE_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{
  "query": "mutation AddItemToCart(\$input: AddItemToCartInput!) { addItemToCart(input: \$input) { cartId, itemId } }",
  "variables": {
    "input": {
      "cartId": "${CART_ID}",
      "name": "Item 2",
      "quantity": 3,
      "price": 2000,
      "executorId": "${EXECUTOR_ID}"
    }
  }
}
EOS
)

if echo $ADD_ITEM_2_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $ADD_ITEM_2_RESULT"
  exit 1
fi

echo "Result: $ADD_ITEM_2_RESULT"

ITEM_ID_2=$(echo $ADD_ITEM_2_RESULT | jq -r .data.addItemToCart.itemId)

# Wait for Lambda to process DynamoDB Stream events
echo -e "\nWaiting for read model to be updated by Lambda..."
sleep 5

# Cart取得
echo -e "\nGet Cart(${CART_ID}):"
GET_CART_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${READ_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{ "query": "{ getCart(cartId: \"${CART_ID}\") { id, name, deleted, createdAt, updatedAt } }" }
EOS
)

if echo $GET_CART_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $GET_CART_RESULT"
  exit 1
fi

echo "Result: $GET_CART_RESULT"

# Cartリスト取得
echo -e "\nGet Carts:"
GET_CARTS_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${READ_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{ "query": "{ getCarts { id, name, deleted, createdAt, updatedAt } }" }
EOS
)

if echo $GET_CARTS_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $GET_CARTS_RESULT"
  exit 1
fi

echo "Result: $GET_CARTS_RESULT"

# CartItem取得
echo -e "\nGet CartItem(${ITEM_ID}):"
GET_CART_ITEM_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${READ_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{ "query": "{ getCartItem(cartItemId: \"${ITEM_ID}\") { id, cartId, name, quantity, price, createdAt, updatedAt } }" }
EOS
)

if echo $GET_CART_ITEM_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $GET_CART_ITEM_RESULT"
  exit 1
fi

echo "Result: $GET_CART_ITEM_RESULT"

# CartItemリスト取得
echo -e "\nGet CartItems(${CART_ID}):"
GET_CART_ITEMS_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${READ_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{ "query": "{ getCartItems(cartId: \"${CART_ID}\") { id, cartId, name, quantity, price, createdAt, updatedAt } }" }
EOS
)

if echo $GET_CART_ITEMS_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $GET_CART_ITEMS_RESULT"
  exit 1
fi

echo "Result: $GET_CART_ITEMS_RESULT"

# アイテム削除
echo -e "\nRemove Item from Cart(${CART_ID}, ${ITEM_ID}, ${EXECUTOR_ID}):"
REMOVE_ITEM_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${WRITE_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{
  "query": "mutation RemoveItemFromCart(\$input: RemoveItemFromCartInput!) { removeItemFromCart(input: \$input) { cartId } }",
  "variables": {
    "input": {
      "cartId": "${CART_ID}",
      "itemId": "${ITEM_ID}",
      "executorId": "${EXECUTOR_ID}"
    }
  }
}
EOS
)

if echo $REMOVE_ITEM_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $REMOVE_ITEM_RESULT"
  exit 1
fi

echo "Result: $REMOVE_ITEM_RESULT"

# Wait for Lambda to process DynamoDB Stream events
echo -e "\nWaiting for read model to be updated by Lambda..."
sleep 5

# CartItemリスト再取得（1つ減っているはず）
echo -e "\nGet CartItems After Removal(${CART_ID}):"
GET_CART_ITEMS_AFTER_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${READ_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{ "query": "{ getCartItems(cartId: \"${CART_ID}\") { id, cartId, name, quantity, price, createdAt, updatedAt } }" }
EOS
)

if echo $GET_CART_ITEMS_AFTER_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $GET_CART_ITEMS_AFTER_RESULT"
  exit 1
fi

echo "Result: $GET_CART_ITEMS_AFTER_RESULT"

# Cart削除
echo -e "\nDelete Cart(${CART_ID}, ${EXECUTOR_ID}):"
DELETE_CART_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${WRITE_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{
  "query": "mutation DeleteCart(\$input: DeleteCartInput!) { deleteCart(input: \$input) { cartId } }",
  "variables": {
    "input": {
      "cartId": "${CART_ID}",
      "executorId": "${EXECUTOR_ID}"
    }
  }
}
EOS
)

if echo $DELETE_CART_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $DELETE_CART_RESULT"
  exit 1
fi

echo "Result: $DELETE_CART_RESULT"

# Wait for Lambda to process DynamoDB Stream events
echo -e "\nWaiting for read model to be updated by Lambda..."
sleep 5

# Cart取得（deletedがtrueになっているはず）
echo -e "\nGet Deleted Cart(${CART_ID}):"
GET_DELETED_CART_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${READ_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{ "query": "{ getCart(cartId: \"${CART_ID}\") { id, name, deleted, createdAt, updatedAt } }" }
EOS
)

if echo $GET_DELETED_CART_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $GET_DELETED_CART_RESULT"
  exit 1
fi

echo "Result: $GET_DELETED_CART_RESULT"

echo -e "\n✅ All E2E tests passed!"
