# Order GraphQL API Capability

## ADDED Requirements

### Requirement: Order作成Mutation
GraphQL APIを通じて新しい注文を作成できなければならない（MUST）。

#### Scenario: 正常な注文作成リクエスト
**Given**:
- GraphQL APIサーバーが起動している
- 有効なCreateOrderInput（name: "Test Order"）が与えられる

**When**:
```graphql
mutation {
  createOrder(input: { name: "Test Order" }) {
    id
    name
    items {
      id
      name
    }
  }
}
```

**Then**:
- HTTPステータス 200 が返される
- レスポンスに新しいOrderのIDとnameが含まれる
- itemsは空配列である

---

### Requirement: OrderItemAdded追加Mutation
GraphQL APIを通じて注文にアイテムを追加できなければならない（MUST）。

#### Scenario: 正常なアイテム追加リクエスト
**Given**:
- 既存の注文IDが存在する
- 有効なAddOrderItemInput（itemName, quantity, price）が与えられる

**When**:
```graphql
mutation {
  addOrderItem(input: {
    orderId: "<order-id>",
    itemName: "Product A",
    quantity: 2,
    price: 1000
  }) {
    id
    items {
      id
      name
      quantity
      price
    }
  }
}
```

**Then**:
- HTTPステータス 200 が返される
- レスポンスに追加されたアイテムが含まれる
- アイテムの数量と価格が正しく反映される

---

### Requirement: Order取得Query
GraphQL APIを通じて注文情報を取得できなければならない（MUST）。

#### Scenario: IDによる注文取得
**Given**:
- 既存の注文IDが存在する

**When**:
```graphql
query {
  order(id: "<order-id>") {
    id
    name
    items {
      id
      name
      quantity
      price
    }
  }
}
```

**Then**:
- HTTPステータス 200 が返される
- 指定されたIDの注文情報が返される
- 関連するアイテム情報も含まれる

#### Scenario: 存在しない注文IDの取得
**Given**:
- 存在しない注文IDが指定される

**When**:
- `order(id: "non-existent-id")` クエリを実行する

**Then**:
- HTTPステータス 200 が返される
- レスポンスはnullである

---

### Requirement: 全注文一覧取得Query
GraphQL APIを通じて全注文のリストを取得できなければならない（MUST）。

#### Scenario: 全注文の取得
**Given**:
- 複数の注文が存在する

**When**:
```graphql
query {
  orders {
    id
    name
    createdAt
  }
}
```

**Then**:
- HTTPステータス 200 が返される
- 全注文の配列が返される
- 各注文に基本情報（id, name, createdAt）が含まれる
