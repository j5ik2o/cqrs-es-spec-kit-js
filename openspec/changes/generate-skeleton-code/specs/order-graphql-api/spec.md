# Cart GraphQL API Capability

## ADDED Requirements

### Requirement: Cart作成Mutation
GraphQL APIを通じて新しいカートを作成できなければならない（MUST）。

#### Scenario: 正常なカート作成リクエスト
**Given**:
- GraphQL APIサーバーが起動している
- 有効なCreateCartInput（name: "Test Cart"）が与えられる

**When**:
```graphql
mutation {
  createCart(input: { name: "Test Cart" }) {
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
- レスポンスに新しいCartのIDとnameが含まれる
- itemsは空配列である

---

### Requirement: CartItemAdded追加Mutation
GraphQL APIを通じてカートにアイテムを追加できなければならない（MUST）。

#### Scenario: 正常なアイテム追加リクエスト
**Given**:
- 既存のカートIDが存在する
- 有効なAddItemToCartInput（itemName, quantity, price）が与えられる

**When**:
```graphql
mutation {
  addItemToCart(input: {
    cartId: "<cart-id>",
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

### Requirement: Cart取得Query
GraphQL APIを通じてカート情報を取得できなければならない（MUST）。

#### Scenario: IDによるカート取得
**Given**:
- 既存のカートIDが存在する

**When**:
```graphql
query {
  getCart(cartId: "<cart-id>") {
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
- 指定されたIDのカート情報が返される
- 関連するアイテム情報も含まれる

#### Scenario: 存在しないカートIDの取得
**Given**:
- 存在しないカートIDが指定される

**When**:
- `getCart(cartId: "non-existent-id")` クエリを実行する

**Then**:
- HTTPステータス 200 が返される
- レスポンスはnullである

---

### Requirement: 全カート一覧取得Query
GraphQL APIを通じて全カートのリストを取得できなければならない（MUST）。

#### Scenario: 全カートの取得
**Given**:
- 複数のカートが存在する

**When**:
```graphql
query {
  getCarts {
    id
    name
    createdAt
  }
}
```

**Then**:
- HTTPステータス 200 が返される
- 全カートの配列が返される
- 各カートに基本情報（id, name, createdAt）が含まれる
