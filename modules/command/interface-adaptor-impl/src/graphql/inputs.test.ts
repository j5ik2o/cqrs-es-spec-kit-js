import "reflect-metadata";
import { AddItemInput, CreateOrderInput, DeleteOrderInput, RemoveItemInput } from "./inputs";

describe("graphql inputs", () => {
  it("allows assigning fields", () => {
    const createInput = new CreateOrderInput();
    createInput.name = "sample";
    createInput.executorId = "user";

    const addItem = new AddItemInput();
    addItem.orderId = "order";
    addItem.name = "item";
    addItem.quantity = 1;
    addItem.price = 100;
    addItem.executorId = "user";

    const removeItem = new RemoveItemInput();
    removeItem.orderId = "order";
    removeItem.itemId = "item";
    removeItem.executorId = "user";

    const deleteOrder = new DeleteOrderInput();
    deleteOrder.orderId = "order";
    deleteOrder.executorId = "user";

    expect(createInput.name).toBe("sample");
    expect(addItem.quantity).toBe(1);
    expect(removeItem.itemId).toBe("item");
    expect(deleteOrder.orderId).toBe("order");
  });
});
