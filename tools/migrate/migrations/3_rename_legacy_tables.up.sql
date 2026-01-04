RENAME TABLE orders TO carts;
RENAME TABLE order_items TO cart_items;

ALTER TABLE cart_items DROP FOREIGN KEY order_items_ibfk_1;
ALTER TABLE cart_items DROP INDEX idx_order_id;
ALTER TABLE cart_items CHANGE COLUMN order_id cart_id VARCHAR(255) NOT NULL;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_ibfk_1 FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE;
CREATE INDEX idx_cart_id ON cart_items(cart_id);
