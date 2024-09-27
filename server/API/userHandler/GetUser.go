//completed.
package userHandler

import (
	"encoding/json"
	"net/http"
	"strings"
	"strconv"
	"APIpractice2/server/database" // Import the database package
)

// SearchProductByIDHandler searches for a product by ID and returns it as JSON
func SearchUserByIDHandler(w http.ResponseWriter, r *http.Request) {
    // Extract the product ID from the URL path
    path := strings.TrimPrefix(r.URL.Path, "/users/")
    
    if path == "" {
			http.Error(w, "User ID is required", http.StatusBadRequest)
			return
    }

    // Call the SearchProductByID function from the database package
		// Convert the user ID to an integer
    userID, err := strconv.Atoi(path)
    if err != nil {
			http.Error(w, "Invalid User ID", http.StatusBadRequest)
			return
    }

		user, err := database.SearchUserByID(userID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Return the product as JSON
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}
