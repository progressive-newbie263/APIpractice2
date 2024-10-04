- Dự án sử dụng vanilla js, vanilla css + html để thiết kế giao diện người dùng
- Sử dụng Go để thiết kế backend và APIs.

- Các thư viện sử dụng ngoài luồng: 
  - dayjs để làm ngày/tháng/năm cho javascript.
  - github.com/gorilla/mux để làm router cho APIs
  - github.com/lib/pq để đấu nối backend với database postgres.
  - github.com/rs/cors để làm chuẩn CORS , đấu nối với API nội địa
  - github.com/golang-jwt/jwt/v5 để làm json web token cho user
  - import "github.com/nicksnyder/go-i18n/v2/i18n" làm bộ chuyển đổi ngôn ngữ


	myRouter.PathPrefix("/images/").Handler(http.StripPrefix("/images/", http.FileServer(http.Dir("../images"))))
	myRouter.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("../admin/static"))))