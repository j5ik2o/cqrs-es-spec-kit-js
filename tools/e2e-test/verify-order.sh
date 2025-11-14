#!/usr/bin/env bash

set -ue

EXECUTOR_ID=${EXECUTOR_ID:-UserAccount-01H42K4ABWQ5V2XQEP3A48VE0Z}
WRITE_API_SERVER_BASE_URL=${WRITE_API_SERVER_BASE_URL:-http://localhost:38080}
READ_API_SERVER_BASE_URL=${READ_API_SERVER_BASE_URL:-http://localhost:38082}

# Order作成
echo -e "\nCreate Order(${EXECUTOR_ID}):"
CREATE_ORDER_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${WRITE_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{
  "query": "mutation CreateOrder(\$input: CreateOrderInput!) { createOrder(input: \$input) { orderId } }",
  "variables": {
    "input": {
      "name": "Order Example",
      "executorId": "${EXECUTOR_ID}"
    }
  }
}
EOS
)

if echo $CREATE_ORDER_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $CREATE_ORDER_RESULT"
  exit 1
fi

echo "Result: $CREATE_ORDER_RESULT"

ORDER_ID=$(echo $CREATE_ORDER_RESULT | jq -r .data.createOrder.orderId)

# アイテム追加
echo -e "\nAdd Item to Order(${ORDER_ID}, ${EXECUTOR_ID}):"
ADD_ITEM_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${WRITE_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{
  "query": "mutation AddItem(\$input: AddItemInput!) { addItem(input: \$input) { orderId, itemId } }",
  "variables": {
    "input": {
      "orderId": "${ORDER_ID}",
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

ITEM_ID=$(echo $ADD_ITEM_RESULT | jq -r .data.addItem.itemId)

# 2つ目のアイテム追加
echo -e "\nAdd Second Item to Order(${ORDER_ID}, ${EXECUTOR_ID}):"
ADD_ITEM_2_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${WRITE_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{
  "query": "mutation AddItem(\$input: AddItemInput!) { addItem(input: \$input) { orderId, itemId } }",
  "variables": {
    "input": {
      "orderId": "${ORDER_ID}",
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

ITEM_ID_2=$(echo $ADD_ITEM_2_RESULT | jq -r .data.addItem.itemId)

sleep 1

# Order取得
echo -e "\nGet Order(${ORDER_ID}):"
GET_ORDER_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${READ_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{ "query": "{ getOrder(orderId: \"${ORDER_ID}\") { id, name, deleted, createdAt, updatedAt } }" }
EOS
)

if echo $GET_ORDER_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $GET_ORDER_RESULT"
  exit 1
fi

echo "Result: $GET_ORDER_RESULT"

# Orderリスト取得
echo -e "\nGet Orders:"
GET_ORDERS_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${READ_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{ "query": "{ getOrders { id, name, deleted, createdAt, updatedAt } }" }
EOS
)

if echo $GET_ORDERS_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $GET_ORDERS_RESULT"
  exit 1
fi

echo "Result: $GET_ORDERS_RESULT"

# OrderItem取得
echo -e "\nGet OrderItem(${ITEM_ID}):"
GET_ORDER_ITEM_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${READ_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{ "query": "{ getOrderItem(orderItemId: \"${ITEM_ID}\") { id, orderId, name, quantity, price, createdAt, updatedAt } }" }
EOS
)

if echo $GET_ORDER_ITEM_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $GET_ORDER_ITEM_RESULT"
  exit 1
fi

echo "Result: $GET_ORDER_ITEM_RESULT"

# OrderItemリスト取得
echo -e "\nGet OrderItems(${ORDER_ID}):"
GET_ORDER_ITEMS_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${READ_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{ "query": "{ getOrderItems(orderId: \"${ORDER_ID}\") { id, orderId, name, quantity, price, createdAt, updatedAt } }" }
EOS
)

if echo $GET_ORDER_ITEMS_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $GET_ORDER_ITEMS_RESULT"
  exit 1
fi

echo "Result: $GET_ORDER_ITEMS_RESULT"

# アイテム削除
echo -e "\nRemove Item from Order(${ORDER_ID}, ${ITEM_ID}, ${EXECUTOR_ID}):"
REMOVE_ITEM_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${WRITE_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{
  "query": "mutation RemoveItem(\$input: RemoveItemInput!) { removeItem(input: \$input) { orderId } }",
  "variables": {
    "input": {
      "orderId": "${ORDER_ID}",
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

sleep 1

# OrderItemリスト再取得（1つ減っているはず）
echo -e "\nGet OrderItems After Removal(${ORDER_ID}):"
GET_ORDER_ITEMS_AFTER_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${READ_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{ "query": "{ getOrderItems(orderId: \"${ORDER_ID}\") { id, orderId, name, quantity, price, createdAt, updatedAt } }" }
EOS
)

if echo $GET_ORDER_ITEMS_AFTER_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $GET_ORDER_ITEMS_AFTER_RESULT"
  exit 1
fi

echo "Result: $GET_ORDER_ITEMS_AFTER_RESULT"

# Order削除
echo -e "\nDelete Order(${ORDER_ID}, ${EXECUTOR_ID}):"
DELETE_ORDER_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${WRITE_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{
  "query": "mutation DeleteOrder(\$input: DeleteOrderInput!) { deleteOrder(input: \$input) { orderId } }",
  "variables": {
    "input": {
      "orderId": "${ORDER_ID}",
      "executorId": "${EXECUTOR_ID}"
    }
  }
}
EOS
)

if echo $DELETE_ORDER_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $DELETE_ORDER_RESULT"
  exit 1
fi

echo "Result: $DELETE_ORDER_RESULT"

sleep 1

# Order取得（deletedがtrueになっているはず）
echo -e "\nGet Deleted Order(${ORDER_ID}):"
GET_DELETED_ORDER_RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
	${READ_API_SERVER_BASE_URL}/query \
	-d @- <<EOS
{ "query": "{ getOrder(orderId: \"${ORDER_ID}\") { id, name, deleted, createdAt, updatedAt } }" }
EOS
)

if echo $GET_DELETED_ORDER_RESULT | jq -e .errors > /dev/null; then
  echo "Error: $GET_DELETED_ORDER_RESULT"
  exit 1
fi

echo "Result: $GET_DELETED_ORDER_RESULT"

echo -e "\n✅ All E2E tests passed!"
