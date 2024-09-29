package productHandler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/database"
)

// redefine the structure for the product (reuse the existing Product struct from before)
//type Product struct {} ...

// Function to update a product in the database by product name
func UpdateProduct(product *Product) error {
	query := `
		UPDATE products 
		SET
			image = $2,  
			name = $3, 
			ratingstars = $4,
			ratingcount = $5,
			pricecents = $6,
			keywords = $7,
			type = $8,
			sizechartlink = $9,
			instructionslink = $10,
			warrantylink = $11 
		WHERE
			id = $1 
	`
	//result, err := database.DB.Exec(
	result, err := database.DB.Exec(
		query,
		product.ID,
		product.Image,  
		product.Name,
		product.RatingStars,
		product.RatingCount,
		product.PriceCents, 
		product.Keywords,
		product.Type,
		product.SizeChartLink,
		product.InstructionsLink,
		product.WarrantyLink)
	
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
		return fmt.Errorf("product with ID %s not found", product.ID)
	}

	return nil
}

// Function to handle updating an existing product
func UpdateProductHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow PUT method
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	
	var product Product // Parse the request body to extract product data
	err := json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Update the product in the database
	err = UpdateProduct(&product)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send success response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Product updated successfully")
}

