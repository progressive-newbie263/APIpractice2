package orderHandler

import (
	"encoding/json"
	"net/http"
	"server/database"
)

// Handler to get all orders by user_id
func GetOrdersByUserID(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")

	if userID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	// Prepare the query to retrieve all orders of the specified user_id
	query := `SELECT order_id, user_id, order_cost_cents, order_created_at FROM orders WHERE user_id = $1`
	rows, err := database.DB.Query(query, userID)
	if err != nil {
		http.Error(w, "Failed to retrieve orders", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var order Order
		if err := rows.Scan(&order.OrderID, &order.UserID, &order.OrderCostCents, &order.OrderCreatedAt); err != nil {
			http.Error(w, "Failed to parse order data", http.StatusInternalServerError)
			return
		}
		orders = append(orders, order)
	}

	json.NewEncoder(w).Encode(orders)
}
