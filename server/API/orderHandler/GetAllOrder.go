package orderHandler

import (
	"encoding/json"
	"net/http"
	"server/database"
	"time"
)

// Order represents the structure of an order from the Orders table
type Order struct {
	ID                int       `json:"id"`                 // serial ID for the order entry
	OrderID           string    `json:"order_id"`           // unique order ID
	UserID            int       `json:"user_id"`            // user who made the order
	OrderCostCents    int       `json:"order_cost_cents"`   // total cost of the order in cents
	OrderCreatedAt    time.Time `json:"order_created_at"`   // timestamp for order creation
}

// GetOrders retrieves all orders from the Orders table.
func GetAllOrders(w http.ResponseWriter, r *http.Request) {
	// Query all orders from the Orders table
	rows, err := database.DB.Query("SELECT id, order_id, user_id, order_cost_cents, order_created_at FROM orders")
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

	// Send the response with all orders in JSON format
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}
