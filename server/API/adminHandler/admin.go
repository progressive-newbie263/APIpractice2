package adminHandler

import (
  "net/http"
  "html/template"
)

func AdminPageHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("../admin/index.html")
	if err != nil {
		http.Error(w, "Unable to load admin page", http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, nil)
}

func ProductPageHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("../admin/product.html")
	if err != nil {
		http.Error(w, "Unable to load product page", http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, nil)
}

func OverviewPageHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("../admin/overview.html")
	if err != nil {
		http.Error(w, "Unable to load product page", http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, nil)
}

func UserPageHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("../admin/user.html")
	if err != nil {
		http.Error(w, "Unable to load user page", http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, nil)
}

func OrdersPageHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("../admin/order-page.html")
	if err != nil {
		http.Error(w, "Unable to load admin page", http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, nil)
}