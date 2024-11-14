package main

import (
	"log"
	"mime"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"

	//internal:
	"server/API/adminHandler"
	//"server/API/accountHandler"
	"server/API/orderHandler"
	"server/API/productHandler"
	"server/API/userHandler"
	"server/controllers"
	"server/database"

	//"server/middleware"
	"github.com/rs/cors"
)

//built-in middleware function:
func corsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
}

func handleRequests() {
	myRouter := mux.NewRouter().StrictSlash(true)

	//static (js and css)
	mime.AddExtensionType(".js", "application/javascript")
	mime.AddExtensionType(".css", "text/css")
	
	//mime errors handler for images.
	mime.AddExtensionType(".jpg", "image/jpg")
	mime.AddExtensionType(".jpeg", "image/jpeg")
	mime.AddExtensionType(".png", "image/png")
	mime.AddExtensionType(".gif", "image/gif")
	mime.AddExtensionType(".svg", "image/svg+xml")
	mime.AddExtensionType(".bmp", "image/bmp")
	mime.AddExtensionType(".webp", "image/webp")

	//admin page route
	myRouter.HandleFunc("/admin", adminHandler.AdminPageHandler).Methods("GET")
	myRouter.HandleFunc("/admin/products", adminHandler.ProductPageHandler).Methods("GET")
	myRouter.HandleFunc("/admin/users", adminHandler.UserPageHandler).Methods("GET")
	myRouter.HandleFunc("/admin/orders", adminHandler.OrdersPageHandler).Methods("GET")

	//admin page, thông số
	myRouter.HandleFunc("/admin/total-sales", adminHandler.GetTotalSales).Methods("GET")
	myRouter.HandleFunc("/admin/total-orders", adminHandler.GetTotalOrders).Methods("GET")
	myRouter.HandleFunc("/admin/total-users", adminHandler.GetTotalUsers).Methods("GET")


	//ảnh + js/css
	myRouter.PathPrefix("/images/").Handler(http.StripPrefix("/images/", http.FileServer(http.Dir("../images"))))
	myRouter.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("../admin/static"))))

	//products API
	myRouter.HandleFunc("/api/products", database.GetProductsHandler).Methods("GET")
	myRouter.HandleFunc("/api/products/{id}", productHandler.SearchProductByIDHandler).Methods("GET")	//getting a specific product via searching its ID, finished successfully
	myRouter.HandleFunc("/api/products/create", productHandler.CreateProductHandler).Methods("POST")		//posting/creating a brand new product, finished successfully
	myRouter.HandleFunc("/api/products/update", productHandler.UpdateProductHandler).Methods("PUT")		//updating an existing product, finished successfully
	myRouter.HandleFunc("/api/products/delete", productHandler.DeleteProductHandler).Methods("DELETE")	//deleting a product from database

	//users API, test cho vui. Khong su dung doan crud api user nay.
	myRouter.HandleFunc("/users", database.GetUsersHandler).Methods("GET") //getting all users inside database //done
	myRouter.HandleFunc("/users/{id}", userHandler.SearchUserByIDHandler).Methods("GET") //getting all users inside database //done
	myRouter.HandleFunc("/users", userHandler.CreateUserHandler).Methods("POST") //create a new user. //done
	myRouter.HandleFunc("/users", userHandler.DeleteUserHandler).Methods("DELETE")	//deleting a product from database // done
	myRouter.HandleFunc("/users", userHandler.UpdateUserHandler).Methods("PUT")		//updating an user account //done.
	
	//login API
	myRouter.HandleFunc("/api/login", controllers.Login).Methods("POST") 
	myRouter.HandleFunc("/api/register", controllers.Register).Methods("POST") 
	myRouter.HandleFunc("/api/user", controllers.User).Methods("GET")	
	myRouter.HandleFunc("/api/logout", controllers.Logout).Methods("POST")
	
	//cart API
	//không cần lưu cart vào database
	// myRouter.HandleFunc("/api/cart", cartHandler.SaveCartToDatabase).Methods("POST")
	// myRouter.HandleFunc("/api/cart", cartHandler.GetCartFromDatabase).Methods("GET") 

	//orderAPI
	//create order will create and fill in database both order_user and orders.
	myRouter.HandleFunc("/api/orders", orderHandler.CreateOrder).Methods("POST") //post cart ==> order. 
	myRouter.HandleFunc("/api/all-orders", orderHandler.GetAllOrders).Methods("GET") //lấy all orders in db
	myRouter.HandleFunc("/api/order-details", orderHandler.GetOrderDetails).Methods("GET") // test; thêm ?order_id={orderId} vào: http://localhost:8082/api/order-details?order_id=Ig1cWE2tOMXzpC9mvfxo
	myRouter.HandleFunc("/api/order-history", orderHandler.GetOrdersByUserID).Methods("GET") //api này dùng để truy ra toàn bộ lịch sử order của 1 user.
	//order cần viết 1 api post ở dưới đây. Cho phép khi ng dùng xoá order hoặc admin xoá order thì nó sẽ xoá luôn order trong db

	//API để chỉnh sửa thông tin cá nhân của người dùng:
	//myRouter.HandleFunc("/api/user-settings/change-name", accountHandler.ChangeUserName).Methods("PUT");


	//middleware code which allows connections to database from outer source (?)
	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://127.0.0.1:5500", 
			"http://localhost:8082", 
			"http://localhost:5500"}, //frontend origin location
		
		AllowCredentials: true,
		
		//maybe only 'GET' ?
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},//{"GET"} only  
		
		AllowedHeaders: []string{"Authorization", "Content-Type"},
	})

	// Apply CORS to the router
	handler := c.Handler(myRouter)

	//set port 8082 for project
	log.Fatal(http.ListenAndServe(":8082", handler))
}

func main() {
	psqlconn := "postgres://postgres:26032004@localhost/ecommerce-db?sslmode=disable"
	database.Connect(psqlconn)
	defer database.DB.Close()

  handleRequests()
}