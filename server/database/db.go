package database

import (
    "database/sql"
    _ "github.com/lib/pq"
    "log"
    "net/http"
    "encoding/json"
    "fmt"
)

var DB *sql.DB

// Accept the connection string as a parameter
func Connect(connStr string) {
    var err error
    DB, err = sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal(err)
    }
}

//QUERIES FOR PRODUCTS TABLE
type Product struct {
    ID                  string  `json:"id"`
    Image               string  `json:"image"`
    Name                string  `json:"name"`
    RatingStars         float64 `json:"ratingstars"`
    RatingCount         int     `json:"ratingcount"`
    PriceCents          int     `json:"pricecents"`
    Keywords            string  `json:"keywords"`
    Type                string  `json:"type"`
    SizeChartLink       sql.NullString  `json:"sizechartlink"`
    InstructionsLink    sql.NullString  `json:"instructionslink"`
    WarrantyLink        sql.NullString  `json:"warrantylink"`
}


//convert db to JSON string:
//worked
func GetProductsHandler(w http.ResponseWriter, r *http.Request) {
    rows, err := DB.Query(`
        SELECT 
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
        FROM products
    `)
    if err != nil {
        http.Error(w, "Failed to retrieve data", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var products []Product
    for rows.Next() {
        var product Product
        err := rows.Scan(
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
            &product.WarrantyLink, 
        )
        if err != nil {
            http.Error(w, "Failed to scan row", http.StatusInternalServerError)
            return
        }
        
        products = append(products, product)
    }

    // Convert products slice to JSON
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(products)
}


// Internal function to query product by ID
func SearchProductByID(productID string) (*Product, error) {
    var product Product

    query := `SELECT 
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
    FROM products WHERE id = $1`

    err := DB.QueryRow(query, productID).Scan(
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
        &product.WarrantyLink, 
    )
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("no product found with ID %s", productID)
        }
        return nil, err
    }

    return &product, nil
}




//queries for users TABLE:
type User struct {
    ID          int     `json:"id"`
    Email       string  `json:"image"`
    Password    string  `json:"name"`
    FirstName   string  `json:"first_name"`
    LastName    string  `json:"last_name"`
}

func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
    rows, err := DB.Query(`
        SELECT 
            id,
            email,  
            password,
            first_name,
            last_name
        FROM users
    `)
    if err != nil {
        http.Error(w, "Failed to retrieve data", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var users []User
    for rows.Next() {
        var user User
        err := rows.Scan(
            &user.ID,
            &user.Email,  
            &user.Password,
            &user.FirstName,
            &user.LastName, 
        )
        if err != nil {
            http.Error(w, "Failed to scan row", http.StatusInternalServerError)
            return
        }
        
        users = append(users, user)
    }

    // Convert products slice to JSON
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
}

// Internal function to query product by ID
func SearchUserByID(userID int) (*User, error) {
    var user User

    query := `SELECT 
        id,
        email,  
        password,
        first_name,
        last_name 
    FROM products WHERE id = $1`

    err := DB.QueryRow(query, userID).Scan(
        &user.ID,
        &user.Email,  
        &user.Password,
        &user.FirstName,
        &user.LastName,  
    )
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("no user found with ID %d", userID)
        }
        return nil, err
    }

    return &user, nil
}