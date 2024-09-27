//completed , worked.
package productHandler

import (
	"APIpractice2/server/database"
	"encoding/json"
	"fmt"
	"net/http"
	"database/sql" //to get sql.NullString type
)

// Define the structure for the product
type Product struct {
	ID                  string  				`json:"id"`
	Image               string  				`json:"image"`
	Name                string  				`json:"name"`
	RatingStars         float64 				`json:"ratingstars"`
	RatingCount         int     				`json:"ratingcount"`
	PriceCents          int     				`json:"pricecents"`
	Keywords            string  				`json:"keywords"`
	Type                string  				`json:"type"`
	SizeChartLink       sql.NullString  `json:"sizechartlink"`
	InstructionsLink    sql.NullString  `json:"instructionslink"`
	WarrantyLink        sql.NullString  `json:"warrantylink"`
}

// Function to insert product into the database
func CreateProduct(product *Product) error {
	//add in id upon creating new prods
	query := `
		INSERT INTO products (
			id,
			image,  
			name,
			ratingstars,
			ratingcount,
			pricecents,
			keywords,
			type,
			sizechartlink,
			instructionslink,
			warrantylink 
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := database.DB.Exec(
		query,
		&product.ID,
		&product.Image,  
		&product.Name,
		&product.RatingStars,
		&product.RatingCount,
		&product.PriceCents, 
		&product.Keywords,
		&product.Type,
		&product.SizeChartLink,
		&product.InstructionsLink,
		&product.WarrantyLink)
	
	if err != nil {
		return fmt.Errorf("failed to insert product: %v", err)
	}

	return nil
}

// Function to handle creating a new product
func CreateProductHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Parse the request body to extract product data
	var product Product
	err := json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Insert the product into the database
	err = CreateProduct(&product)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send success response
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, "Product created successfully")
}