//completed
package userHandler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/database"
)

// Function to update an account in the database by user id
func UpdateUser(user *User) error {
	query := `
		UPDATE users
		SET
			email = $2,  
			password = $3,
			first_name = $4,
			last_name = $5 
		WHERE
			id = $1 
	`
	//result, err := database.DB.Exec(
	result, err := database.DB.Exec(
		query,
		user.ID,
		user.Email,  
		user.Password,
		user.FirstName,
		user.LastName,
	)
	
	//if not found ? 
	if err != nil {
		return fmt.Errorf("failed to update product: %v", err)
	}
	
	//temp remove. issue with id
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %v", err)
	}
	
	// If no rows were updated, it means the product ID doesn't exist
	if rowsAffected == 0 {
		return fmt.Errorf("User with ID %d not found", user.ID)
	}

	return nil
}

// Function to handle updating an existing product
func UpdateUserHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow PUT method
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	
	var user User // Parse the request body to extract product data
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Update the product in the database
	err = UpdateUser(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send success response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "User updated successfully")
}

