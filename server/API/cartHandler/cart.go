package cartHandler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"server/database"
	"strconv"

	_ "github.com/lib/pq" // Driver PostgreSQL
)

// Cấu trúc cho từng mục trong giỏ hàng
type CartItem struct {
	UserID           int    	`json:"user_id"`
	ProductID        string 	`json:"product_id"`
	Quantity         int    	`json:"quantity"`
	DeliveryOptionID string  	`json:"delivery_option_id"`
}

func SaveCartToDatabase(w http.ResponseWriter, r *http.Request) {
	// Read data from the request body
	var cartItems []CartItem
	err := json.NewDecoder(r.Body).Decode(&cartItems)
	if err != nil {
		http.Error(w, "Error decoding JSON", http.StatusBadRequest)
		return
	}

	//no need to force shut db if the JSOn sent is incorrect.
	//defer database.DB.Close()

	// Save each item in the cart to the database
	for _, item := range cartItems {
		_, err := database.DB.Exec(`INSERT INTO cart_user (user_id, product_id, quantity, delivery_option_id)
													VALUES ($1, $2, $3, $4)
													ON CONFLICT (user_id, product_id) DO UPDATE
													SET quantity = $3, delivery_option_id = $4`,
			item.UserID, item.ProductID, item.Quantity, item.DeliveryOptionID,
		)
		if err != nil {
			log.Println("Error saving cart item:", err)
			http.Error(w, "Failed to save cart", http.StatusInternalServerError)
			return
		}
	}

	// Send success response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Cart saved successfully"})
	fmt.Println("Received cart items from localStorage:", cartItems)
}

func GetCartFromDatabase(w http.ResponseWriter, r *http.Request) {
	// Retrieve userId from query parameters
	userIdStr := r.URL.Query().Get("userId")
	if userIdStr == "" {
		http.Error(w, "User ID not provided", http.StatusBadRequest)
		return
	}

	// Convert userId to an integer
	userId, err := strconv.Atoi(userIdStr)
	if err != nil {
		http.Error(w, "Invalid User ID", http.StatusBadRequest)
		return
	}

	// Query the cart from the database
	rows, err := database.DB.Query(`
		SELECT product_id, quantity, delivery_option_id 
		FROM cart_user 
		WHERE user_id = $1`, userId)
	if err != nil {
		http.Error(w, "Error querying database", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Process rows and build cart items
	var cartItems []CartItem
	for rows.Next() {
		var item CartItem
		if err := rows.Scan(&item.ProductID, &item.Quantity, &item.DeliveryOptionID); err != nil {
			http.Error(w, "Error scanning rows", http.StatusInternalServerError)
			return
		}
		item.UserID = userId
		cartItems = append(cartItems, item)
	}

	// If no items, return a 404 error
	if len(cartItems) == 0 {
		http.Error(w, "Cart is empty", http.StatusNotFound)
		return
	}

	// Respond with the cart items in JSON format
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cartItems)
	fmt.Println("Loaded cart items from database:", cartItems)
}



