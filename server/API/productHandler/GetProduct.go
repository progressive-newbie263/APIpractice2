package productHandler

import (
    "encoding/json"
    "net/http"
    "strings"
    "server/database" // Import the database package
)

// SearchProductByIDHandler searches for a product by ID and returns it as JSON
func SearchProductByIDHandler(w http.ResponseWriter, r *http.Request) {
    // Extract the product ID from the URL path
    path := strings.TrimPrefix(r.URL.Path, "/products/")
    
    if path == "" {
        http.Error(w, "Product ID is required", http.StatusBadRequest)
        return
    }

    // Call the SearchProductByID function from the database package
    product, err := database.SearchProductByID(path)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Return the product as JSON
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(product)
}
