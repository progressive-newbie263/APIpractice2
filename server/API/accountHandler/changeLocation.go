package accountHandler

import (
	"encoding/json"
	"net/http"
	"server/database"
	"golang.org/x/crypto/bcrypt"
)

// đổi tên người dùng dựa trên userID và các trường khác từ payload
func UpdateLocation(w http.ResponseWriter, r *http.Request) {
	var data map[string]interface{}

	// Decode the JSON data from the request
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	//data từ payload
	newLocation, ok1 := data["newLocation"].(string)
	currentPassword, ok2 := data["currentPassword"].(string)
	userID, ok3 := data["userID"].(float64) // user ID là integer trong bảng users. COnvert nó sang.

	if !ok1 || !ok2 || !ok3 {
		http.Error(w, "Missing or invalid required fields", http.StatusBadRequest)
		return
	}

	// Convert userID to an integer
	userIDInt := int(userID)

	// Check if the newUsername or currentPassword is empty
	if newLocation == "" || currentPassword == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Check if the user exists and retrieve their hashed password
	var hashedPassword string
	err := database.DB.QueryRow(`SELECT password FROM users WHERE id = $1`, userIDInt).Scan(&hashedPassword)
	if err != nil {
		http.Error(w, "User not found or unable to retrieve password", http.StatusUnauthorized)
		return
	}

	// Verify the current password
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(currentPassword))
	if err != nil {
		http.Error(w, "Invalid current password", http.StatusUnauthorized)
		return
	}

	// Update the username in the database
	_, err = database.DB.Exec(`UPDATE users SET location = $1 WHERE id = $2`, newLocation, userIDInt)
	if err != nil {
		http.Error(w, "Failed to update location", http.StatusInternalServerError)
		return
	}

	// Send success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Location updated successfully"})
}


