package orderHandler

import (
	"encoding/json"
	"net/http"
	"server/database"
)

//sử dụng Order từ bên GetAllOrder.go
// type Order struct {
// 	OrderID        int     `json:"order_id"`
// 	UserID         int     `json:"user_id"`
// 	OrderCostCents int     `json:"order_cost_cents"`
// 	OrderCreatedAt string  `json:"order_created_at"`
// 	OrderStatus    string  `json:"order_status"` // Đảm bảo trạng thái là một chuỗi
// }

//api tổng hợp 3 cái 
func GetOrdersByUserIDAndStatus(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	status := r.URL.Query().Get("order_status") // Get status from query parameter

	if userID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	// Base query
	query := `SELECT order_id, user_id, order_cost_cents, order_created_at, order_status FROM orders WHERE user_id = $1`
	args := []interface{}{userID}

	// Append status filter if provided
	if status != "" {
		query += ` AND order_status = $2`
		args = append(args, status)
	}

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		http.Error(w, "Failed to retrieve orders", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var order Order
		if err := rows.Scan(&order.OrderID, &order.UserID, &order.OrderCostCents, &order.OrderCreatedAt, &order.OrderStatus); err != nil {
			http.Error(w, "Failed to parse order data", http.StatusInternalServerError)
			return
		}
		orders = append(orders, order)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(orders); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}



// Handler to get all orders by user_id
// func GetOrdersByUserID(w http.ResponseWriter, r *http.Request) {
// 	userID := r.URL.Query().Get("user_id")

// 	if userID == "" {
// 		http.Error(w, "User ID is required", http.StatusBadRequest)
// 		return
// 	}

// 	// Prepare the query to retrieve all orders of the specified user_id
// 	query := `SELECT order_id, user_id, order_cost_cents, order_created_at FROM orders WHERE user_id = $1`
// 	rows, err := database.DB.Query(query, userID)
// 	if err != nil {
// 		http.Error(w, "Failed to retrieve orders", http.StatusInternalServerError)
// 		return
// 	}
// 	defer rows.Close()

// 	var orders []Order
// 	for rows.Next() {
// 		var order Order
// 		if err := rows.Scan(&order.OrderID, &order.UserID, &order.OrderCostCents, &order.OrderCreatedAt); err != nil {
// 			http.Error(w, "Failed to parse order data", http.StatusInternalServerError)
// 			return
// 		}
// 		orders = append(orders, order)
// 	}

// 	json.NewEncoder(w).Encode(orders)
// }


// // Handler lấy ra các pending orders của 1 user (trường hợp gộp).
// func GetPendingOrdersByUserID(w http.ResponseWriter, r *http.Request) {
// 	userID := r.URL.Query().Get("user_id")
// 	if userID == "" {
// 		http.Error(w, "User ID is required", http.StatusBadRequest)
// 		return
// 	}

// 	query := `
// 		SELECT order_id, user_id, order_cost_cents, order_created_at
// 		FROM orders
// 		WHERE user_id = $1 AND status = 'pending'`
	
// 		rows, err := database.DB.Query(query, userID)
// 	if err != nil {
// 		http.Error(w, "Failed to retrieve pending orders", http.StatusInternalServerError)
// 		return
// 	}
// 	defer rows.Close()

// 	var orders []Order
// 	for rows.Next() {
// 		var order Order
// 		if err := rows.Scan(&order.OrderID, &order.UserID, &order.OrderCostCents, &order.OrderCreatedAt); err != nil {
// 			http.Error(w, "Failed to parse order data", http.StatusInternalServerError)
// 			return
// 		}
// 		orders = append(orders, order)
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(orders)
// }


// // Handler to get all delivered orders by user_id
// func GetDeliveredOrdersByUserID(w http.ResponseWriter, r *http.Request) {
// 	userID := r.URL.Query().Get("user_id")
// 	if userID == "" {
// 		http.Error(w, "User ID is required", http.StatusBadRequest)
// 		return
// 	}

// 	// Handler lấy ra các orders đã chuyển của 1 user
// 	query := `
// 		SELECT order_id, user_id, order_cost_cents, order_created_at
// 		FROM orders
// 		WHERE user_id = $1 AND status = 'delivered'`
	
// 		rows, err := database.DB.Query(query, userID)
// 	if err != nil {
// 		http.Error(w, "Failed to retrieve delivered orders", http.StatusInternalServerError)
// 		return
// 	}
// 	defer rows.Close()

// 	var orders []Order
// 	for rows.Next() {
// 		var order Order
// 		if err := rows.Scan(&order.OrderID, &order.UserID, &order.OrderCostCents, &order.OrderCreatedAt); err != nil {
// 			http.Error(w, "Failed to parse order data", http.StatusInternalServerError)
// 			return
// 		}
// 		orders = append(orders, order)
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(orders)
// }