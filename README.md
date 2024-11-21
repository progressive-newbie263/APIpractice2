-en: fullstack ecommerce website, designed based off Amazon web page

-vi: build website fullstack, giả lập website amazon. Nộp cho đề án năm 3 kì 1, 2024-2025.

- hướng dẫn sử dụng khi download code về (tôi ko rõ cách xử lý việc export cái database?)
- nhưng nếu chuẩn bị được database thì hãy làm như sau trong github cmd:
   + chạy lệnh "go get + [tên thư viện sử dụng (mux/gorilla, uuid, ...)]" .
   + tải golang air về để dễ dàng cho việc deploy nó như một live server (không có air thì golang mất công chạy lại sau mỗi lần cập nhật code) (phải tắt server đi, rồi lại go run main.go....nói chung là tốn rất nhiều thời gian). Cách chạy air cho project này là trong cmd, nhập "cd server". Sau đó nhập "air". Đợi 1 tí để chạy xong backend. Sau đó có thể "open with live server" file "client/amazon.html" để bắt đầu sử dụng web.
   + 
