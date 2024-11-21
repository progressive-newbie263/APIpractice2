- Dự án sử dụng vanilla js, vanilla css + html để thiết kế giao diện người dùng
- Sử dụng Go để thiết kế backend và APIs.

- Các thư viện sử dụng ngoài luồng: 
  - dayjs để làm ngày/tháng/năm cho javascript.
  - github.com/gorilla/mux để làm router cho APIs
  - github.com/lib/pq để đấu nối backend với database postgres.
  - github.com/rs/cors để làm chuẩn CORS , đấu nối với API nội địa
  - github.com/golang-jwt/jwt/v5 để làm json web token cho user
  
  
  //- import "github.com/nicksnyder/go-i18n/v2/i18n" làm bộ chuyển đổi ngôn ngữ
  //bỏ qua cái này đi. Hiện tại thử nghiệm làm bộ chuyển ngữ cho trang ToS trước. Cách làm là tạo sẵn chuỗi dữ liệu, trước và sau khi dịch, rồi toggle qua lại thông qua
  //thanh selector.


  //đường dẫn này đảm bảo kết nối được tới các file hình ảnh và css/js.
	myRouter.PathPrefix("/images/").Handler(http.StripPrefix("/images/", http.FileServer(http.Dir("../images"))))
	myRouter.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("../admin/static"))))

  
  note: 8/11/2024: 
  Có 1 lỗi liên quan đến productsHTML. Có thể xử lí bằng cách loại bỏ đi function userAccountButton ở tracking.js và orders.js.

  20/11/2024:
- sẽ làm những thứ sau: 
 + cố gắng sửa cái tính năng chọn màu. đại khái là, khi bấm vào nút chọn màu thì sản phẩm cũng chuyển sang màu được chọn ấy (xáo hình ảnh qua API)
 

 + tính năng sửa order cho người dùng. Cho phép, sau 2 tiếng kể từ khi đặt order thì họ được quyền chỉnh sửa. Sau 2 tiếng thì khoá lại.
        - ý tưởng: viết API PUT, đặt thời gian chờ 2 tiếng. Sau đó thì tìm cách dùng API ấy qua frontend.


 + tính năng đặt cooldown cho đổi tên, đổi pass, đổi địa chỉ (90 ngày nhỉ ?)

 + thay thế 1 số 'alert' với các message dạng pop-up (phía góc bên phải trang web ?)