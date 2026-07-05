MÔ TẢ CHI TIẾT CHỨC NĂNG
ĐỒ ÁN TỐT NGHIỆP
QUẢN LÝ THƯ VIỆN SÁCH (READER)
1. Module 1 — Xác thực & Hồ sơ Độc giả
STT Chức năng Mô tả chi tiết Ưu 
tiên
1 Đăng ký tài khoản Đăng ký bằng email + mật khẩu hoặc số thẻ thư viện. Gửi email 
xác minh, bắt buộc xác nhận trước khi dùng đầy đủ tính năng.
Cao
2 Đăng nhập OAuth 
(Google)
Hỗ trợ đăng nhập nhanh qua Google. Tự động điền tên, ảnh đại 
diện.
Cao
3 Quên mật khẩu Gửi link reset qua email, hiệu lực 15 phút, dùng 1 lần. Cao
4 Cập nhật hồ sơ Chỉnh sửa: họ tên, địa chỉ, số điện thoại, ảnh đại diện. Trung 
bình
5 Xem thông tin thẻ thư 
viện
Hiển thị: số thẻ, ngày cấp, ngày hết hạn, hạn mức mượn (số sách 
tối đa, số ngày tối đa). Trạng thái thẻ: hợp lệ / hết hạn / bị khóa.
Cao
6 Gia hạn thẻ trực tuyến Độc giả yêu cầu gia hạn thẻ qua app. Hệ thống gửi thông báo cho 
Thủ thư duyệt và cập nhật ngày hết hạn.
Trung 
bình
2. Module 2 — Tìm kiếm & Khám phá Sách
STT Chức năng Mô tả chi tiết Ưu 
tiên
1 Tìm kiếm toàn văn Tìm theo: tên sách, tên tác giả, ISBN, từ khóa trong mô tả. Hiển 
thị kết quả ngay khi gõ (debounce 300ms).
Cao
2 Tìm kiếm không dấu 
tiếng Việt
Nhập 'co tich' tìm được 'Cổ tích', nhập 'nguyen du' tìm được 
'Nguyễn Du'. Xử lý bằng MeiliSearch hoặc PostgreSQL unaccent 
extension.
Cao
3 Lọc kết quả Lọc theo: thể loại, tác giả, NXB, năm xuất bản, ngôn ngữ, khoảng 
năm.
Cao
4 Lọc chỉ hiện sách có sẵn Checkbox 'Chỉ hiện sách đang có sẵn để mượn'. Hệ thống kiểm 
tra số bản sao trạng thái 'available' > 0.
Cao
5 Trang chi tiết sách Hiển thị đầy đủ: ảnh bìa, tên, tác giả, NXB, năm, thể loại, mô tả, 
số trang, ISBN, số bản sao có sẵn, rating trung bình.
Cao
6 Đánh giá & Nhận xét Độc giả rating 1-5 sao và viết bình luận sau khi mượn và trả sách 
đó. Phân trang bình luận.
Cao
7 Sách liên quan Đề xuất: sách cùng tác giả, sách cùng thể loại hiển thị ở cuối 
trang chi tiết.
Trung 
bình
8 Danh sách nổi bật Trang chủ hiển thị: Sách mới nhập, Sách được mượn nhiều nhất, 
Sách nổi bật (admin chọn).
Trung 
bình
9 Lưu sách yêu thích Độc giả lưu sách vào danh sách 'Yêu thích' hoặc 'Đọc sau'. Quản 
lý trong trang cá nhân.
Trung 
bình
Module 2 — AI: Chatbot Tìm sách & Tư vấn
STT Chức năng AI Mô tả chi tiết Công nghệ AI Ưu 
tiên
1 Tìm sách bằng ngôn 
ngữ tự nhiên
Hỏi: 'Tôi muốn đọc sách về lãnh đạo dành cho 
người mới đi làm'. Chatbot hiểu và tìm sách 
phù hợp ngay.
Semantic search + GPT-
4o
Cao
2 Giới thiệu & tóm tắt 
sách
Chatbot giới thiệu nội dung sách, đối tượng 
phù hợp, điểm nổi bật từ metadata và review.
RAG + LLM Cao
3 Kiểm tra tình trạng 
sách
Hỏi: 'Sách Atomic Habits còn không?'. 
Chatbot kiểm tra DB real-time và trả lời.
Function Calling + API Cao
4 Hỗ trợ đặt trước qua 
chat
Người dùng nói 'Đặt trước cuốn đó cho tôi'. 
Chatbot xác nhận và đặt trực tiếp.
Function Calling + DB Cao
5 Hỏi đáp quy trình thư 
viện
Trả lời: phí phạt quá hạn bao nhiêu, được 
mượn tối đa mấy cuốn, gia hạn như thế nào...
RAG từ knowledge 
base
Cao
6 Gợi ý sách tiếp theo Sau khi trả sách, chatbot hỏi cảm nhận và gợi 
ý sách tiếp theo phù hợp.
Collaborative + LLM Trung 
bình
7 Lịch sử hội thoại Nhớ sách đã hỏi trong session, không hỏi lại 
thông tin đã có.
LangChain Memory Cao
3. Module 3 — Đặt trước Sách (Reservation)
STT Chức năng Mô tả chi tiết Ưu 
tiên
1 Đặt trước sách Khi sách không có bản sao 'available', hiện nút 'Đặt trước'. Độc 
giả xác nhận và vào hàng chờ FIFO.
Cao
2 Xem vị trí hàng chờ Độc giả thấy vị trí của mình trong hàng chờ (ví dụ: 'Bạn đang xếp 
thứ 3'). Cập nhật khi có người phía trước hủy.
Cao
3 Nhận thông báo khi có 
sách
Khi bản sao được trả về, hệ thống tự động email cho người đầu 
hàng chờ. Độc giả có 2 ngày đến mượn.
Cao
4 Hủy đặt trước Độc giả tự hủy đặt trước. Hệ thống cập nhật hàng chờ, người tiếp 
theo lên đầu.
Cao
5 Tự động hủy quá hạn Nếu độc giả không đến trong 2 ngày sau thông báo, tự động hủy 
và email cho người tiếp theo. (Xử lý bằng Cron Job đơn giản).
Cao
4. Module 4 — Theo dõi Lịch sử Mượn/Trả (Độc giả)
STT Chức năng Mô tả chi tiết Ưu 
tiên
1 Sách đang mượn Danh sách sách hiện đang mượn: tên sách, ngày mượn, hạn trả, 
số ngày còn lại. Màu cảnh báo: xanh (> 3 ngày), vàng (1-3 ngày), 
đỏ (quá hạn).
Cao
2 Gia hạn trực tuyến Nút 'Gia hạn' ngay trên danh sách đang mượn. Kiểm tra: còn lượt 
gia hạn không, có ai đặt trước sách đó không.
Cao
3 Đặt trước đang chờ Hiển thị danh sách sách đã đặt trước, vị trí trong hàng chờ, trạng 
thái.
Cao
4 Lịch sử mượn/trả Toàn bộ lịch sử từ trước đến nay: tên sách, ngày mượn, ngày trả
thực tế, tình trạng trả (đúng hạn/trễ hạn).
Cao
5 Lịch sử phí Xem các khoản phí: đang nợ, đã nộp. Chi tiết: sách gì, trễ bao 
nhiêu ngày, số tiền.
Cao
6 Danh sách đọc cá nhân Quản lý 3 danh sách: 'Đang đọc', 'Muốn đọc', 'Đã đọc'. Thêm ghi 
chú cá nhân cho từng sách.
Trung 
bình
5. Module 5 — Thông báo (Độc giả)
STT Chức năng Mô tả chi tiết Ưu 
tiên
1 Email nhắc trả sách 
trước 3 ngày
Cron Job chạy mỗi sáng, quét giao dịch sẽ đến hạn trong 3 ngày, 
gửi email nhắc độc giả.
Cao
2 Email nhắc trả sách 
trước 1 ngày
Tương tự, quét giao dịch đến hạn ngày mai. Cao
3 Email thông báo quá 
hạn
Khi sách bị quá hạn, gửi email hàng ngày cho đến khi trả. Nêu rõ 
số tiền phí tích lũy.
Cao
4 Email sách đặt trước đã 
có sẵn
Gửi ngay khi bản sao được trả về. Nội dung: tên sách, thư viện, 
thời hạn đến mượn (2 ngày).
Cao
5 Thông báo in-app Hiển thị badge và danh sách thông báo: gia hạn thành công, trả
sách xác nhận, đặt trước có sẵn.
Cao
6 Tóm tắt hàng tuần Mỗi Thứ 2, gửi email: số sách đang mượn, hạn trả gần nhất, phí 
đang nợ (nếu có).
Trung 
bình
6. Module 6 — Gợi ý & Cá nhân hóa
STT Chức năng Mô tả chi tiết Ưu 
tiên
1 Gợi ý theo lịch sử mượn Dựa trên thể loại và tác giả độc giả đã mượn, đề xuất các sách 
tương tự chưa đọc.
Cao
2 Độc giả tương tự cùng 
mượn
Simple collaborative filtering: độc giả mượn A và B cùng mượn 
C → gợi ý C cho người chỉ mượn A.
Trung 
bình
3 Chia sẻ danh sách yêu 
thích
Tạo link public cho danh sách yêu thích, chia sẻ lên mạng xã hội. Thấp