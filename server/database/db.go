package database

import (
    "database/sql"
    _ "github.com/lib/pq"
    "log"
    "net/http"
    "encoding/json"
    "fmt"
    //"strconv"
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
    IsActive            bool    `json:"is_active"`
}

//function for searching products via keywords (in amazon.html)
func SearchProducts(query string) ([]Product, error) {
    query = "%" + query + "%"
    sqlQuery := `
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
            warrantylink,
            is_active 
        FROM products
        WHERE keywords ILIKE $1
    `
    rows, err := DB.Query(sqlQuery, query)
    if err != nil {
        return nil, err
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
            &product.IsActive,
        )
        if err != nil {
            return nil, err
        }
        products = append(products, product)
    }

    return products, nil
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
            warrantylink,
            is_active 
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
            &product.IsActive, 
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
        warrantylink,
        is_active 
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
        &product.IsActive, 
    )
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("no product found with ID %s", productID)
        }
        return nil, err
    }

    return &product, nil
}


//queries cho bảng USERS
type User struct {
    ID          int     `json:"id"`
    Name        string  `json:"name"`
    Email       string  `json:"email"`
    Password    []byte  `json:"password"`
    Role        string  `json:"role"`
    Location    sql.NullString  `json:"location"`  // để nullstring, vì khi đăng kí, mình định không cho trường "Location" vào. Nó sẽ xuất hiện sau này, trong "Settings" của account.
}

func GetUsersHandler(w http.ResponseWriter, r *http.Request) {
    rows, err := DB.Query(`
        SELECT 
            id,
            email,
            password,
            name,
            role,         
            location     
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
            &user.Name,
            &user.Role,         // Scan cột role
            &user.Location,     // Scan cột location
        )
        if err != nil {
            http.Error(w, "Failed to scan row", http.StatusInternalServerError)
            return
        }

        users = append(users, user)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
}

func SearchUserByID(userID int) (*User, error) {
    var user User

    query := `SELECT 
        id,
        email,
        password,
        name,
        role,         
        location     
    FROM users WHERE id = $1`

    err := DB.QueryRow(query, userID).Scan(
        &user.ID,
        &user.Email,
        &user.Password,
        &user.Name,
        &user.Role,         // Scan role
        &user.Location,     // Scan location
    )
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("no user found with ID %d", userID)
        }
        return nil, err
    }

    return &user, nil
}



