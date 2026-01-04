# Cart Aggregate Capability

## ADDED Requirements

### Requirement: Cart作成機能
システムは新しいカートを作成できなければならない（MUST）。

#### Scenario: 正常なカート作成
**Given**:
- 有効なCartName（"Sample Cart"）が与えられる

**When**:
- `Cart.create(cartId, name, executorId)` を実行する

**Then**:
- 新しいCartアグリゲートが作成される
- `CartCreated` イベントが発行される
- Cartのdeletedフラグはfalseである
- CartのItemsコレクションは空である

---

### Requirement: カートアイテム追加機能
システムは既存のカートにアイテムを追加できなければならない（MUST）。

#### Scenario: 正常なアイテム追加
**Given**:
- 削除されていないCartアグリゲートが存在する
- 有効なアイテム名（"Item A"）、数量（2）、価格（1000）が与えられる

**When**:
- `cart.addItem(itemId, name, quantity, price, executorId)` を実行する

**Then**:
- Cartに新しいアイテムが追加される
- `CartItemAdded` イベントが発行される
- アイテムの数量と価格が正しく保存される

#### Scenario: 削除済みカートへのアイテム追加失敗
**Given**:
- 削除されたCartアグリゲートが存在する

**When**:
- `cart.addItem(...)` を実行する

**Then**:
- `CartAddItemError` が返される
- エラーメッセージは "The cart is deleted" である

---

### Requirement: カートアイテム削除機能
システムはカートからアイテムを削除できなければならない（MUST）。

#### Scenario: 正常なアイテム削除
**Given**:
- 削除されていないCartアグリゲートが存在する
- Cartに既存のアイテムが含まれる

**When**:
- `cart.removeItem(itemId, executorId)` を実行する

**Then**:
- 指定されたアイテムがCartから削除される
- `CartItemRemoved` イベントが発行される

#### Scenario: 存在しないアイテムの削除失敗
**Given**:
- 削除されていないCartアグリゲートが存在する
- 指定されたitemIdがCartに存在しない

**When**:
- `cart.removeItem(nonExistentId, executorId)` を実行する

**Then**:
- `CartRemoveItemError` が返される
- エラーメッセージは "The item does not exist" である

---

### Requirement: カート削除機能
システムはカートを削除（論理削除）できなければならない（MUST）。

#### Scenario: 正常なカート削除
**Given**:
- 削除されていないCartアグリゲートが存在する

**When**:
- `cart.delete(executorId)` を実行する

**Then**:
- Cartのdeletedフラグがtrueになる
- `CartDeleted` イベントが発行される

#### Scenario: 既に削除済みのカートの削除失敗
**Given**:
- 既に削除されたCartアグリゲートが存在する

**When**:
- `cart.delete(executorId)` を実行する

**Then**:
- `CartDeleteError` が返される
- エラーメッセージは "The cart is already deleted" である

---

### Requirement: イベントソーシング対応
Cartアグリゲートはイベントから状態を再構築できなければならない（MUST）。

#### Scenario: イベントストリームからの再構築
**Given**:
- `CartCreated`, `CartItemAdded`, `CartItemAdded` のイベントシーケンスが存在する

**When**:
- イベントストリームから `Cart.replay()` を実行する

**Then**:
- Cartアグリゲートが正しい状態で再構築される
- 2つのアイテムがCartに含まれる
- シーケンス番号が正しく設定される
