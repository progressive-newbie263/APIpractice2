ALTER TABLE orders DROP COLUMN order_status

ALTER TABLE orders ADD COLUMN order_status VARCHAR(20);

UPDATE orders o
SET order_status = CASE WHEN NOT EXISTS (
    SELECT 1
    FROM order_user ou
    WHERE o.order_id = ou.order_id
    AND ou.estimated_delivery_time > NOW()
) THEN 'Delivered'
ELSE 'Pending'
END;

CREATE OR REPLACE FUNCTION update_order_status_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Kiểm tra nếu estimated_delivery_time đã qua
  IF NEW.estimated_delivery_time <= NOW() THEN
    -- Cập nhật trạng thái là 'Delivered' nếu thời gian giao hàng đã qua
    UPDATE order_user
    SET order_status = 'Delivered'
    WHERE order_id = NEW.order_id;
  ELSE
    -- Nếu chưa đến thời gian giao hàng, trạng thái là 'Pending'
    UPDATE order_user
    SET order_status = 'Pending'
    WHERE order_id = NEW.order_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_update_trigger
AFTER INSERT OR UPDATE ON order_user
FOR EACH ROW
EXECUTE FUNCTION update_order_status_user();




