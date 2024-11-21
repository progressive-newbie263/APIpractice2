package orderHandler

import (
	"encoding/json"
	"net/http"
	"server/database"
	"time"
	"log"
	"database/sql"
	"github.com/lib/pq"
)

type UpdateOrderRequest struct {
	OrderID  string `json:"order_id"`
	UserID   int    `json:"user_id"`
	Products []struct {
		ProductID        string `json:"product_id"`
		Quantity         int    `json:"quantity"`
		DeliveryOptionID string `json:"delivery_option_id"`
	} `json:"products"`
}

type ProductResponse struct {
	ProductID            string    `json:"product_id"`
	ProductName          string    `json:"product_name"`
	ProductImage         string    `json:"product_image"`
	Quantity             int       `json:"quantity"`
	EstimatedDeliveryTime time.Time `json:"estimated_delivery_time"`
}

type UpdateOrderResponse struct {
	OrderID         string            `json:"order_id"`
	UserID          int               `json:"user_id"`
	OrderCostCents  int               `json:"order_cost_cents"`
	OrderCreatedAt  time.Time         `json:"order_created_at"`
	Products        []ProductResponse `json:"products"`
}

func UpdateOrderDetails(w http.ResponseWriter, r *http.Request) {
	// Parse request body
	var request UpdateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Check if order exists and check 'is_updated' and 'order_created_at'
	var orderCreatedAt time.Time
	var isUpdated bool
	var existingOrderID string
	err := database.DB.QueryRow(
		"SELECT order_id, order_created_at, is_updated FROM orders WHERE order_id = $1 AND user_id = $2",
		request.OrderID, request.UserID,
	).Scan(&existingOrderID, &orderCreatedAt, &isUpdated)
	if err != nil {
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}

	// Check if order is not updated and is within 2 hours of creation
	if isUpdated {
		http.Error(w, "Order has already been updated", http.StatusForbidden)
		return
	}

	if time.Since(orderCreatedAt) > 2*time.Hour {
		http.Error(w, "Order update window has expired", http.StatusForbidden)
		return
	}

	// Begin transaction
	tx, err := database.DB.Begin()
	if err != nil {
		http.Error(w, "Failed to start transaction", http.StatusInternalServerError)
		return
	}

	// 1. Check and update/add products to order
	var updatedProductIDs = make(map[string]bool)

	for _, product := range request.Products {
		// Check if the product exists in the database
		var productName, productImage string
		var priceCents int
		err := database.DB.QueryRow(
			"SELECT name, image, pricecents FROM products WHERE id = $1",
			product.ProductID,
		).Scan(&productName, &productImage, &priceCents)
		if err != nil {
			tx.Rollback()
			log.Printf("Error fetching product %s from database: %v", product.ProductID, err) // Debug log
			http.Error(w, "Product not found", http.StatusNotFound)
			return
		}

		// Calculate estimated delivery time
		var deliveryDays int
		switch product.DeliveryOptionID {
		case "1":
			deliveryDays = 7
		case "2":
			deliveryDays = 3
		case "3":
			deliveryDays = 1
		default:
			tx.Rollback()
			log.Printf("Invalid delivery option: %s", product.DeliveryOptionID) // Debug log
			http.Error(w, "Invalid delivery option", http.StatusBadRequest)
			return
		}
		estimatedDeliveryTime := time.Now().Add(time.Duration(deliveryDays) * 24 * time.Hour)

		// Check if product already exists in the order
		var existingQuantity int
		err = tx.QueryRow(
			"SELECT quantity FROM order_user WHERE order_id = $1 AND product_id = $2",
			request.OrderID, product.ProductID,
		).Scan(&existingQuantity)

		if err == nil {
			// Product exists, update it
			log.Printf("Updating product %s with new quantity: %d", product.ProductID, product.Quantity) // Debug log
			_, err = tx.Exec(
				"UPDATE order_user SET quantity = $1, estimated_delivery_time = $2 WHERE order_id = $3 AND product_id = $4",
				product.Quantity, estimatedDeliveryTime, request.OrderID, product.ProductID,
			)
		} else if err == sql.ErrNoRows {
			// Product does not exist, insert new
			log.Printf("Inserting new product %s with quantity: %d", product.ProductID, product.Quantity) // Debug log
			
			// Chèn sản phẩm mới
			totalCost := product.Quantity * priceCents // Tính tổng chi phí cho sản phẩm mới
			_, err = tx.Exec(
					"INSERT INTO order_user (order_id, product_id, quantity, estimated_delivery_time, user_id, total_cost_cents) VALUES ($1, $2, $3, $4, $5, $6)",
					request.OrderID, product.ProductID, product.Quantity, estimatedDeliveryTime, request.UserID, totalCost,
			)
		} else {
			// Error checking product existence
			tx.Rollback()
			log.Printf("Error checking product existence for %s: %v", product.ProductID, err) // Debug log
			http.Error(w, "Error checking product existence", http.StatusInternalServerError)
			return
		}

		if err != nil {
			tx.Rollback()
			log.Printf("Error updating product %s: %v", product.ProductID, err) // Debug log
			http.Error(w, "Error updating product", http.StatusInternalServerError)
			return
		}

		// Log updated product ID
		log.Printf("Product updated: %s", product.ProductID)

		updatedProductIDs[product.ProductID] = true
	}

	// 2. Delete products not in the request
	requestProductIDs := requestProductIDsToSlice(updatedProductIDs)

	_, err = tx.Exec(
		"DELETE FROM order_user WHERE order_id = $1 AND product_id NOT IN (SELECT UNNEST($2::text[]))",
		request.OrderID, pq.Array(requestProductIDs),
	)
	if err != nil {
		tx.Rollback()
		log.Printf("Error deleting products not in request: %v", err) // Debug log
		http.Error(w, "Error deleting products not in request", http.StatusInternalServerError)
		return
	}

	// Recalculate total cost
	var totalCostCents int
	err = tx.QueryRow(
		"SELECT COALESCE(SUM(quantity * pricecents), 0) FROM order_user ou JOIN products p ON ou.product_id = p.id WHERE ou.order_id = $1",
		request.OrderID,
	).Scan(&totalCostCents)
	if err != nil {
		tx.Rollback()
		log.Printf("Error recalculating total cost: %v", err)
		http.Error(w, "Failed to recalculate total cost", http.StatusInternalServerError)
		return
	}

	// Update total cost of order
	_, err = tx.Exec(
		"UPDATE orders SET order_cost_cents = $1 WHERE order_id = $2",
		totalCostCents, request.OrderID,
	)
	if err != nil {
		tx.Rollback()
		log.Printf("Error updating total cost: %v", err) // Debug log
		http.Error(w, "Failed to update total cost", http.StatusInternalServerError)
		return
	}

	// Mark the order as updated
	_, err = tx.Exec(
		"UPDATE orders SET is_updated = $1 WHERE order_id = $2",
		true, request.OrderID,
	)
	if err != nil {
		tx.Rollback()
		log.Printf("Error marking order as updated: %v", err) // Debug log
		http.Error(w, "Failed to mark order as updated", http.StatusInternalServerError)
		return
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
		return
	}

	// Fetch updated products for the response
	rows, err := database.DB.Query(
		"SELECT p.id, p.name, p.image, ou.quantity, ou.estimated_delivery_time "+
			"FROM order_user ou "+
			"JOIN products p ON ou.product_id = p.id "+
			"WHERE ou.order_id = $1", request.OrderID,
	)
	if err != nil {
		http.Error(w, "Failed to fetch updated products", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var products []ProductResponse
	for rows.Next() {
		var product ProductResponse
		if err := rows.Scan(&product.ProductID, &product.ProductName, &product.ProductImage, &product.Quantity, &product.EstimatedDeliveryTime); err != nil {
			http.Error(w, "Failed to parse product data", http.StatusInternalServerError)
			return
			}

		products = append(products, product)
	}

	// Prepare response
	response := UpdateOrderResponse{
		OrderID:        request.OrderID,
		UserID:         request.UserID,
		OrderCostCents: totalCostCents,
		OrderCreatedAt: orderCreatedAt,
		Products:       products,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err) // Debug log
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func requestProductIDsToSlice(updatedProductIDs map[string]bool) []string {
	var productIDs []string
	for productID := range updatedProductIDs {
		productIDs = append(productIDs, productID)
	}
	return productIDs
}
