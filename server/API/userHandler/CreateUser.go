//done.
package userHandler

import (
	"server/database"
	"encoding/json"
	"fmt"
	"net/http"
)

// Define the structure for the product
type User struct {
	ID          int     `json:"id"`
	Email       string  `json:"image"`
	Password    string  `json:"name"`
	FirstName   string  `json:"first_name"`
	LastName    string  `json:"last_name"`
}

// Function to insert product into the database
func CreateUser(user *User) error {
	//add in id upon creating new prods
	query := `
		INSERT INTO users (
			id,
			email,  
			password,
			first_name,
			last_name 
		) VALUES ($1, $2, $3, $4, $5)
	`
	_, err := database.DB.Exec(
		query,
		&user.ID,
		&user.Email,  
		&user.Password,
		&user.FirstName,
		&user.LastName,
	)
	
	if err != nil {
		return fmt.Errorf("failed to add an user: %v", err)
	}

	return nil
}

// Function to handle creating a new product
func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Parse the request body to extract product data
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Insert the product into the database
	err = CreateUser(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send success response
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, "Account created successfully")
}