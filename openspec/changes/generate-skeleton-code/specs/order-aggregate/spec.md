# Order Aggregate Capability

## ADDED Requirements

### Requirement: Order作成機能
システムは新しい注文を作成できなければならない（MUST）。

#### Scenario: 正常な注文作成
**Given**:
- 有効なOrderName（"Sample Order"）が与えられる

**When**:
- `Order.create(orderId, name, executorId)` を実行する

**Then**:
- 新しいOrderアグリゲートが作成される
- `OrderCreated` イベントが発行される
- Orderのdeletedフラグはfalseである
- OrderのItemsコレクションは空である

---

### Requirement: 注文アイテム追加機能
システムは既存の注文にアイテムを追加できなければならない（MUST）。

#### Scenario: 正常なアイテム追加
**Given**:
- 削除されていないOrderアグリゲートが存在する
- 有効なアイテム名（"Item A"）、数量（2）、価格（1000）が与えられる

**When**:
- `order.addItem(itemId, name, quantity, price, executorId)` を実行する

**Then**:
- Orderに新しいアイテムが追加される
- `OrderItemAdded` イベントが発行される
- アイテムの数量と価格が正しく保存される

#### Scenario: 削除済み注文へのアイテム追加失敗
**Given**:
- 削除されたOrderアグリゲートが存在する

**When**:
- `order.addItem(...)` を実行する

**Then**:
- `OrderAddItemError` が返される
- エラーメッセージは "The order is deleted" である

---

### Requirement: 注文アイテム削除機能
システムは注文からアイテムを削除できなければならない（MUST）。

#### Scenario: 正常なアイテム削除
**Given**:
- 削除されていないOrderアグリゲートが存在する
- Orderに既存のアイテムが含まれる

**When**:
- `order.removeItem(itemId, executorId)` を実行する

**Then**:
- 指定されたアイテムがOrderから削除される
- `OrderItemRemoved` イベントが発行される

#### Scenario: 存在しないアイテムの削除失敗
**Given**:
- 削除されていないOrderアグリゲートが存在する
- 指定されたitemIdがOrderに存在しない

**When**:
- `order.removeItem(nonExistentId, executorId)` を実行する

**Then**:
- `OrderRemoveItemError` が返される
- エラーメッセージは "The item does not exist" である

---

### Requirement: 注文削除機能
システムは注文を削除（論理削除）できなければならない（MUST）。

#### Scenario: 正常な注文削除
**Given**:
- 削除されていないOrderアグリゲートが存在する

**When**:
- `order.delete(executorId)` を実行する

**Then**:
- Orderのdeletedフラグがtrueになる
- `OrderDeleted` イベントが発行される

#### Scenario: 既に削除済みの注文の削除失敗
**Given**:
- 既に削除されたOrderアグリゲートが存在する

**When**:
- `order.delete(executorId)` を実行する

**Then**:
- `OrderDeleteError` が返される
- エラーメッセージは "The order is already deleted" である

---

### Requirement: イベントソーシング対応
Orderアグリゲートはイベントから状態を再構築できなければならない（MUST）。

#### Scenario: イベントストリームからの再構築
**Given**:
- `OrderCreated`, `OrderItemAdded`, `OrderItemAdded` のイベントシーケンスが存在する

**When**:
- イベントストリームから `Order.replay()` を実行する

**Then**:
- Orderアグリゲートが正しい状態で再構築される
- 2つのアイテムがOrderに含まれる
- シーケンス番号が正しく設定される
