//done, worked
package userHandler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"APIpractice2/server/database"
)

// Function to update a product in the database by product name
func DeleteUser(userID int) error {
	query := `
		DELETE FROM users WHERE id = $1 
	`
	//result, err := database.DB.Exec(
	result, err := database.DB.Exec(query, userID)
	
	//if not found ? 
	if err != nil {
		return fmt.Errorf("failed to delete product: %v", err)
	}
	
	//temp remove. issue with id
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %v", err)
	}
	
	// If no rows were updated, it means the product ID doesn't exist
	if rowsAffected == 0 {
		return fmt.Errorf("user with ID %d not found", userID)
	}

	return nil
}

// Function to handle updating an existing product
func DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow PUT method
	if r.Method != http.MethodDelete {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	
	// Parse the request body to extract product data
	var user struct {
		ID int `json:"id"`
	}
	 
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Update the product in the database
	err = DeleteUser(user.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send success response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Product deleted successfully")
}

