package productHandler

import (
	"database/sql" // để sử dụng sql.NullString
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"server/database"
)

// Define the structure for the product
type Product struct {
	ID               string         `json:"id"`
	Image            string         `json:"image"`
	Name             string         `json:"name"`
	RatingStars      float64        `json:"ratingstars"`
	RatingCount      int            `json:"ratingcount"`
	PriceCents       int            `json:"pricecents"`
	Keywords         string         `json:"keywords"`
	Type             string         `json:"type"`
	SizeChartLink    sql.NullString `json:"sizechartlink"`
	InstructionsLink sql.NullString `json:"instructionslink"`
	WarrantyLink     sql.NullString `json:"warrantylink"`
	IsActive            bool    `json:"is_active"`
}

// Custom function to generate UUID similar to JavaScript's generateUUID()
func generateUUID() string {
	const uuidFormat = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
	const hexChars = "0123456789abcdef"
	var uuid strings.Builder
	rand.Seed(time.Now().UnixNano())

	for i, c := range uuidFormat {
		if c == 'x' {
			uuid.WriteByte(hexChars[rand.Intn(16)])
		} else if c == 'y' {
			// 'y' will be one of '8', '9', 'a', or 'b'
			uuid.WriteByte(hexChars[(rand.Intn(4)+8)])
		} else {
			uuid.WriteByte(byte(c))
		}

		// Ensure the 15th character is '4' (index 14)
		if i == 14 {
			uuid.WriteByte('4')
		}
	}

	return uuid.String()
}

// Function to insert product into the database
func CreateProduct(product *Product) error {
	// Generate a custom UUID if the product ID is empty
	if product.ID == "" {
		product.ID = generateUUID()
	}

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
			warrantylink,
			is_active 
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`
	_, err := database.DB.Exec(
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
		product.WarrantyLink,
		product.IsActive,
	)

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
