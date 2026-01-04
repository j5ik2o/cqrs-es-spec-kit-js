import "reflect-metadata";
import {
  AddItemToCartInput,
  CreateCartInput,
  DeleteCartInput,
  RemoveItemFromCartInput,
} from "./inputs";

describe("graphql inputs", () => {
  it("allows assigning fields", () => {
    const createInput = new CreateCartInput();
    createInput.name = "sample";
    createInput.executorId = "user";

    const addItem = new AddItemToCartInput();
    addItem.cartId = "cart";
    addItem.name = "item";
    addItem.quantity = 1;
    addItem.price = 100;
    addItem.executorId = "user";

    const removeItem = new RemoveItemFromCartInput();
    removeItem.cartId = "cart";
    removeItem.itemId = "item";
    removeItem.executorId = "user";

    const deleteCart = new DeleteCartInput();
    deleteCart.cartId = "cart";
    deleteCart.executorId = "user";

    expect(createInput.name).toBe("sample");
    expect(addItem.quantity).toBe(1);
    expect(removeItem.itemId).toBe("item");
    expect(deleteCart.cartId).toBe("cart");
  });
});
