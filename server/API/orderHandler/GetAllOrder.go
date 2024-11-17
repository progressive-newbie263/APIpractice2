package orderHandler

import (
	"encoding/json"
	"net/http"
	"server/database"
	"time"
	"database/sql"
)

// Order represents the structure of an order from the Orders table
type Order struct {
	ID                int       `json:"id"`                 // serial ID for the order entry
	OrderID           string    `json:"order_id"`           // unique order ID
	UserID            int       `json:"user_id"`            // user who made the order
	OrderCostCents    int       `json:"order_cost_cents"`   // total cost of the order in cents
	OrderCreatedAt    time.Time `json:"order_created_at"`   // timestamp for order creation
	//bổ sung thêm order-status. 
	//Nếu order đã xong (done) => chia nó ra 1 trang. 
	//Còn nếu chưa xong(pending) nó sẽ ở 1 trang khác
	OrderStatus       string    `json:"order_status"`  
}

// GetOrders retrieves all orders from the Orders table.
func GetAllOrdersByStatus(w http.ResponseWriter, r *http.Request) {
	// Retrieve the status query parameter from the URL (e.g., /orders?order_status=Pending)
	status := r.URL.Query().Get("order_status")

	// If no status is provided, retrieve orders of both statuses
	if status == "" {
		// Query orders without filtering by status
		status = "all"
	}

	var rows *sql.Rows
	var err error

	// Query based on the status
	if status == "all" {
		rows, err = database.DB.Query("SELECT id, order_id, user_id, order_cost_cents, order_created_at, order_status FROM orders")
	} else {
		// Query orders with the specified status
		rows, err = database.DB.Query("SELECT id, order_id, user_id, order_cost_cents, order_created_at, order_status FROM orders WHERE order_status = $1", status)
	}

	if err != nil {
		http.Error(w, "Failed to retrieve orders", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Slice to store orders
	var orders []Order

	// Iterate over rows and populate the orders slice
	for rows.Next() {
		var order Order
		err := rows.Scan(
			&order.ID,
			&order.OrderID,
			&order.UserID,
			&order.OrderCostCents,
			&order.OrderCreatedAt,
			&order.OrderStatus, // Ensure to scan the order_status field
		)
		if err != nil {
			http.Error(w, "Failed to scan order data", http.StatusInternalServerError)
			return
		}
		orders = append(orders, order)
	}

	// Check for errors after iteration
	if err = rows.Err(); err != nil {
		http.Error(w, "Error encountered while retrieving orders", http.StatusInternalServerError)
		return
	}

	// Send the response with the filtered orders in JSON format
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}



/*
//function cho API lấy ra order chưa xong/pending
func GetAllPendingOrders(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT id, order_id, user_id, order_cost_cents, order_created_at, order_status 
		FROM orders
		WHERE order_status = 'Pending'
	`)
	if err != nil {
		http.Error(w, "Failed to retrieve pending orders", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var pendingOrders []Order
	for rows.Next() {
		var order Order
		err := rows.Scan(
			&order.ID,
			&order.OrderID,
			&order.UserID,
			&order.OrderCostCents,
			&order.OrderCreatedAt,
			&order.OrderStatus,
		)
		if err != nil {
			http.Error(w, "Failed to scan order data", http.StatusInternalServerError)
			return
		}
		pendingOrders = append(pendingOrders, order)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pendingOrders)
}


//function tạo API trả về order đã hoàn thành.
func GetAllDeliveredOrders(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT id, order_id, user_id, order_cost_cents, order_created_at, order_status 
		FROM orders
		WHERE order_status = 'Delivered'
	`)
	if err != nil {
		http.Error(w, "Failed to retrieve done orders", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var doneOrders []Order
	for rows.Next() {
		var order Order
		err := rows.Scan(
			&order.ID,
			&order.OrderID,
			&order.UserID,
			&order.OrderCostCents,
			&order.OrderCreatedAt,
			&order.OrderStatus,
		)
		if err != nil {
			http.Error(w, "Failed to scan order data", http.StatusInternalServerError)
			return
		}
		doneOrders = append(doneOrders, order)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(doneOrders)
}
*/
