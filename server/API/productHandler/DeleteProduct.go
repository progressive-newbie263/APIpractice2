package productHandler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"APIpractice2/server/database"
)

// redefine the structure for the product (reuse the existing Product struct from before)
//type Product struct {} ...

// Function to update a product in the database by product name
func DeleteProduct(productID string) error {
	query := `
		DELETE FROM products WHERE id = $1 
	`
	//result, err := database.DB.Exec(
	result, err := database.DB.Exec(query, productID)
	
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
		return fmt.Errorf("product with ID %s not found", productID)
	}

	return nil
}

// Function to handle updating an existing product
func DeleteProductHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow PUT method
	if r.Method != http.MethodDelete {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	
	// Parse the request body to extract product data
	var product struct {
		ID string `json:"id"`
	}
	 
	err := json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Update the product in the database
	err = DeleteProduct(product.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send success response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Product deleted successfully")
}

