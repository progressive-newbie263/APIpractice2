package orderHandler

import (
	"encoding/json"
	"net/http"
	"server/database"
	"time"
	"log"
)

type OrderDetail struct {
	OrderID        string         `json:"order_id"`
	UserID         int            `json:"user_id"`
	OrderCostCents int            `json:"order_cost_cents"`
	OrderCreatedAt time.Time      `json:"order_created_at"`
	Products       []ProductDetail `json:"products"`
}

// ProductDetail will include: product id, product name, product image link, quantity of the product in the order, estimated delivery date.
type ProductDetail struct {
	ProductID            string    `json:"product_id"`
	ProductName          string    `json:"product_name"`          // New field for product name
	ProductImage         string    `json:"product_image"`         // New field for product image
	Quantity             int       `json:"quantity"`
	EstimatedDeliveryTime time.Time `json:"estimated_delivery_time"`
}

// GetOrderDetails lọc ra toàn bộ lịch sử của 1 orders, theo id
func GetOrderDetails(w http.ResponseWriter, r *http.Request) {
	orderID := r.URL.Query().Get("order_id") // Get order_id from query params
	if orderID == "" {
		http.Error(w, "order_id is required", http.StatusBadRequest)
		return
	}

	// Query to get order summary
	var order OrderDetail
	err := database.DB.QueryRow(`
		SELECT o.order_id, o.user_id, o.order_cost_cents, o.order_created_at
		FROM orders o
		WHERE o.order_id = $1`, orderID).Scan(
		&order.OrderID,
		&order.UserID,
		&order.OrderCostCents,
		&order.OrderCreatedAt,
	)

	if err != nil {
		http.Error(w, "Order not found: "+err.Error(), http.StatusNotFound)
		return
	}

	// Query to get order products along with product details
	rows, err := database.DB.Query(`
		SELECT p.id, p.name, p.image, ou.quantity, ou.estimated_delivery_time
		FROM order_user ou
		JOIN products p ON ou.product_id = p.id
		WHERE ou.order_id = $1`, orderID)

	if err != nil {
		// Log the error for debugging
		log.Printf("Failed to retrieve order products for order ID %s: %v", orderID, err)
		http.Error(w, "Failed to retrieve order products: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Slice to store products
	var products []ProductDetail
	for rows.Next() {
		var product ProductDetail
		if err := rows.Scan(&product.ProductID, &product.ProductName, &product.ProductImage, &product.Quantity, &product.EstimatedDeliveryTime); err != nil {
			http.Error(w, "Failed to scan product data: "+err.Error(), http.StatusInternalServerError)
			return
		}
		products = append(products, product)
	}

	// Attach products to order detail
	order.Products = products

	// Send response with order details
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(order); err != nil {
		http.Error(w, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
	}
}


//tạm thời bỏ.

// GetPendingOrders lọc ra các order pending của 1 người dùng.
// func GetPendingOrdersDetails(w http.ResponseWriter, r *http.Request) {
// 	userID := r.URL.Query().Get("user_id")
// 	if userID == "" {
// 		http.Error(w, "user_id is required", http.StatusBadRequest)
// 		return
// 	}

// 	rows, err := database.DB.Query(`
// 		SELECT o.order_id, o.user_id, o.order_cost_cents, o.order_created_at
// 		FROM orders o
// 		WHERE o.user_id = $1 AND o.status = 'pending'
// 		ORDER BY o.order_created_at DESC`, userID)
// 	if err != nil {
// 		log.Printf("Failed to query pending orders for user ID %s: %v", userID, err)
// 		http.Error(w, "Failed to retrieve pending orders: "+err.Error(), http.StatusInternalServerError)
// 		return
// 	}
// 	defer rows.Close()

// 	var orders []Order
// 	for rows.Next() {
// 		var order Order
// 		if err := rows.Scan(&order.OrderID, &order.UserID, &order.OrderCostCents, &order.OrderCreatedAt); err != nil {
// 			http.Error(w, "Failed to scan order data: "+err.Error(), http.StatusInternalServerError)
// 			return
// 		}
// 		orders = append(orders, order)
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	if err := json.NewEncoder(w).Encode(orders); err != nil {
// 		http.Error(w, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
// 	}
// }


// // GetDeliveredOrdersDetails trả về các order đã giao xong của 1 người dùng.
// func GetDeliveredOrdersDetails(w http.ResponseWriter, r *http.Request) {
// 	userID := r.URL.Query().Get("user_id")
// 	if userID == "" {
// 		http.Error(w, "user_id is required", http.StatusBadRequest)
// 		return
// 	}

// 	rows, err := database.DB.Query(`
// 		SELECT o.order_id, o.user_id, o.order_cost_cents, o.order_created_at
// 		FROM orders o
// 		WHERE o.user_id = $1 AND o.status = 'delivered'
// 		ORDER BY o.order_created_at DESC`, userID)
// 	if err != nil {
// 		log.Printf("Failed to query delivered orders for user ID %s: %v", userID, err)
// 		http.Error(w, "Failed to retrieve delivered orders: "+err.Error(), http.StatusInternalServerError)
// 		return
// 	}
// 	defer rows.Close()

// 	var orders []Order
// 	for rows.Next() {
// 		var order Order
// 		if err := rows.Scan(&order.OrderID, &order.UserID, &order.OrderCostCents, &order.OrderCreatedAt); err != nil {
// 			http.Error(w, "Failed to scan order data: "+err.Error(), http.StatusInternalServerError)
// 			return
// 		}
// 		orders = append(orders, order)
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	if err := json.NewEncoder(w).Encode(orders); err != nil {
// 		http.Error(w, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
// 	}
// }
