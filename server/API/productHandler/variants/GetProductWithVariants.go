package variants

import (
	"database/sql"
	"server/database"
	"encoding/json"
	"log"
	"net/http"
	"sort"
)

type ProductWithVariants struct {
	ID               string            `json:"id"`
	Image            string            `json:"image"`
	Name             string            `json:"name"`
	RatingStars      float64           `json:"ratingstars"`
	RatingCount      int               `json:"ratingcount"`
	PriceCents       int               `json:"pricecents"`
	Keywords         string            `json:"keywords"`
	Type             string            `json:"type"`
	SizeChartLink    sql.NullString    `json:"sizechartlink"`
	InstructionsLink sql.NullString    `json:"instructionslink"`
	WarrantyLink     sql.NullString    `json:"warrantylink"`
	Variants         []ClothingVariant `json:"variants"`
}

type ClothingVariant struct {
	Size         string `json:"size"`
	Color        string `json:"color"`
	ColoredImage string `json:"colored_image"`
}

func GetProductsWithVariantsHandler(w http.ResponseWriter, r *http.Request) {
	//Sắp xếp theo product id trong cơ sở dữ liệu
	sqlQuery := `
        SELECT 
            p.id, 
            p.image, 
            p.name, 
            p.ratingstars, 
            p.ratingcount, 
            p.pricecents, 
            p.keywords, 
            p.type, 
            p.sizechartlink, 
            p.instructionslink, 
            p.warrantylink,
            pc.size, 
            pc.color, 
            pc.colored_image
        FROM 
            products p
        LEFT JOIN 
            products_clothing pc
        ON 
            p.id = pc.product_id
        ORDER BY 
            p.id ASC;  
    `
	rows, err := database.DB.Query(sqlQuery)
	if err != nil {
		http.Error(w, "Failed to query products", http.StatusInternalServerError)
		log.Println("Query Error:", err)
		return
	}
	defer rows.Close()

	productsMap := make(map[string]*ProductWithVariants)

	for rows.Next() {
		var productID, image, name, keywords, productType string
		var size, color, coloredImage sql.NullString
		var ratingStars float64
		var ratingCount, priceCents int
		var sizeChartLink, instructionsLink, warrantyLink sql.NullString

		err := rows.Scan(&productID, &image, &name, &ratingStars, &ratingCount, &priceCents, &keywords, &productType, &sizeChartLink, &instructionsLink, &warrantyLink, &size, &color, &coloredImage)
		if err != nil {
			http.Error(w, "Failed to parse rows", http.StatusInternalServerError)
			log.Println("Row Scan Error:", err)
			return
		}

		// Check if the product already exists in the map
		if _, exists := productsMap[productID]; !exists {
			productsMap[productID] = &ProductWithVariants{
				ID:               productID,
				Image:            image,
				Name:             name,
				RatingStars:      ratingStars,
				RatingCount:      ratingCount,
				PriceCents:       priceCents,
				Keywords:         keywords,
				Type:             productType,
				SizeChartLink:    sizeChartLink,
				InstructionsLink: instructionsLink,
				WarrantyLink:     warrantyLink,
				Variants:         []ClothingVariant{},
			}
		}

		// Append variant if it exists
		if size.Valid && color.Valid && coloredImage.Valid {
			productsMap[productID].Variants = append(productsMap[productID].Variants, ClothingVariant{
				Size:         size.String,
				Color:        color.String,
				ColoredImage: coloredImage.String,
			})
		}
	}

	// Convert map to slice
	var products []ProductWithVariants
	for _, product := range productsMap {
		products = append(products, *product)
	}

	// Sắp xếp theo ID (theo thứ tự tăng dần)
	sort.SliceStable(products, func(i, j int) bool {
		return products[i].ID < products[j].ID
	})

	// Return JSON response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}
