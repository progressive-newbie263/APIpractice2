package orderHandler

import (
	"math/rand"
	"server/database"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// OrderUser represents the order response structure
type OrderUser struct {
	ID                    int       `json:"id"` // serial ID for the order entry
	OrderID               string    `json:"order_id"` // unique order ID for the specific item
	UserID                int       `json:"user_id"`
	ProductID             string    `json:"product_id"`
	Quantity              int       `json:"quantity"`
	EstimatedDeliveryTime  time.Time `json:"estimated_delivery_time"`
	TotalCostCents        int       `json:"total_cost_cents"`
}

// GenerateRandomString creates a random string of specified length
func GenerateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[rand.Intn(len(charset))]
	}
	return string(result)
}

func CreateOrder(w http.ResponseWriter, r *http.Request) {
	var cartItems []struct {
		UserID         int    `json:"user_id"`
		ProductID      string `json:"productId"`
		Quantity       int    `json:"quantity"`
		DeliveryOption string `json:"deliveryOptionId"`
	}

	// Decode JSON from request
	err := json.NewDecoder(r.Body).Decode(&cartItems)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Ensure all items have the same user_id
	if len(cartItems) > 0 {
		firstUserID := cartItems[0].UserID
		for _, item := range cartItems[1:] {
			if item.UserID != firstUserID {
				http.Error(w, "All items must have the same user_id", http.StatusBadRequest)
				return
			}
		}
	}

	// Generate a random string for order_id
	orderID := GenerateRandomString(20)
	var orders []OrderUser
	orderCostCents := 0

	// Use a transaction to ensure atomicity
	tx, err := database.DB.Begin()
	if err != nil {
		http.Error(w, "Failed to start transaction", http.StatusInternalServerError)
		return
	}

	// Insert an initial entry into the orders table to satisfy the foreign key constraint
	_, err = tx.Exec(
		"INSERT INTO orders (order_id, user_id, order_cost_cents, order_created_at) VALUES ($1, $2, $3, $4)",
		orderID,
		cartItems[0].UserID,
		orderCostCents,
		time.Now(),
	)
	if err != nil {
		tx.Rollback() // Rollback if the insert fails
		http.Error(w, "Failed to save order summary", http.StatusInternalServerError)
		fmt.Println("Error details:", err)
		return
	}

	// Loop over cart items and insert each into the order_user table
	for _, item := range cartItems {
		// Query product information from the database
		var product database.Product
		err := database.DB.QueryRow("SELECT * FROM products WHERE id = $1", item.ProductID).Scan(
			&product.ID,
			&product.Image,
			&product.Name,
			&product.RatingStars,
			&product.RatingCount,
			&product.PriceCents,
			&product.Keywords,
			&product.Type,
			&product.SizeChartLink,
			&product.InstructionsLink,
			&product.WarrantyLink,
		)
		if err != nil {
			tx.Rollback() // Rollback if product not found
			http.Error(w, "Product not found", http.StatusNotFound)
			return
		}

		// Calculate total cost for the item
		totalCostCents := product.PriceCents * item.Quantity
		orderCostCents += totalCostCents // Accumulate the total order cost.

		// Calculate estimated delivery time based on the delivery option
		var deliveryDays int
		switch item.DeliveryOption {
		case "1":
			deliveryDays = 7
		case "2":
			deliveryDays = 3
		case "3":
			deliveryDays = 1
		default:
			tx.Rollback() // Rollback if delivery option is invalid
			http.Error(w, "Invalid delivery option", http.StatusBadRequest)
			return
		}
		estimatedDeliveryTime := time.Now().Add(time.Duration(deliveryDays) * 24 * time.Hour)

		// Create OrderUser for this order item
		order := OrderUser{
			OrderID:              orderID,
			UserID:               item.UserID,
			ProductID:            item.ProductID,
			Quantity:             item.Quantity,
			EstimatedDeliveryTime: estimatedDeliveryTime,
			TotalCostCents:       totalCostCents,
		}

		// Insert order into the database (id will be auto-incremented)
		err = tx.QueryRow(
			"INSERT INTO order_user (order_id, user_id, product_id, quantity, estimated_delivery_time, total_cost_cents) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
			order.OrderID,
			order.UserID,
			order.ProductID,
			order.Quantity,
			order.EstimatedDeliveryTime,
			order.TotalCostCents,
		).Scan(&order.ID)

		if err != nil {
			tx.Rollback()
			http.Error(w, "Failed to save order", http.StatusInternalServerError)
			return
		}

		orders = append(orders, order)
	}

	// Update the orders table with the accumulated total order cost
	_, err = tx.Exec("UPDATE orders SET order_cost_cents = $1 WHERE order_id = $2", orderCostCents, orderID)
	if err != nil {
		tx.Rollback()
		http.Error(w, "Failed to update order total cost", http.StatusInternalServerError)
		return
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}


