import type { Order, OrderEvent } from "cqrs-es-spec-kit-js-command-domain";
import { OrderRepositoryImpl } from "../repository/order/order-repository";

describe("OrderRepositoryImpl", () => {
  it("evaluates retention criteria", () => {
    const decider = OrderRepositoryImpl.retentionCriteriaOf(2);
    const snapshot = {} as Order;
    const event = { sequenceNumber: 4 } as unknown as OrderEvent;
    const otherEvent = { sequenceNumber: 5 } as unknown as OrderEvent;

    expect(decider(event, snapshot)).toBe(true);
    expect(decider(otherEvent, snapshot)).toBe(false);
  });
});
