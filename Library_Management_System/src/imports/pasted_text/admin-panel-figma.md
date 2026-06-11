# FIGMA PROMPT — ADMIN PANEL HỆ THỐNG QUẢN LÝ THƯ VIỆN
## Đồ án tốt nghiệp — Vận hành & Báo cáo Thư viện (MANAGEMENT)
### Phiên bản đầy đủ — 45 màn hình / 7 tab

---

## PHẦN 1 — DESIGN SYSTEM & THIẾT LẬP CHUNG

```
DESIGN SYSTEM TOÀN HỆ THỐNG:

Màu sắc:
  Primary:       #1A56DB  (xanh dương đậm)
  Primary hover: #1447B5
  Sidebar bg:    #1E2A3B  (navy tối)
  Sidebar text active:   #FFFFFF
  Sidebar text inactive: #8FA3BF
  Content bg:    #F8FAFC
  Card bg:       #FFFFFF
  Border:        #E2E8F0
  Success:       #10B981 / bg: #ECFDF5 / text: #065F46
  Warning:       #F59E0B / bg: #FFFBEB / text: #92400E
  Danger:        #EF4444 / bg: #FEF2F2 / text: #991B1B
  Info:          #3B82F6 / bg: #EFF6FF / text: #1E40AF
  Text primary:  #111827
  Text secondary:#6B7280
  Text muted:    #9CA3AF

Typography:
  Font:          Inter
  Heading 1:     24px / weight 700
  Heading 2:     20px / weight 600
  Heading 3:     16px / weight 600
  Body:          14px / weight 400
  Small:         12px / weight 400
  Label:         12px / weight 500 / uppercase / letter-spacing 0.5px

Spacing:
  Base unit: 4px
  Card padding: 24px
  Section gap: 32px
  Component gap: 16px

Border radius:
  Button/Input/Badge: 6px
  Card:               8px
  Modal:              12px
  Avatar:             50% (circle)

Shadows:
  Card:   0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
  Modal:  0 20px 60px rgba(0,0,0,0.15)
  Dropdown: 0 4px 16px rgba(0,0,0,0.12)

Icons: Lucide Icons (outline style, 20px default, 16px small, 24px large)

LAYOUT ADMIN (cố định cho mọi màn hình):
  Sidebar: 240px cố định bên trái, background #1E2A3B
  Header:  64px, background #FFFFFF, border-bottom 1px #E2E8F0
  Content: phần còn lại, background #F8FAFC, padding 24px
  Collapsed sidebar: 64px (chỉ icon)

BREAKPOINT: Thiết kế cho màn hình 1440px. Min: 1280px.
```

---

## PHẦN 2 — SIDEBAR COMPONENT (Tái sử dụng mọi màn hình)

```
SIDEBAR COMPONENT (width: 240px, height: 100vh, bg: #1E2A3B, fixed):

LOGO AREA (height: 64px, padding: 0 16px):
  - Icon sách (BookOpen, 28px, màu #60A5FA)
  - Text "Thư Viện ABC" (16px, weight 600, màu #FFFFFF)
  - Divider 1px #2D3F52 bên dưới

NAV ITEMS (padding: 8px):
  Mỗi item (height: 44px, padding: 0 12px, border-radius: 6px):
    - Icon Lucide 20px + Label 14px
    - Normal state:  text #8FA3BF, background transparent
    - Hover state:   background #263A50, text #FFFFFF
    - Active state:  background #2563EB, text #FFFFFF, border-left 3px solid #60A5FA

  Danh sách 7 nav items theo thứ tự:
  1. icon: LayoutDashboard  | label: "Dashboard"
  2. icon: BookOpen         | label: "Quản lý Sách"      | có chevron-down (sub-menu)
  3. icon: Archive          | label: "Quản lý Kho"        | có chevron-down (sub-menu)
  4. icon: ArrowLeftRight   | label: "Giao dịch"          | có chevron-down + badge đỏ (số sách quá hạn)
  5. icon: CreditCard       | label: "Tài chính"          | có chevron-down
  6. icon: BarChart2        | label: "Báo cáo"            | có chevron-down
  7. icon: Settings         | label: "Cài đặt"            | có chevron-down

  SUB-MENU khi mở (indent 12px, item height 36px, text 13px, màu #8FA3BF, hover #FFFFFF):
  Tab Quản lý Sách:    Danh sách sách / Thêm sách / Tác giả & Thể loại / Sách nổi bật
  Tab Quản lý Kho:     Danh sách bản sao / Thêm bản sao & In QR / Import & Thanh lý / Báo cáo kho
  Tab Giao dịch:       Mượn / Trả sách / Gia hạn & Đặt trước / Lịch sử giao dịch / Quản lý độc giả
  Tab Tài chính:       Danh sách phí / Báo cáo doanh thu
  Tab Báo cáo:         Báo cáo hoạt động / Sách quá hạn / AI Analytics
  Tab Cài đặt:         Tất cả sections

BOTTOM AREA (position: absolute, bottom: 0, width: 100%, padding: 16px):
  - Divider 1px #2D3F52
  - Avatar tròn 32px (màu nền #2563EB, chữ cái đầu màu trắng)
  - Tên: "Admin Nguyễn Văn A" (13px, trắng)
  - Sub: "Quản trị viên" (11px, #8FA3BF)
  - Icon LogOut 16px màu #8FA3BF, hover đỏ, góc phải
```

---

## PHẦN 3 — HEADER COMPONENT (Tái sử dụng mọi màn hình)

```
HEADER COMPONENT (height: 64px, bg: #FFFFFF, border-bottom: 1px solid #E2E8F0, padding: 0 24px):

Trái:
  - Breadcrumb: text "Admin" (muted) > "Tên trang hiện tại" (primary, bold)
  - Mỗi cấp cách nhau icon ChevronRight 14px màu #9CA3AF

Phải (gap: 12px, align: center):
  - Icon button Search (20px, #6B7280, hover bg #F3F4F6, border-radius 6px, 36px×36px)
  - Icon button Bell (20px, #6B7280) + badge đỏ số thông báo chưa đọc (top-right, 16px)
  - Avatar tròn 36px + tên admin + chevron-down → dropdown menu:
      "Thông tin tài khoản" | "Đổi mật khẩu" | divider | "Đăng xuất" (đỏ)
```

---

## PHẦN 4 — AUTHENTICATION FLOW

### MÀN HÌNH A1 — TRANG ĐĂNG NHẬP
*(Figma đã có — ghi chú để liên kết luồng)*
```
Màn hình đăng nhập đã có trong Figma. Sau khi đăng nhập thành công với tài khoản Admin,
hệ thống chuyển sang MÀN HÌNH A2 (OTP). Với tài khoản Thủ thư, chuyển thẳng vào Dashboard.

Luồng: [Đăng nhập] → nếu Admin → [OTP 2FA] → [Dashboard]
                   → nếu Thủ thư → [Dashboard]
```

### MÀN HÌNH A2 — XÁC THỰC OTP 2FA (Admin)
```
Màn hình: Xác thực 2 bước — Admin OTP

Layout: Fullscreen background #F8FAFC, centered card width 420px

Card (bg: #FFFFFF, border-radius: 12px, padding: 40px, shadow modal):

  TOP:
    - Icon shield-check (Lucide, 48px, màu #1A56DB, centered, margin-bottom 16px)
    - Tiêu đề "Xác thực 2 bước" (24px, weight 700, centered)
    - Sub "Nhập mã 6 số từ ứng dụng Google Authenticator" (14px, #6B7280, centered, margin-bottom 32px)

  OTP INPUT GROUP (centered, gap: 8px, margin-bottom: 24px):
    - 6 ô input tách biệt, mỗi ô: 48px × 56px, border-radius 8px
    - Border mặc định: 1px solid #E2E8F0
    - Border focused: 2px solid #1A56DB, background #EFF6FF
    - Border filled: 1px solid #D1D5DB
    - Border error: 2px solid #EF4444, background #FEF2F2
    - Text: 24px, weight 700, center, màu #111827
    - Focus tự động nhảy sang ô tiếp khi nhập xong

  COUNTDOWN TIMER:
    - Text: "Mã hết hạn sau " + số đếm ngược "0:28" (14px, #6B7280, centered)
    - Khi còn < 10 giây: số đổi màu #EF4444

  BUTTON "Xác nhận" (full-width, height 44px, primary, disabled khi < 6 số):
    - Disabled state: bg #9CA3AF, cursor not-allowed

  ERROR STATE (hiện dưới input group khi sai mã):
    - Banner nhỏ: bg #FEF2F2, border #FCA5A5, icon AlertCircle đỏ
    - Text: "Mã không chính xác. Còn 2 lần thử trước khi khóa tài khoản." (13px, đỏ)
    - Shake animation trên 6 ô input

  LOCKED STATE (sau 3 lần sai):
    - Thay toàn bộ form bằng: icon Lock đỏ + "Tài khoản bị tạm khóa 15 phút"

  FOOTER:
    - Link "Gặp sự cố? Liên hệ quản trị viên hệ thống" (13px, #6B7280, underline hover)
    - Note nhỏ: "Xác thực 2 bước bắt buộc và không thể tắt cho tài khoản Admin" (12px, #9CA3AF)
```

---

## PHẦN 5 — TAB 1: DASHBOARD TỔNG QUAN

### MÀN HÌNH 1 — DASHBOARD
```
Màn hình: Dashboard tổng quan

PAGE HEADER (margin-bottom: 24px):
  - "Xin chào, Admin Nguyễn 👋" (24px, weight 700)
  - Sub: "Thứ Tư, 04/06/2025 — Hôm nay có 3 sách quá hạn cần xử lý" (14px, #6B7280)
  - Button phải: "Tạo báo cáo hôm nay" (primary, icon FileText)

ROW 1 — METRIC CARDS (grid 4 cột, gap: 16px, margin-bottom: 24px):

  Card 1 — Tổng đầu sách:
    bg: #FFFFFF, border-left: 4px solid #1A56DB (không bo góc trái)
    - Icon BookOpen 24px (#1A56DB) + label "Tổng đầu sách" (12px, uppercase, #6B7280)
    - Số "1,247" (32px, weight 700, #111827)
    - Sub "+12 đầu sách tuần này" (12px, #10B981, icon TrendingUp 12px)

  Card 2 — Độc giả đang mượn:
    border-left: 4px solid #10B981
    - Icon Users 24px (#10B981)
    - Số "389"
    - Sub "32 sắp đến hạn trả" (12px, #F59E0B, icon Clock 12px)

  Card 3 — Sách quá hạn:
    border-left: 4px solid #EF4444
    - Icon AlertCircle 24px (#EF4444)
    - Số "47" (màu #EF4444)
    - Sub "Phí tích lũy: 2,350,000đ" (12px, #EF4444)
    - Pulse animation nhẹ trên viền đỏ

  Card 4 — Lượt mượn tháng:
    border-left: 4px solid #8B5CF6
    - Icon TrendingUp 24px (#8B5CF6)
    - Số "623"
    - Sub "+8% so tháng trước" (12px, #10B981)

ROW 2 — CHARTS (grid 8+4, gap: 16px, margin-bottom: 24px):

  Chart trái (span 8) — "Lượt mượn & trả 30 ngày qua":
    Card padding 20px
    - Header: tên + filter dropdown "30 ngày / 3 tháng / 12 tháng" (phải)
    - Line chart, height 240px:
        Đường xanh #1A56DB (mượn) + Đường xanh lá #10B981 (trả)
        Trục X: ngày (mỗi 5 ngày) | Trục Y: số lượt
        Grid lines ngang mờ | Tooltip khi hover (bg trắng, shadow, 2 giá trị)
        Legend dưới: ● Lượt mượn ● Lượt trả
    - Area fill nhạt dưới mỗi đường (opacity 10%)

  Chart phải (span 4) — "Trạng thái kho bản sao":
    Card padding 20px
    - Header: "Trạng thái kho"
    - Donut chart, height 180px, hole ratio 60%
        5 phần: Có sẵn #10B981 | Đang mượn #1A56DB | Đặt trước #F59E0B | Bảo trì #F97316 | Mất/Hỏng #EF4444
    - Legend dọc dưới chart: mỗi dòng = màu dot + tên + số + %
    - Tổng số bản sao ở giữa donut (20px, weight 700)

ROW 3 — TABLES (grid 6+6, gap: 16px):

  Table trái — "Top sách được mượn tuần này":
    Card padding 20px, header "Top 5 sách" + link "Xem tất cả →"
    Columns: # | Ảnh bìa (32×44px) | Tên sách + tác giả (2 dòng) | Lượt | Badge
    5 dòng, border-bottom 1px #F3F4F6
    Badge lượt: pill xanh lá nhạt

  Table phải — "Giao dịch quá hạn cần xử lý":
    Card padding 20px, header đỏ "⚠ Quá hạn" + link "Xem tất cả →"
    Background card: #FFFBEB (vàng rất nhạt) với border top 3px solid #F59E0B
    Columns: Độc giả (avatar+tên) | Sách | Ngày hạn | Trễ (ngày đỏ) | Nút "Nhắc"
    5 dòng, dòng trễ > 14 ngày highlight nền đỏ rất nhạt #FEF2F2
```

---

## PHẦN 6 — TAB 2: QUẢN LÝ SÁCH

### MÀN HÌNH 2.1 — DANH SÁCH SÁCH
```
Màn hình: Danh sách Danh mục Sách

PAGE HEADER:
  Trái: "Quản lý Danh mục Sách" (h1) + "1,247 đầu sách" (badge xám)
  Phải: Button "Thêm qua ISBN" (primary, icon Scan) + "Thêm thủ công" (outline, icon Plus) + "Import Excel" (outline, icon Upload)

FILTER BAR (bg: #FFFFFF, padding: 16px, border-radius: 8px, margin-bottom: 16px, shadow card):
  Hàng 1: Search input (flex 1, icon Search, placeholder "Tìm tên sách, ISBN, tác giả...") + Button "Bộ lọc" (icon Filter, outline)
  Hàng 2 (khi mở bộ lọc): Dropdown "Thể loại" + Dropdown "Tác giả" + Dropdown "Năm XB" + Dropdown "Trạng thái" + Button "Xóa bộ lọc" (link style, đỏ)

BULK ACTION BAR (chỉ hiện khi có checkbox được chọn, animation slide-down):
  bg: #EFF6FF, padding: 12px 16px, border-radius 8px, border: 1px solid #BFDBFE
  "Đã chọn 5 sách" + Button "Đánh dấu nổi bật" + Button "Xóa đã chọn" (đỏ)

TABLE (bg: #FFFFFF, shadow card, border-radius: 8px):
  Header row: bg #F9FAFB, height 44px, text 12px uppercase weight 600 #6B7280
  Columns:
    □ Checkbox | Ảnh bìa 40×56px (border-radius 4px) | Tên sách (bold, link xanh, click → Chi tiết sách) + ISBN (muted 12px) | Tác giả | Thể loại (badge outline) | Số bản sao (badge xanh pill) | Năm | Trạng thái | Actions

  Badge Trạng thái: "Có bản sao" (xanh lá) / "Hết bản sao" (đỏ) / "Nổi bật" (vàng + icon Star)
  
  Dòng data: height 68px, hover bg #F9FAFB
  Actions mỗi dòng (icon buttons, 32×32px, border-radius 6px):
    - icon Eye (#6B7280, hover bg #F3F4F6) — xem chi tiết
    - icon Edit2 (#6B7280, hover bg #EFF6FF) — chỉnh sửa
    - icon Trash2 (#9CA3AF nếu còn bản sao, #EF4444 nếu có thể xóa) — hover tooltip nếu disabled

PAGINATION (margin-top: 16px, căn phải):
  "Hiển thị 1-20 trong 1,247 kết quả" + [< 1 2 3 ... 63 >] + Dropdown "20/trang"

EMPTY STATE (khi search không ra):
  Icon SearchX 48px mờ + "Không tìm thấy sách nào" + Sub "Thử điều chỉnh từ khóa tìm kiếm" + Button "Xóa bộ lọc"
```

### MÀN HÌNH 2.2 — THÊM/CHỈNH SỬA SÁCH
```
Màn hình: Thêm sách mới / Chỉnh sửa sách (cùng layout)

PAGE HEADER:
  Breadcrumb: Danh sách sách > "Thêm sách mới" (hoặc "Chỉnh sửa: [Tên sách]")
  Phải (chỉ khi edit): "Xem trang công khai" (outline, icon ExternalLink) + "Xóa sách" (đỏ outline, icon Trash2)

SUB-TAB (chỉ khi thêm mới, 2 tab nằm trên form):
  [Nhập qua ISBN] [Nhập thủ công]  ← tab pills, bên trái form

LAYOUT 2 CỘT (gap: 24px):

CỘT TRÁI (span 8):

  === KHI CHỌN TAB "NHẬP QUA ISBN" ===
  Section "Tra cứu ISBN" (card padding 20px, margin-bottom 20px):
    - Label "Mã ISBN" + Input lớn (height 44px, font 16px) + Button "Tra cứu Google Books" (primary, icon Scan)
    - Hoặc: icon Scan QR nhỏ bên cạnh input → open camera
    - LOADING STATE: skeleton loaders ở các field bên dưới + spinner + text "Đang tìm kiếm..."
    - SUCCESS BANNER: bg #ECFDF5, icon CheckCircle xanh, "Đã tìm thấy dữ liệu từ Google Books — vui lòng kiểm tra và chỉnh sửa trước khi lưu"
    - NOT FOUND BANNER: bg #FFFBEB, icon AlertTriangle vàng, "Không tìm thấy ISBN này. Vui lòng nhập thủ công."
    - Các field tự động fill sẽ có highlight nền vàng nhạt #FFFBEB để phân biệt

  === FORM THÔNG TIN SÁCH (dùng cho cả 2 tab) ===
  Card padding 20px:

  Tên sách* (full-width, height 44px)
  
  Grid 2 cột:
    Tác giả* (multi-tag input: nhập tên tác giả + Enter để thêm tag, có autocomplete từ DB)
    Thể loại* (multi-select dropdown, có thể chọn nhiều, có search)
  
  Grid 3 cột:
    NXB (input) | Năm xuất bản (input type number, 4 ký tự) | Số trang (input number)
  
  ISBN (input, monospace font, helper text "10 hoặc 13 ký tự")
  
  Mô tả sách (textarea, 5 rows, có character counter "/1000")
  
  Section "Cài đặt hiển thị" (border-top padding-top):
    Divider + label "Hiển thị trang chủ"
    Toggle "Đánh dấu là sách nổi bật" (on/off)
    [Khi bật toggle] Dropdown "Hiển thị ở mục:" (Sách mới / Sách nổi bật / Đề xuất của thủ thư)

  Section "Lịch sử chỉnh sửa" (chỉ hiện khi edit, card nhạt):
    Timeline nhỏ 3 dòng gần nhất: icon Clock + "Nguyễn Văn A sửa [Tên trường]: [cũ] → [mới] — DD/MM/YYYY HH:mm"
    Link "Xem toàn bộ lịch sử →"

CỘT PHẢI (span 4):

  Card "Ảnh bìa sách":
    - Vùng drag-drop (dashed border 2px #E2E8F0, border-radius 8px, height 240px):
        bg #F9FAFB, icon ImagePlus 32px mờ
        "Kéo thả ảnh vào đây" (14px, #6B7280)
        "hoặc" (12px mờ)
        Button "Chọn từ máy tính" (outline nhỏ)
    - Sau upload: preview ảnh fill vùng đó (object-fit cover) + overlay hover:
        Button "Đổi ảnh" + Button "Xóa" (2 nút nổi trên ảnh)
    - Note: "Tối đa 5MB. JPG, PNG. Tỉ lệ 2:3 (W:H). Sẽ tự cắt về đúng tỉ lệ."

  Card "Thông tin lưu" (margin-top 16px):
    - Người tạo: [Avatar nhỏ + Tên] (chỉ khi edit)
    - Ngày tạo: DD/MM/YYYY (chỉ khi edit)
    - Trạng thái: Dropdown "Đang hoạt động / Ẩn"

FOOTER FORM (sticky bottom, bg #FFFFFF, padding 16px 24px, border-top, shadow up):
  Trái: Button "Hủy" (ghost)
  Phải: Button "Lưu" (outline) + Button "Lưu & Thêm bản sao ngay" (primary, icon ArrowRight)
  
  Khi đang save: loading spinner trong button + text "Đang lưu..."
  
SUCCESS TOAST (top-right, 3 giây):
  bg #ECFDF5, icon CheckCircle, "Đã lưu sách thành công!" + nút X
```

### MÀN HÌNH 2.3 — CHI TIẾT SÁCH
```
Màn hình: Chi tiết sách (Book Detail Page)

Breadcrumb: Quản lý Sách > Danh sách > [Tên sách]

LAYOUT 2 CỘT (gap: 24px):

CỘT TRÁI (span 4):
  Card padding 20px:
    - Ảnh bìa lớn (width 100%, max 280px, border-radius 8px, shadow nhẹ)
    - Badge trạng thái (centered, margin-top 12px): "Có sẵn" / "Hết bản sao"
    - Badge nổi bật nếu có (icon Star + "Sách nổi bật")
    - Divider
    - Nút "Chỉnh sửa thông tin" (primary, full-width, icon Edit2)
    - Nút "Thêm bản sao" (outline, full-width, icon Plus, margin-top 8px)
    - Nút "Xem trang công khai" (ghost, full-width, icon ExternalLink, margin-top 8px)

CỘT PHẢI (span 8):
  - Tên sách (28px, weight 700, margin-bottom 4px)
  - Tác giả (16px, xanh link, margin-bottom 12px)
  - Tags: [Thể loại badge] [Thể loại badge] — margin-bottom 16px
  - Grid 2 cột thông tin: NXB | Năm | Số trang | ISBN (label mờ + value)
  - Mô tả: text 14px, expandable (show 3 dòng + "Xem thêm" link)

  TABS (margin-top 24px):
    Pills: [Bản sao (12)] [Lịch sử chỉnh sửa] [Thống kê]

    === TAB "BẢN SAO" ===
    Action bar: "12 bản sao" (badge) + Button "Thêm bản sao" (primary nhỏ) + Button "In QR hàng loạt" (outline nhỏ)
    Mini table:
      Columns: Mã barcode (monospace) | Tình trạng (badge) | Trạng thái (badge màu) | Vị trí kệ | Ngày nhập | Actions (Print | Edit)
      Dòng "Đang mượn": sub-text nhỏ "Bởi: Nguyễn Văn A — Hạn trả: 15/06/2025"
      Dòng "Đã thanh lý": text mờ + strikethrough nhẹ

    === TAB "LỊCH SỬ CHỈNH SỬA" ===
    Timeline dọc (border-left 2px #E2E8F0):
      Mỗi entry: dot tròn + [Avatar nhỏ + Tên admin] + "đã sửa [Tên trường]" + timestamp
      Expand: box diff nhỏ — Cũ: "[text cũ]" → Mới: "[text mới]" (font mono, bg #F9FAFB)

    === TAB "THỐNG KÊ" ===
    Grid 3 stat cards nhỏ: Tổng lượt mượn | Lượt mượn năm nay | Đang được mượn bởi
    Mini bar chart "Lượt mượn theo tháng (12 tháng gần nhất)"
    Table "Độc giả gần nhất": Tên | Ngày mượn | Ngày trả | Tình trạng trả
```

### MÀN HÌNH 2.4 — QUẢN LÝ TÁC GIẢ & THỂ LOẠI
```
Màn hình: Quản lý Tác giả & Thể loại — 2 tabs

PAGE HEADER: "Quản lý Tác giả & Thể loại"
TABS: [Tác giả (87)] [Thể loại (24)]

=== TAB TÁC GIẢ ===
Action bar: Search input + Button "+ Thêm tác giả" (primary, phải)

Grid 4 cột (gap: 16px):
  Author Card (bg: #FFFFFF, border-radius: 8px, padding: 16px, shadow card):
    - Avatar tròn 48px (bg gradient từ tên, initials 2 chữ cái trắng)
    - Tên tác giả (15px, weight 600)
    - Quốc tịch (13px, #6B7280)
    - "X đầu sách" (12px, badge xám)
    - Footer card: icon Edit2 + icon Trash2 (hover state)
    - Hover card: shadow đậm hơn, transform scale nhẹ 1.01

MODAL Thêm/Sửa Tác giả (width: 520px):
  Title "Thêm tác giả" / "Chỉnh sửa tác giả"
  Avatar upload (circle 80px, click để đổi)
  Fields: Tên tác giả* | Quốc tịch (select) | Năm sinh (input) | Tiểu sử (textarea 3 rows)
  Footer: Button Hủy + Button Lưu

=== TAB THỂ LOẠI ===
Action bar: Search input + Button "+ Thêm thể loại" (primary, phải)

Table:
  Columns: Tên thể loại | Mô tả ngắn | Số sách | Hiển thị (toggle) | Ngày tạo | Actions
  Toggle "Hiển thị": ON = xanh lá / OFF = xám
  Khi toggle OFF: tên thể loại chữ mờ + badge "Đã ẩn" (xám)
  Tooltip khi hover badge "Đã ẩn": "Thể loại bị ẩn sẽ không hiện trong tìm kiếm của độc giả, nhưng dữ liệu vẫn được giữ."
  Actions: icon Edit2 + icon Trash2 (disable khi còn sách)

MODAL Thêm/Sửa Thể loại (width: 480px):
  Tên thể loại* | Mô tả (textarea) | Toggle hiển thị
  Footer: Hủy + Lưu
```

### MÀN HÌNH 2.5 — QUẢN LÝ SÁCH NỔI BẬT
```
Màn hình: Quản lý Sách Nổi bật

PAGE HEADER: "Quản lý Sách Nổi bật"
Sub: "Chọn sách hiển thị trên trang chủ cho độc giả. Kéo thả để thay đổi thứ tự."

3 SECTION dọc (gap: 24px), mỗi section là 1 card:

SECTION "Sách Mới" (badge "3/5 sách"):
  Card header (padding 16px 20px, border-bottom):
    - Icon Sparkles vàng + "Sách Mới" (16px weight 600)
    - Badge "3/5" (xanh nếu còn slot, xám nếu đầy)
    - Button "+ Thêm sách" (primary nhỏ, phải, disabled nếu đầy)
  
  Card body (padding 12px):
    Drag list: mỗi item (height 64px, padding 8px 12px, border-radius 6px, hover bg #F9FAFB):
      - Handle ⠿ (icon GripVertical, 16px mờ, cursor grab)
      - Thumbnail ảnh bìa 40×56px
      - Tên sách (14px bold) + Tác giả (12px mờ)
      - Badge thứ tự "#1" (pill xanh nhạt)
      - Button X (icon X, 24×24, đỏ hover, phải) — xóa khỏi danh sách

  Empty item slots (nếu < 5): dashed border, mờ, text "+ Slot trống"

SECTION "Sách Nổi bật" (badge "5/5 sách") — tương tự, icon Flame đỏ cam
SECTION "Đề xuất của Thủ thư" (badge "2/5 sách") — tương tự, icon Lightbulb tím

MODAL "Thêm sách vào danh sách" (width: 560px, khi click "+ Thêm sách"):
  Search input "Tìm kiếm sách..." (autofocus)
  List kết quả (scroll max 320px):
    Mỗi dòng: thumbnail + tên sách + tác giả + badge thể loại + Checkbox phải
    Sách đã có trong 1 mục: checkbox disabled + tooltip "Đã có trong [Sách Mới]"
  Footer: "Đã chọn 2 sách" + Button Hủy + Button "Thêm vào danh sách"
```

---

## PHẦN 7 — TAB 3: QUẢN LÝ KHO

### MÀN HÌNH 3.1 — DANH SÁCH BẢN SAO
```
Màn hình: Quản lý Bản sao

PAGE HEADER: "Quản lý Bản sao"

STAT PILLS ROW (margin-bottom 16px):
  5 pills ngang: "Có sẵn: 1,842" (xanh lá) | "Đang mượn: 389" (xanh) | "Đặt trước: 23" (vàng) | "Bảo trì: 12" (cam) | "Mất/Hỏng: 8" (đỏ)
  Mỗi pill: badge màu nền nhạt, text đậm, click để filter

FILTER BAR (card padding 16px, margin-bottom 16px):
  Hàng 1: Search "Mã barcode hoặc tên sách..." + Button "Bộ lọc +"
  Hàng 2 (khi mở): Select "Lọc theo sách" (searchable) + Select "Trạng thái" + Select "Tình trạng VL" + Select "Vị trí kệ" + Button "Đặt lại"
  Phải hàng 1: Button "Thêm bản sao" (primary, icon Plus) + "Import Excel" (outline) + "In QR hàng loạt" (outline)

TABLE (bg: #FFFFFF, shadow, border-radius 8px):
  Columns: □ | Mã barcode (monospace, 13px) | Tên sách (link, 2 dòng khi cần) | Tình trạng VL (badge) | Vị trí kệ (code font) | Trạng thái (badge màu lớn) | Ngày nhập | Actions

  BADGE TÌNH TRẠNG VL (outline style):
    Mới: #10B981 | Tốt: #3B82F6 | Cũ: #F59E0B | Hỏng nhẹ: #F97316 | Hỏng nặng: #EF4444

  BADGE TRẠNG THÁI (filled):
    Có sẵn: bg #ECFDF5 text #065F46
    Đang mượn: bg #EFF6FF text #1E40AF + sub "Hạn: 15/06" (10px)
    Đặt trước: bg #FFFBEB text #92400E
    Bảo trì: bg #FFF7ED text #C2410C
    Mất/Hỏng: bg #FEF2F2 text #991B1B
    Đã thanh lý: bg #F9FAFB text #9CA3AF (italic, mờ)

  Actions: icon Printer (in QR) | icon Edit2 | icon Trash2 | icon MoreHorizontal → dropdown
```

### MÀN HÌNH 3.2 — THÊM BẢN SAO & IN QR
```
Màn hình: Thêm bản sao & In nhãn QR/Barcode — 2 Tabs

TABS: [Thêm bản sao] [In nhãn QR/Barcode]

=== TAB "THÊM BẢN SAO" ===

BƯỚC 1 — CHỌN ĐẦU SÁCH (card padding 20px, margin-bottom 16px):
  Label "Chọn đầu sách *" + Searchable select dropdown (height 44px)
  Sau khi chọn — Book preview card (flex, gap 16px):
    Ảnh bìa 60×84px + [Tên sách (bold) + Tác giả + ISBN + "Hiện có: X bản sao" (badge)]
    Button "Đổi sách" (link style, xanh)

BƯỚC 2 — THÔNG TIN BẢN SAO (card padding 20px):

  BARCODE ROW (flex, gap 8px):
    Input "Mã barcode *" (flex 1, monospace font, placeholder "Nhập hoặc tự sinh mã")
    Button "Tự sinh mã" (outline, icon Zap) → fill mã ngẫu nhiên dạng "LIB-2025-XXXXX"
    Button icon Scan (scan từ máy quét vật lý)
    Helper text: "Mã phải là duy nhất trong hệ thống"

  TÌNH TRẠNG VẬT LÝ * (radio button có mô tả):
    ○ Mới (book vừa mua, chưa dùng)
    ○ Tốt (đã dùng, không hư hại)
    ○ Cũ (dùng nhiều, còn đọc được)
    ○ Hỏng nhẹ (rách bìa, ố vàng nhẹ)
    ○ Hỏng nặng (nội dung bị ảnh hưởng)

  Grid 2 cột:
    Vị trí kệ * (input, placeholder "VD: A1-01, B2-05", pattern validate)
    Ngày nhập (date picker, default hôm nay)
  
  Ghi chú (textarea 3 rows, optional)

  BULK ADD SECTION (collapsible, border-top margin-top 16px):
    Toggle "Thêm nhiều bản sao cùng lúc"
    Khi mở: "Số lượng bổ sung" (number input, min 1, max 50) + Preview "Sẽ tạo mã: LIB-2025-001, LIB-2025-002, ..."
    Note: "Các bản sao được tạo hàng loạt sẽ có cùng tình trạng và vị trí kệ."

FOOTER: Button Hủy + Button "Lưu" (outline) + Button "Lưu & In nhãn" (primary, icon Printer)

=== TAB "IN NHÃN QR/BARCODE" ===

LAYOUT 2 CỘT (gap: 24px):

CỘT TRÁI (span 5) — TÙY CHỌN IN:
  Card padding 20px:
    "Chọn bản sao cần in" + Searchable multi-select (nhập barcode hoặc tên sách, có thể chọn nhiều)
    Hoặc: "Chọn theo đầu sách" → chọn tất cả bản sao của 1 sách

    OPTIONS:
    Khổ giấy: Radio [A4] [A5]
    Layout: Select "3 cột × 8 hàng (24 nhãn/trang)" / "4 cột × 6 hàng (24 nhãn/trang)" / "2 cột × 4 hàng (8 nhãn/trang lớn)"
    Nội dung nhãn:
      ☑ QR Code  ☑ Barcode  ☑ Tên sách  ☑ Mã số  ☑ Vị trí kệ  ☐ Tên thư viện
    
    Button "Xuất PDF để in" (primary full-width, icon Download)

CỘT PHẢI (span 7) — PREVIEW:
  Card padding 12px, bg #F9FAFB, border-radius 8px:
    Label "Preview trang in" (12px uppercase mờ)
    A4 frame (scaled down, shadow, bg trắng):
      Grid nhãn — mỗi nhãn (border dashed 1px #E2E8F0):
        QR code (fake, 40×40px gray square) + Barcode (fake lines) + Tên sách (9px, truncate) + Mã (8px mono) + Vị trí (8px)
    Note: "Preview chỉ mang tính minh họa"
```

### MÀN HÌNH 3.3 — IMPORT EXCEL & THANH LÝ
```
Màn hình: Import & Thanh lý — 2 Tabs

TABS: [Import Excel hàng loạt] [Thanh lý bản sao]

=== TAB "IMPORT EXCEL" ===

STEP INDICATOR (3 bước dạng pills kết nối):
  [1 Tải template] → [2 Upload file] → [3 Xem kết quả]
  Bước hiện tại: filled primary. Đã xong: filled xanh lá + icon Check. Chưa tới: outline xám.

BƯỚC 1 — TẢI TEMPLATE (card, hiện khi ở step 1):
  Icon FileSpreadsheet 48px (#10B981) + "Tải file mẫu Excel"
  Mô tả: "File mẫu chứa các cột: [Tên sách], [ISBN], [Tác giả], [NXB], [Năm], [Thể loại], [Số bản sao], [Tình trạng VL], [Vị trí kệ]"
  Button "Tải file mẫu .xlsx" (primary, icon Download)
  Note: "Không xóa dòng header. Không thêm/xóa cột. Xem tab 'Hướng dẫn' trong file."

BƯỚC 2 — UPLOAD FILE (card):
  Drag-drop zone (height 160px, dashed border 2px, border-radius 8px, bg #F9FAFB):
    Icon Upload 32px mờ + "Kéo thả file .xlsx vào đây" + "hoặc" + Button "Chọn file"
    Hover: border solid xanh, bg #EFF6FF
    File đã chọn: icon File + tên file + dung lượng + icon X để xóa
  Note: "Chỉ chấp nhận .xlsx, .xls. Tối đa 10MB. Tối đa 5,000 dòng mỗi lần import."

BƯỚC 3 — KẾT QUẢ (card, sau khi upload):
  SUMMARY BAR (grid 3 pill stats):
    Tổng: X dòng | Hợp lệ: Y dòng (xanh lá) | Lỗi: Z dòng (đỏ)
  
  PROGRESS (khi đang validate): Progress bar xanh + "Đang kiểm tra dòng 234/1,000..."

  TABLE PREVIEW (max-height 400px, scroll):
    Badge cột STT: dòng lỗi = đỏ số, dòng ok = xanh số
    Dòng lỗi: nền #FEF2F2, icon AlertCircle đỏ ở cột đầu
    Hover dòng lỗi: tooltip "Cột [ISBN]: Định dạng không hợp lệ" hoặc "Cột [Thể loại]: Không tồn tại trong hệ thống"
  
  ACTION ROW:
    Button "Tải file lỗi .xlsx" (outline đỏ, icon Download) — chứa chỉ các dòng lỗi + ghi chú lỗi
    Button "Nhập X dòng hợp lệ" (primary) — disabled nếu Y = 0
  
  KHI ĐANG NHẬP: Progress bar + "Đang nhập dòng 45/312..." + Button "Hủy" (outline đỏ)
  
  KHI NHẬP XONG: Success banner "Đã nhập thành công 312 bản sao / 156 đầu sách mới" + Button "Về danh sách bản sao"

=== TAB "THANH LÝ BẢN SAO" ===
Card padding 20px, max-width 640px:

  TÌMKIẾM BẢN SAO:
    Input lớn "Quét hoặc nhập mã barcode" (height 52px, icon Scan trái, autofocus)
    Button "Tìm kiếm" (primary)
    Hoặc: Search theo tên sách (link "Tìm theo tên sách →")

  KẾT QUẢ TÌM THẤY (card kết quả, sau khi quét):
    flex gap 16px: Ảnh bìa nhỏ 60×84px + thông tin:
      Tên sách (bold) | Tác giả
      "Mã: LIB-2025-0123" (monospace) | Badge tình trạng | Badge trạng thái
      Vị trí kệ | Ngày nhập
    
    WARNING nếu bản sao đang mượn: banner đỏ "Bản sao này đang được mượn bởi [Tên độc giả] — không thể thanh lý cho đến khi trả sách"
    → Khi đang mượn: disable form thanh lý

  FORM THANH LÝ (chỉ hiện khi bản sao không đang mượn):
    Lý do thanh lý * (Select): Hỏng nặng không sửa được / Mất không tìm thấy / Hết niên hạn sử dụng / Chuyển kho / Khác
    [Khi chọn "Khác"]: Textarea "Mô tả lý do"
    Ngày thanh lý * (date picker, default hôm nay)
    Ghi chú (textarea optional)

    WARNING BOX (vàng, icon AlertTriangle):
      "Bản sao sẽ chuyển sang trạng thái 'Đã thanh lý'. Thao tác này không thể hoàn tác và bản sao sẽ không thể dùng để cho mượn nữa. Dữ liệu lịch sử vẫn được giữ lại."

    Footer: Button Hủy + Button "Xác nhận thanh lý" (đỏ, icon CheckCircle)
    
    Confirm modal (double-confirm):
      "Xác nhận thanh lý bản sao [Mã]?"
      "Tên sách: [...]" + "Lý do: [...]"
      Button "Hủy" + Button "Xác nhận" (đỏ)
```

### MÀN HÌNH 3.4 — BÁO CÁO KHO
```
Màn hình: Báo cáo Kho sách

PAGE HEADER: "Báo cáo Kho sách"
  Phải: Dropdown "Lọc thể loại: Tất cả ▾" + Button "Xuất Excel" (outline) + Button "Xuất PDF" (outline)

ROW 1 — STAT CARDS (grid 5 cột, gap 12px):
  Tổng đầu sách: 1,247 | Tổng bản sao: 2,274 | Đang có sẵn: 1,842 (xanh lá) | Đang mượn: 389 (xanh) | Mất/Hỏng: 8 (đỏ)
  (card nhỏ hơn, padding 16px)

ROW 2 — CHARTS (grid 7+5, gap 16px, margin 16px 0):
  
  Chart trái (span 7) — "Phân bố bản sao theo thể loại":
    Horizontal bar chart, height 280px
    Mỗi bar: tên thể loại (trái) + bar (xanh gradient nhạt→đậm theo tổng số) + số (cuối bar)
    Click bar: filter table bên dưới
  
  Chart phải (span 5) — "Tình trạng vật lý bản sao":
    Donut chart, 5 phần màu + legend chi tiết
    Center: "Tổng: 2,274 bản sao"

ROW 3 — DETAILED TABLE (card full-width):
  Header: "Chi tiết theo đầu sách" + search input
  Columns: Tên sách | Thể loại | Tổng BC | Có sẵn | Đang mượn | Bảo trì | Mất/Hỏng
  Mỗi ô số có mini progress bar nhỏ bên dưới (tỉ lệ so với Tổng BC)
  Dòng có Mất/Hỏng > 0: highlight vàng nhạt
  Pagination dưới
```

---

## PHẦN 8 — TAB 4: GIAO DỊCH

### MÀN HÌNH 4.1 — MƯỢN / TRẢ SÁCH
```
Màn hình: Quầy Mượn / Trả sách (Check-out & Check-in)

PAGE HEADER: "Quầy Mượn Trả" + Clock live "15:42:07"
MAIN TABS (lớn, height 48px): [MƯỢN SÁCH] [TRẢ SÁCH]
(Tab active: full-width bottom border 3px primary, text đậm)

============================
=== TAB MượnSÁCH ===
============================

LAYOUT 2 CỘT (gap: 20px, min-height: 600px):

CỘT TRÁI (span 5) — "1. Chọn độc giả":
  Card padding 20px:
    Label "Tìm độc giả" + Input lớn (height 48px, icon Search, placeholder "Nhập tên, số thẻ, email..." autofocus)
    Dropdown autocomplete (khi nhập ≥ 2 ký tự):
      Mỗi gợi ý: Avatar tròn 28px + Tên + Số thẻ + Badge loại thẻ
    
    CARD THÔNG TIN ĐỘC GIẢ (sau khi chọn, animation fade-in):
      Header flex: Avatar 48px + [Tên (16px bold) + Số thẻ (13px mono) + Badge loại thẻ]
      Button "Đổi độc giả" (link, icon X, phải)
      Divider
      Grid 2 cột (gap 12px):
        "Hạn thẻ" / "31/12/2025" (đỏ nếu < 30 ngày)
        "Đang mượn" / Progress "3/5 cuốn" (progress bar màu theo tỉ lệ)
        "Còn lại" / "2 cuốn"
        "Nợ phí" / "0đ" (đỏ bold nếu > 0, icon Warning)
      
      ALERT BOXES (hiện khi có vấn đề):
        Đỏ: "Đã vượt hạn mức mượn (5/5 cuốn) — Không thể mượn thêm"
        Đỏ: "Còn nợ phí 150,000đ — Cần nộp phí trước khi mượn (theo cấu hình)"
        Vàng: "Thẻ sắp hết hạn: còn 15 ngày"
        Vàng: "Có 1 sách đặt trước đang chờ lấy"

CỘT PHẢI (span 7) — "2. Quét sách":
  Card padding 20px:
    Label "Quét mã bản sao" + Input lớn (height 48px, icon Scan, màu viền primary, autofocus sau khi chọn độc giả)
    Helper: "Quét barcode/QR hoặc nhập mã thủ công, nhấn Enter"
    
    LIST SÁCH ĐÃ THÊM (khi có ≥ 1 sách):
      Table: icon BookOpen | Tên sách (bold) + Mã bản sao (13px mono mờ) | Hạn trả: DD/MM/YYYY | icon Trash2 (xóa)
      Mỗi sách thêm vào: animation slide-in từ trên
      Dòng cảnh báo (nền vàng nhạt): "Độc giả này đã đặt trước sách này"
      Dòng lỗi (nền đỏ nhạt): icon AlertCircle + "Bản sao này đang bị mượn / bảo trì / mất"
    
    EMPTY STATE: Dashed box, icon BookOpen mờ, "Chưa có sách nào — quét để thêm vào"
    
    SUMMARY FOOTER (bottom card, border-top):
      "Tổng: X cuốn" (left) + "Hạn trả: DD/MM/YYYY" (center, tính từ loại thẻ) + Số phiếu mượn (right)
      Row buttons: Button "Xác nhận mượn & In phiếu" (primary lớn, icon Printer) | Button "Xác nhận (không in)" (outline)

SUCCESS STATE (sau xác nhận, overlay card):
  icon CheckCircle 48px xanh lá + "Mượn thành công!"
  "X cuốn sách — Hạn trả: DD/MM/YYYY"
  Preview mini phiếu mượn + Button "Tải phiếu PDF" + Button "Mượn tiếp cho độc giả khác"

============================
=== TAB TRẢ SÁCH ===
============================
Single column max-width 680px:

  Input lớn (height 52px, icon Scan, focus ring primary, autofocus):
    placeholder "Quét mã bản sao để trả sách..."
  
  KẾT QUẢ SAU KHI QUÉT (card kết quả, animation fade-in):
    
    THÔNG TIN GIAO DỊCH (flex 2 phần):
      Trái: Ảnh bìa 60×84px
      Phải:
        Tên sách (16px bold)
        "Mã bản sao: LIB-2025-0042" (13px mono)
        Độc giả: [Avatar 24px + Tên] (link → chi tiết độc giả)
        Ngày mượn: DD/MM/YYYY | Hạn trả: DD/MM/YYYY
        Ngày trả thực tế: [Hôm nay, highlight đỏ nếu trễ hạn]
    
    PHÍ TRỄ HẠN (card màu vàng nhạt, icon Clock, chỉ hiện khi trễ):
      "Trễ X ngày × Y,000đ/ngày = Z,000đ"
      (Note: "Đã loại trừ X ngày nghỉ lễ")
    
    TÌNH TRẠNG KHI TRẢ * (radio cards horizontal):
      [✓ Tốt] [Hỏng nhẹ] [Hỏng nặng] [Mất sách]
      Khi chọn Hỏng/Mất: input "Phí bồi thường" auto-fill (% × giá trị sách) + cho phép sửa
    
    TỔNG PHÍ (nếu > 0, card đỏ nhạt):
      "Tổng phí cần thu: X,XXX đ" (18px bold đỏ)
      Phương thức: [Tiền mặt] [Chuyển khoản] (radio pills)
      Input "Ghi chú" (optional)
    
    BUTTONS:
      Nếu có phí: Button "Xác nhận trả & Ghi nhận thu phí" (primary) | Button "Xác nhận trả (ghi nợ)" (outline)
      Nếu không phí: Button "Xác nhận trả sách" (primary lớn)
```

### MÀN HÌNH 4.2 — GIA HẠN & ĐẶT TRƯỚC
```
Màn hình: Gia hạn mượn & Xử lý đặt trước — 2 Tabs

TABS: [Gia hạn mượn] [Xử lý đặt trước (5)]

=== TAB GIA HẠN MƯỢN ===
Tìm độc giả: Search input (giống màn mượn sách)

Sau khi chọn — CARD ĐỘC GIẢ nhỏ + TABLE "Sách đang mượn":
  Columns: □ | Ảnh bìa nhỏ | Tên sách | Mã BC | Ngày mượn | Hạn trả | Còn gia hạn | Đặt trước?
  
  Badge "Còn gia hạn":
    "2 lần" (xanh lá) | "1 lần" (vàng) | "Hết lượt" (đỏ, disable checkbox)
  
  Column "Đặt trước?":
    Nếu có: icon AlertTriangle vàng + tooltip "Có X độc giả đặt trước sách này — không thể gia hạn"
    Dòng này: checkbox disabled + nền vàng rất nhạt
  
  SUMMARY dưới table:
    "Đã chọn X cuốn" + "Gia hạn thêm Y ngày" (tự động từ cấu hình) + "Hạn mới: DD/MM/YYYY"
  
  Button "Gia hạn X cuốn đã chọn" (primary, disabled khi chưa chọn)
  
  SUCCESS: Toast "Đã gia hạn thành công X cuốn — Hạn mới: DD/MM/YYYY"

=== TAB XỬ LÝ ĐẶT TRƯỚC ===
Filter bar: Search + Select "Trạng thái" (Đang chờ / Sách có sẵn / Đã hết hạn / Tất cả)

Table:
  Columns: Độc giả (avatar+tên) | Sách (ảnh bìa nhỏ+tên) | Ngày đặt | Trạng thái | Deadline lấy | Actions

  Badge TRẠNG THÁI:
    "Đang chờ sách" (xám, icon Clock)
    "Sách có sẵn" (xanh lá pulse) + countdown "Còn 2 ngày lấy" + icon Bell
    "Hết hạn" (đỏ) + "(Sách đã trả lại kho)"
    "Đã mượn" (xanh, done state)

  Actions:
    Khi "Sách có sẵn": Button "Xác nhận mượn" (primary nhỏ) + Button "Hủy đặt" (đỏ outline nhỏ)
    Khi "Đang chờ": Button "Hủy đặt" (đỏ outline nhỏ)
    Khi "Hết hạn": Button "Đặt lại" (outline nhỏ)
  
  Click "Xác nhận mượn": redirect sang màn Mượn sách với độc giả và sách đã được điền sẵn
```

### MÀN HÌNH 4.3 — LỊCH SỬ GIAO DỊCH
```
Màn hình: Lịch sử Giao dịch

PAGE HEADER: "Lịch sử Giao dịch"
  Phải: Button "Xuất Excel" (outline, icon Download)

FILTER BAR (card padding 16px):
  Date range picker (From — To) + Search "Tên sách hoặc độc giả" + Select "Loại GD" (Mượn/Trả/Gia hạn/Tất cả) + Select "Trạng thái" (Đang mượn/Đã trả/Quá hạn)
  
SUMMARY ROW (4 pills, margin 12px 0):
  Tổng: 1,247 GD | Đang mượn: 389 (xanh) | Đã trả đúng hạn: 831 (xanh lá) | Trễ hạn: 27 (đỏ)

TABLE (card):
  Columns: Mã GD (mono 11px) | Loại (badge) | Độc giả (avatar+tên) | Sách (tên, truncate) | Mã bản sao | Ngày GD | Hạn/Ngày trả | Phí | Thủ thư | Expand ›

  Badge LOẠI: "Mượn" (xanh nhạt) | "Trả" (xanh lá nhạt) | "Gia hạn" (tím nhạt)
  
  Dòng quá hạn: border-left 3px solid #EF4444, bg #FEF2F2 nhạt
  Dòng đang mượn: border-left 3px solid #3B82F6
  
  EXPANDED ROW (click icon › để expand, accordion animation):
    bg #F9FAFB, padding 16px 24px, hiện thêm:
    Grid 4 cột: Ghi chú | Tình trạng sách khi trả | Số lần gia hạn | IP thiết bị
    Timeline mini gia hạn (nếu có): [Mượn DD/MM] → [Gia hạn DD/MM, +7 ngày] → [Trả DD/MM]
  
  Pagination dưới
```

### MÀN HÌNH 4.4 — QUẢN LÝ ĐỘC GIẢ
```
Màn hình: Quản lý Độc giả

PAGE HEADER: "Quản lý Độc giả" + "X,XXX độc giả" (badge)
  Phải: Button "Xuất Excel" (outline)

FILTER BAR:
  Search + Select "Loại thẻ" + Select "Trạng thái" (Hoạt động/Bị khóa) + Select "Có nợ phí" (Tất cả/Có nợ/Không nợ)

TABLE:
  Columns: □ | Avatar+Tên (link → drawer) | Số thẻ (mono) | Loại thẻ (badge) | Email | SĐT | Đang mượn | Nợ phí | Trạng thái | Ngày ĐK | Actions

  Badge LOẠI THẺ: "Thẻ Thường" (xám) | "Thẻ Ưu tiên" (vàng) | "Thẻ VIP" (tím)
  Badge TRẠNG THÁI: "Hoạt động" (xanh lá) | "Bị khóa" (đỏ, icon Lock)
  Nợ phí: text đỏ bold nếu > 0, "0đ" xám nếu không

  Actions: icon Eye (xem drawer) | icon Lock/Unlock (khóa/mở) | icon KeyRound (reset mật khẩu) | icon MoreHorizontal

  KHÓA TÀI KHOẢN MODAL:
    Title "Khóa tài khoản [Tên]?"
    Select "Lý do khóa" (Quá hạn nhiều lần / Vi phạm quy định / Theo yêu cầu / Khác)
    Textarea "Ghi chú"
    Button Hủy + Button "Khóa tài khoản" (đỏ)

CHI TIẾT ĐỘC GIẢ — DRAWER (slide từ phải, width 480px, overlay backdrop):
  Header drawer: "Chi tiết độc giả" + icon X để đóng

  PROFILE SECTION (padding 20px, border-bottom):
    Avatar lớn 64px (circle) + Tên (18px bold) + Email + SĐT
    Grid 2 cột: Số thẻ | Loại thẻ | Hạn thẻ | Ngày đăng ký

  STATS ROW (padding 16px, bg #F9FAFB, border-bottom):
    3 stats: "Tổng đã mượn: 47" | "Đang mượn: 3/5" | "Lần trễ hạn: 2"

  TABS TRONG DRAWER: [Đang mượn] [Lịch sử] [Phí & nợ]

    Tab "Đang mượn": Mini table: Ảnh bìa nhỏ + Tên sách + Hạn trả + Badge (đúng/trễ)
    Tab "Lịch sử": Timeline giao dịch gần đây (scroll)
    Tab "Phí & nợ": Tổng nợ (nếu có) + Lịch sử thanh toán mini

  FOOTER DRAWER:
    Button "Khóa tài khoản" (đỏ outline) | Button "Reset mật khẩu" (outline)
```

---

## PHẦN 9 — TAB 5: TÀI CHÍNH

### MÀN HÌNH 5.1 — QUẢN LÝ PHÍ & THANH TOÁN
```
Màn hình: Quản lý Phí & Thanh toán

PAGE HEADER: "Quản lý Phí & Thanh toán"

SUMMARY ALERT (card đỏ nhạt nếu có nợ tồn đọng):
  icon AlertCircle đỏ + "Tổng nợ phí tất cả độc giả: XX,XXX,XXXđ" + "Số độc giả có nợ: X"

MAIN TABS: [Cần thu (47)] [Đã thanh toán]

=== TAB CẦN THU ===
Filter bar: Search độc giả + Date range "Phát sinh từ — đến" + Select "Loại phí" (Trễ hạn/Hỏng nhẹ/Hỏng nặng/Mất sách/Tất cả)

TABLE:
  Columns: Độc giả (avatar+tên) | Sách | Loại phí (badge) | Số tiền (đỏ bold) | Ngày phát sinh | Chi tiết (ngày trễ/lý do) | Actions

  Badge LOẠI PHÍ: "Trễ hạn" (cam) | "Hỏng nhẹ" (vàng) | "Hỏng nặng" (đỏ cam) | "Mất sách" (đỏ đậm)
  
  Actions: Button "Thu phí" (primary outline nhỏ, icon CreditCard)

MODAL "Thu phí" (width 480px):
  HEADER: Avatar độc giả + Tên + "Thu phí cho: [Tên sách]"
  
  INFO CARD (bg #FEF2F2):
    Loại phí: [badge] | Chi tiết: "X ngày trễ × Y,000đ/ngày"
    Số tiền phải nộp: XX,XXX đ (24px bold đỏ)
  
  FORM:
    Số tiền thực thu * (number input prefill = số phải nộp, cho phép sửa + note "Có thể thu một phần")
    Phương thức thanh toán * (radio cards: 💵 Tiền mặt | 🏦 Chuyển khoản)
    Ghi chú (input, optional)
    Biên lai: Toggle "In biên lai" (default on)
  
  Footer: Button Hủy + Button "Xác nhận thu phí" (primary)
  
  SUCCESS: "Thu phí thành công!" + "Số tiền: XX,XXX đ" + Button "In biên lai" + Button "Đóng"

=== TAB ĐÃ THANH TOÁN ===
Filter bar: Date range + Search

Table: Độc giả | Sách | Số tiền | Ngày thu | Phương thức (badge) | Người thu | icon Eye (xem chi tiết)
```

### MÀN HÌNH 5.2 — BÁO CÁO DOANH THU PHÍ
```
Màn hình: Báo cáo Doanh thu Phí

PAGE HEADER: "Báo cáo Doanh thu Phí"
  Phải: Month/Year picker + Button "Xuất Excel"

ROW 1 — STAT CARDS (grid 3):
  Tổng thu tháng này: X,XXX,XXXđ (primary lớn) + so tháng trước (+/- %)
  Từ phí trễ hạn: X,XXX,XXXđ (cam)
  Từ bồi thường: X,XXXđ (đỏ)

ROW 2 — CHART:
  Card "Doanh thu theo ngày trong tháng":
    Toggle: [Theo ngày] [Theo tháng] (switcher phải)
    Bar chart, 2 màu stack: cam (trễ hạn) + đỏ cam (bồi thường)
    Trục X: ngày | Trục Y: số tiền (đơn vị: 1,000đ)
    Tooltip: ngày + phân tích từng loại phí

ROW 3 — TABLE CHI TIẾT:
  "Giao dịch đã thu trong kỳ"
  Giống tab "Đã thanh toán" ở màn 5.1 nhưng filter theo tháng đang chọn
```

---

## PHẦN 10 — TAB 6: BÁO CÁO

### MÀN HÌNH 6.1 — BÁO CÁO HOẠT ĐỘNG (Mượn/Trả + Top sách + Top độc giả)
```
Màn hình: Báo cáo Hoạt động Thư viện

PAGE HEADER: "Báo cáo Hoạt động"
  Phải: Date range picker (mặc định: tháng hiện tại) + Button "Xuất PDF" (primary) + Button "Xuất Excel" (outline)

SECTION 1 — TỔNG QUAN MƯỢN/TRẢ:
  3 stat cards: Tổng lượt mượn | Tổng lượt trả | Tỉ lệ đúng hạn (% với ring chart nhỏ inline)
  
  Card chart "Lượt mượn & trả theo tháng":
    Grouped bar chart, 12 tháng gần nhất
    Xanh: mượn | Xanh lá: trả
    Filter: [12 tháng] [6 tháng] [Năm nay]

SECTION 2 — TOP SÁCH ĐƯỢC MƯỢN (margin-top 24px):
  Card header: "Top 10 sách được mượn nhiều nhất" + Filter "Tháng này / Quý này / Năm nay / Tùy chọn"
  
  Layout 2 cột (span 7 + span 5):
    Trái: Horizontal bar chart (top 10, bar màu xanh gradient đậm dần từ 1→10)
    Phải: Table chi tiết — Rank # | Ảnh bìa 32px | Tên sách + Tác giả (2 dòng) | Thể loại | Lượt mượn

SECTION 3 — TOP ĐỘC GIẢ (margin-top 24px):
  Card header: "Top độc giả hoạt động nhất"
  Table: Rank | Avatar+Tên | Số thẻ | Lượt mượn | Đúng hạn % (progress pill) | Tháng gia nhập | Nút "Xem hồ sơ"

SECTION 4 — PHÂN TÍCH THEO THỂ LOẠI (margin-top 24px):
  Card header: "Thống kê theo thể loại"
  Treemap chart (d3-style): mỗi ô = 1 thể loại, diện tích = số lượt mượn, màu = intensity
  Click ô: filter table bên dưới theo thể loại đó
```

### MÀN HÌNH 6.2 — SÁCH QUÁ HẠN
```
Màn hình: Danh sách Sách Quá hạn

ALERT HEADER (card đỏ, margin-bottom 16px):
  bg #FEF2F2, border 1px #FCA5A5
  icon AlertOctagon đỏ 24px + "Hiện có 47 giao dịch quá hạn" + "Tổng phí tích lũy: 2,350,000đ"

FILTER + ACTIONS:
  Search + Select "Số ngày trễ: Tất cả / >7 / >14 / >30 ngày"
  Phải: Button "Gửi email nhắc tất cả" (outline, icon Mail) + Button "Xuất Excel liên hệ" (outline, icon Download)

TABLE:
  Columns: Độc giả (avatar+tên+SĐT) | Sách (ảnh nhỏ+tên) | Mã BC | Hạn trả | Số ngày trễ | Phí tích lũy | Actions

  BADGE SỐ NGÀY TRỄ (size lớn hơn, centered):
    1-7 ngày: bg #FFFBEB text #92400E
    8-14 ngày: bg #FFF7ED text #C2410C
    >14 ngày: bg #FEF2F2 text #991B1B bold + pulse animation nhẹ

  Actions: icon Mail (gửi email riêng) | icon Phone (click-to-call) | icon Eye (xem GD) | icon FileText (in thông báo PDF)

MODAL "Gửi email nhắc":
  Preview email: "Kính gửi [Tên độc giả], Bạn đang có sách quá hạn..."
  Highlight các thông số tự động điền
  Button "Gửi ngay" + Button "Tùy chỉnh nội dung"
```

### MÀN HÌNH 6.3 — AI ANALYTICS DASHBOARD
```
Màn hình: AI Analytics & Báo cáo Thông minh

PAGE HEADER: "AI Analytics" + Badge "Beta" (tím, icon Sparkles) + "Cập nhật lần cuối: hôm nay 08:00"

SECTION 1 — TÓM TẮT AI THÁNG NÀY (card nổi bật, border-left 4px solid #7C3AED):
  bg gradient nhạt tím #F5F3FF
  Header: icon Brain 20px tím + "Tóm tắt tháng 5/2025 do AI tạo" + Badge "GPT-4o" (xám nhỏ)
  
  LOADING STATE: 3 dòng skeleton + "AI đang phân tích dữ liệu..."
  
  CONTENT STATE: Đoạn văn 4-5 câu tiếng Việt (14px, line-height 1.7):
    "Tháng 5/2025, thư viện ghi nhận 623 lượt mượn, tăng 8% so tháng trước..."
    Các từ khóa quan trọng: highlight nền vàng nhạt
  
  FOOTER: "Được tạo bởi AI · 04/06/2025 09:15" (12px mờ) + Button "Tạo lại" (outline nhỏ, icon RefreshCw)

SECTION 2 — PHÁT HIỆN XU HƯỚNG ĐỘT BIẾN (grid 2 cột):
  Card trái "Sách đang hot":
    Header: icon TrendingUp xanh + "Xu hướng tăng đột biến"
    List 5 items: Ảnh bìa 40px + Tên sách + [Badge "▲ +240% so tuần trước" (xanh lá)] + Sparkline chart nhỏ 60×20px
  
  Card phải "Sách ít được mượn":
    Header: icon TrendingDown đỏ + "Sách ít hoạt động (12 tháng)"
    List 5 items tương tự + Badge "Chưa có lượt mượn" (đỏ nhạt) + Button "Xem xét thanh lý" (link)

SECTION 3 — GỢI Ý NHẬP THÊM SÁCH (card, icon Lightbulb vàng):
  Header: "Gợi ý nhập bổ sung" + Badge "Dựa trên 47 tìm kiếm thất bại & 12 wishlist"
  List 5 items: icon Book + Tên sách gợi ý + Tác giả gợi ý + "Được tìm X lần" (badge) + Button "Thêm vào danh sách mua" (outline nhỏ)
  Button "Xem tất cả gợi ý →" (link, dưới list)

SECTION 4 — PHÂN TÍCH SENTIMENT REVIEW (card, 2 cột):
  Cột trái: Horizontal bar chart 3 thanh: Tích cực 68% (xanh lá) | Trung lập 22% (xám) | Tiêu cực 10% (đỏ)
  Cột phải: Top 3 sách được yêu thích nhất (icon Heart đỏ + tên sách + % tích cực)
  Footer card: Badge "PhoBERT NLP" + "Dựa trên 1,247 đánh giá"
  
  PLACEHOLDER STATE (nếu chưa có đủ data): Icon FlaskConical + "Cần ít nhất 100 đánh giá để phân tích. Hiện có: 47/100."
```

---

## PHẦN 11 — TAB 7: CÀI ĐẶT HỆ THỐNG

### MÀN HÌNH 7 — CÀI ĐẶT (Layout 2 cột với sidebar phụ)
```
Màn hình: Cài đặt Hệ thống

LAYOUT (khác các màn hình khác — không có content bg):
  Sidebar phụ (width 220px, bg #FFFFFF, border-right, padding 16px):
    Label "CẤU HÌNH" (10px uppercase mờ, margin-bottom 8px):
      - link "Hạn mức mượn" (active: text primary + border-left 2px)
      - link "Phí trễ hạn"
      - link "Cài đặt gia hạn"
      - link "Quản lý ngày nghỉ"
      - link "Thời gian giữ đặt trước"
    Label "TÀI KHOẢN" (margin-top 16px):
      - link "Quản lý tài khoản thủ thư"
    Label "HỆ THỐNG" (margin-top 16px):
      - link "Template Email"
      - link "Backup & Restore"
      - link "Log hoạt động"
  
  Content area (flex 1, padding 24px, bg #F8FAFC):
    Mỗi section dưới đây hiển thị khi click link tương ứng trong sidebar phụ

====================================
SECTION: HẠN MỨC MƯỢN
====================================
Card "Cấu hình hạn mức theo loại thẻ" (padding 20px):
  Header: "Hạn mức mượn" + Button "+ Thêm loại thẻ" (primary nhỏ, phải)
  
  Table:
    Columns: Loại thẻ | Số sách tối đa | Số ngày mượn | Số lần gia hạn | Số ngày/lần gia hạn | Actions
    
    Row data (2 mặc định):
      "Thẻ Thường" | 3 | 14 ngày | 2 lần | 7 ngày | [Edit] [Delete]
      "Thẻ Ưu tiên" | 5 | 21 ngày | 3 lần | 7 ngày | [Edit] [Delete]
    
    INLINE EDIT (khi click Edit — không mở modal):
      Các ô số chuyển thành input ngay trong dòng + icon Check (lưu) + icon X (hủy)
  
  MODAL "Thêm loại thẻ":
    Tên loại thẻ * | Số sách tối đa * (number) | Số ngày mượn * (number) | Số lần gia hạn * | Ngày/lần gia hạn *
    Button Hủy + Thêm

====================================
SECTION: PHÍ TRỄ HẠN
====================================
Card "Cấu hình phí" (padding 20px):

  DEFAULT FEE:
    Label "Phí trễ hạn mặc định:" + Input (số tiền, suffix "đ/ngày/cuốn") + Helper "Áp dụng cho tất cả loại sách trừ khi cấu hình riêng"
  
  Toggle "Cài đặt phí riêng cho từng loại sách":
    ON → Table 2 dòng hiện ra:
      | Loại sách | Phí/ngày/cuốn |
      | Sách thường | [input] đ |
      | Sách quý/hiếm | [input] đ |
  
  Divider + Label "Phí bồi thường thiệt hại":
    Grid 3 cột:
      "Hỏng nhẹ" / [input số] % giá trị sách / = ~XX,XXXđ (ví dụ auto-tính)
      "Hỏng nặng" / [input số] %
      "Mất sách" / [input số] %
    Helper: "% được tính trên giá trị định giá của sách"
  
  Button "Lưu cài đặt phí" (primary, phải)

====================================
SECTION: CÀI ĐẶT GIA HẠN
====================================
Card padding 20px:
  
  Grid 2 cột:
    "Số lần gia hạn tối đa" (number input, default 2) + Helper "Mỗi giao dịch mượn"
    "Số ngày gia hạn mỗi lần" (number input, default 7) + Helper "ngày/lần"
  
  INFO BOX (bg #EFF6FF, icon Info xanh):
    "Hệ thống sẽ từ chối gia hạn nếu có độc giả khác đang đặt trước sách đó. Cấu hình này áp dụng cho tất cả loại thẻ."
  
  Note nhỏ: "Cấu hình số lần gia hạn theo từng loại thẻ → xem Hạn mức mượn"
  
  Button "Lưu" (primary, phải)

====================================
SECTION: QUẢN LÝ NGÀY NGHỈ
====================================
Card padding 20px:

  NGÀY NGHỈ TUẦN (card nhỏ, border-radius 8px):
    Label "Ngày nghỉ định kỳ hàng tuần"
    Checkboxes: ☐ Thứ 2 ☐ Thứ 3 ☐ Thứ 4 ☐ Thứ 5 ☐ Thứ 6 ☐ Thứ 7 ☑ Chủ nhật
  
  NGÀY NGHỈ LỄ (margin-top 16px):
    Label "Ngày nghỉ lễ & Tết" + Button "+ Thêm ngày" (outline nhỏ, phải)
    Tag list (wrap): mỗi tag = "30/04/2025" + icon X (xóa) + tooltip tên ngày lễ
    Calendar mini picker (mở khi click "+ Thêm ngày"): chọn ngày → confirm thêm
  
  INFO BOX vàng: "Các ngày nghỉ này sẽ được loại trừ khi tính phí trễ hạn. Ví dụ: nếu hạn trả rơi vào Chủ nhật, hệ thống tự chuyển sang ngày làm việc kế tiếp."
  
  Preview năm 2025 (danh sách dạng badge nhỏ): "Tết Âm lịch 29/1-2/2 · 30/4 · 1/5 · 2/9 · Chủ nhật hàng tuần"
  
  Button "Lưu" (primary, phải)

====================================
SECTION: THỜI GIAN GIỮ ĐẶT TRƯỚC
====================================
Card padding 20px:
  
  Label "Số ngày độc giả có thể đến lấy sách sau khi nhận thông báo sách có sẵn"
  Input số (default 2, suffix "ngày") + Preview live:
    "Ví dụ: Nếu thông báo gửi ngày 10/06 → hạn lấy sách: 12/06 (2 ngày)"
  
  Label "Hành động khi hết hạn giữ:" + Radio:
    ○ Tự động hủy đặt trước và trả bản sao về kho (khuyên dùng)
    ○ Cảnh báo thủ thư, chờ xử lý thủ công
  
  Button "Lưu" (primary, phải)

====================================
SECTION: QUẢN LÝ TÀI KHOẢN THỦ THƯ
====================================
Card padding 20px:

  Header: "Danh sách tài khoản Thủ thư" + Button "+ Tạo tài khoản" (primary nhỏ, phải)
  
  TABLE:
    Columns: Avatar+Tên | Email | Vai trò (badge) | Trạng thái | Ngày tạo | Actions
    
    Badge VAI TRÒ:
      "Thủ thư trưởng" (tím, toàn quyền)
      "Thủ thư phụ" (xanh, không xóa)
      "Chỉ xem" (xám)
    
    Badge TRẠNG THÁI: "Hoạt động" (xanh lá) | "Bị khóa" (đỏ)
    
    Actions: icon Edit2 (đổi vai trò) | icon Lock/Unlock | icon KeyRound (reset PW) | icon Trash2 (xóa)

  MODAL "Tạo tài khoản Thủ thư" (width 520px):
    Grid 2 cột: Họ * | Tên *
    Email * (helper: "Mật khẩu tạm thời sẽ gửi về email này")
    Vai trò * (3 radio cards có mô tả quyền hạn chi tiết):
      [Thủ thư trưởng] — Toàn quyền: thêm/sửa/xóa sách, mượn/trả, xem báo cáo
      [Thủ thư phụ]    — Như trên nhưng không thể xóa dữ liệu
      [Chỉ xem]        — Chỉ xem thông tin, không thực hiện giao dịch
    
    PREVIEW QUYỀN HẠN (card xanh nhạt, auto-update theo radio):
      List icon Check/X: ✓ Mượn/trả sách ✓ Xem báo cáo ✗ Xóa sách ✗ Xem audit log...
    
    Footer: Button Hủy + Button "Tạo & Gửi email" (primary, icon Send)

====================================
SECTION: TEMPLATE EMAIL
====================================
Card padding 20px:

  Label "Các mẫu email thông báo tự động" (helper: "Click vào từng mẫu để chỉnh sửa nội dung")
  
  ACCORDION LIST (gap 8px):
    Mỗi accordion item (bg #FFFFFF, border, border-radius 8px):
      Header (padding 12px 16px, cursor pointer): icon Mail + Tên mẫu + Badge "Đang bật" (xanh) + icon ChevronDown
      
      Accordion items:
        1. "Nhắc trả sách sắp đến hạn" (gửi trước 3 ngày)
        2. "Sách đặt trước đã có sẵn" (khi bản sao được trả về)
        3. "Thông báo quá hạn" (sau khi quá hạn 1 ngày)
        4. "Tài khoản bị khóa"
        5. "Mật khẩu tạm thời" (gửi thủ thư mới)
      
      KHI MỞ ACCORDION (padding 16px, border-top):
        Variables khả dụng (pills click-to-insert): {{ten_doc_gia}} {{ten_sach}} {{han_tra}} {{so_ngay_tre}} {{phi_phat}}
        
        HTML Editor (textarea, height 200px, font mono 13px, bg #F9FAFB):
          <placeholder of actual email HTML>
        
        Toolbar đơn giản trên textarea: [B] [I] [U] [Link] [Variable ▾]
        
        Row nút: Button "Preview email" (outline, icon Eye) + Button "Lưu template" (primary nhỏ)
        
        MODAL PREVIEW: Iframe-like preview với email render thật

====================================
SECTION: BACKUP & RESTORE
====================================
Grid 2 cột (gap: 16px):

  Card trái "Backup thủ công" (padding 20px):
    Button "Tạo backup ngay" (primary full-width, icon Database + Download)
    Khi click: Progress bar + "Đang tạo backup... (23%)"
    
    Divider + "Lịch sử backup" (label nhỏ)
    List 5 backup gần nhất:
      Mỗi dòng: icon HardDrive + "backup_2025-06-04_09-00.sql.gz" + "2.3 MB" + "hôm nay 09:00" + icon Download (tải về)
  
  Card phải "Backup tự động" (padding 20px):
    Toggle "Tự động backup định kỳ" (on/off)
    [Khi bật]: Select "Tần suất" (Hàng ngày / Hàng tuần / Hàng tháng) + Time picker "Lúc: 02:00"
    "Giữ tối đa X backup" (input number, default 30)
    Info: "Backup tự động lưu tại: /backups/auto/"
    Button "Lưu cài đặt" (primary)

Card full-width "Khôi phục từ backup" (padding 20px, border: 1px solid #FCA5A5):
  Header: icon AlertTriangle đỏ + "Khôi phục hệ thống" (text đỏ)
  
  WARNING BOX (bg #FEF2F2, border đỏ):
    "CẢNH BÁO: Thao tác này sẽ XÓA TOÀN BỘ dữ liệu hiện tại và thay thế bằng dữ liệu từ file backup. Không thể hoàn tác. Hãy chắc chắn bạn có backup mới nhất trước khi thực hiện."
  
  Upload zone "Chọn file backup .sql.gz hoặc .sql" + Button "Khôi phục" (đỏ full-width)
  
  CONFIRM MODAL 2 bước khi click "Khôi phục":
    Bước 1: "Bạn có chắc chắn?" + Input "Nhập 'XAC-NHAN-KHOI-PHUC' để xác nhận" + Button xác nhận
    Bước 2: Input mật khẩu Admin + Button "Tiến hành khôi phục"

====================================
SECTION: LOG HOẠT ĐỘNG HỆ THỐNG
====================================
INFO BADGE: "Chỉ tài khoản Admin mới có quyền xem trang này. Thủ thư không thể truy cập."

Card padding 20px:
  FILTER BAR:
    Date range + Search "Tên admin hoặc hành động..." + Select "Loại hành động":
      (Sửa thông tin sách / Thay đổi phí / Khóa tài khoản / Xóa dữ liệu / Đăng nhập / Thay đổi cài đặt / Tất cả)
  
  TABLE:
    Columns: Thời gian | Admin (avatar+tên) | Hành động (badge màu) | Đối tượng | Giá trị cũ | Giá trị mới | IP địa chỉ

    Badge HÀNH ĐỘNG (màu theo mức độ):
      "Chỉnh sửa" (xanh) | "Xóa" (đỏ) | "Cấu hình" (cam) | "Khóa TK" (đỏ) | "Đăng nhập" (xám)
    
    Cột "Giá trị cũ → Mới":
      Inline diff: text cũ line-through đỏ → text mới xanh lá
      Hoặc button "Xem chi tiết" nếu thay đổi phức tạp

    Dòng action "Xóa": nền đỏ rất nhạt
    
    Expand row: Xem full JSON của thay đổi (code block font mono, bg #F9FAFB)
  
  Pagination + Note: "Log được lưu giữ 12 tháng. Sau đó tự động xóa (cấu hình theo luật bảo mật)."
```

---

## PHẦN 12 — MODAL & COMPONENT CHUNG

```
MODAL COMPONENT CHUẨN:
  Backdrop: rgba(0,0,0,0.5), blur nhẹ
  Modal container: bg #FFFFFF, border-radius 12px, shadow modal, padding 0
  Header: padding 20px 24px, border-bottom, flex space-between: Tiêu đề (18px bold) + icon X
  Body: padding 20px 24px, max-height 60vh, overflow-y auto
  Footer: padding 16px 24px, border-top, flex justify-end, gap 8px

SUCCESS TOAST (top-right, z-index cao):
  bg #ECFDF5, border 1px #A7F3D0, border-radius 8px, padding 12px 16px
  icon CheckCircle 20px (#10B981) + text + icon X
  Auto-dismiss sau 3 giây, slide-out animation

ERROR TOAST: bg #FEF2F2, border #FCA5A5, icon XCircle đỏ

EMPTY STATE COMPONENT:
  Icon Lucide 48px (màu #9CA3AF)
  Title 15px #374151
  Sub 13px #6B7280
  Optional: Button action

LOADING STATE:
  Skeleton loader (shimmer animation, bg gradient #E5E7EB → #F3F4F6)
  Dạng: rectangular blocks theo hình dạng content thật

CONFIRM DIALOG COMPONENT:
  Modal nhỏ 400px
  Icon Warning/Trash (48px, màu phù hợp) + Tiêu đề + Mô tả
  Button Hủy (outline) + Button Xác nhận (đỏ hoặc primary)

PAGINATION COMPONENT:
  "Hiển thị X-Y trong Z kết quả" + [← Trước] [1] [2] [3] [...] [N] [Sau →]
  Dropdown "X/trang": 10, 20, 50, 100
  Active page: filled primary

BADGE COMPONENT:
  Kích thước: Small (height 20px, 10px text) | Default (height 24px, 12px text) | Large (height 28px, 13px text)
  Luôn có rounded-full (pill shape)
  Không dùng màu ngẫu nhiên — xem các màu đã định nghĩa trong Design System

PRINT PHIẾU MƯỢN (PDF layout):
  A5 (148×210mm), portrait
  Header: Logo + Tên thư viện + "PHIẾU MƯỢN SÁCH"
  Info: Độc giả / Số thẻ / Ngày mượn / Hạn trả
  Table: STT | Tên sách | Mã bản sao | Vị trí kệ
  Footer: Chữ ký thủ thư + QR code xác nhận + "Thư viện XYZ — ĐT: ... — Email: ..."
```

---

## PHẦN 13 — LUỒNG ĐIỀU HƯỚNG (USER FLOW)

```
LUỒNG ĐĂNG NHẬP ADMIN:
  [Login page] → nhập email+mật khẩu đúng → [OTP 2FA] → nhập đúng OTP → [Dashboard]
  [OTP 2FA] → sai 3 lần → [Account locked screen] → tự unlock sau 15 phút

LUỒNG ĐĂNG NHẬP THỦ THƯ:
  [Login page] → nhập email+mật khẩu đúng → [Dashboard] (không qua OTP)

LUỒNG MƯỢN SÁCH:
  [Giao dịch > Mượn/Trả] → quét thẻ độc giả → kiểm tra hạn mức/nợ phí
  → nếu OK: quét barcode sách → kiểm tra sách còn sẵn → xác nhận → in phiếu
  → nếu sách đặt trước: cảnh báo + xác nhận mượn thay đặt trước

LUỒNG TRẢ SÁCH:
  [Giao dịch > Mượn/Trả tab Trả] → quét barcode sách → tìm GD đang mượn
  → ghi nhận tình trạng trả → tính phí tự động → thu phí → xác nhận

LUỒNG THÊM SÁCH MỚI:
  [Quản lý Sách > Danh sách] → click "Thêm qua ISBN"
  → nhập ISBN → tra Google Books API → review thông tin → upload ảnh bìa → Lưu
  → Redirect: "Lưu & Thêm bản sao" → màn Thêm bản sao (đã điền sẵn tên sách)

LUỒNG XỬ LÝ QUÁ HẠN:
  [Dashboard widget "Quá hạn"] → click "Xem tất cả" → [Báo cáo > Sách quá hạn]
  → gửi email nhắc → hoặc xử lý khi độc giả đến trả (màn Trả sách tính phí tự động)

LUỒNG THANH LÝ BẢN SAO:
  [Quản lý Kho > Import & Thanh lý] → tab Thanh lý → quét barcode
  → kiểm tra không đang mượn → nhập lý do/ngày → xác nhận kép → done

LUỒNG XEM BÁO CÁO & XUẤT:
  [Báo cáo > Báo cáo Hoạt động] → chọn kỳ → xem chart/table
  → Button "Xuất PDF" → tải PDF với logo thư viện, tiêu đề, bảng, chart
  → Button "Xuất Excel" → tải .xlsx với dữ liệu raw + filter đã áp dụng
```

---

## PHẦN 14 — GỢI Ý SPRINT VÀ ƯU TIÊN CODE

```
SPRINT 1 — TUẦN 1-2 (Nền tảng):
  Dev A: Auth flow (Login + OTP 2FA) + Sidebar/Header/Layout + Dashboard
  Dev B: Quản lý Sách (màn 2.1, 2.2, 2.3) + Chi tiết sách (2.3)

SPRINT 2 — TUẦN 2-3 (Kho & Giao dịch):
  Dev A: Quản lý Kho (3.1, 3.2, 3.3) + Màn hình Mượn/Trả (4.1 — màn phức tạp nhất)
  Dev B: Gia hạn/Đặt trước (4.2) + Quản lý Độc giả (4.4) + Lịch sử GD (4.3)

SPRINT 3 — TUẦN 3-4 (Tài chính, Báo cáo, Cài đặt):
  Dev A: Tài chính (5.1, 5.2) + Báo cáo (6.1, 6.2) + Xuất PDF/Excel
  Dev B: Cài đặt hệ thống (7 — tất cả sections) + AI Analytics (6.3 mock data)
  Cuối tuần 4: Sách nổi bật (2.5) + Báo cáo kho (3.4) + Polish UI

CÓ THỂ CẮT GIẢM (nếu không kịp, làm sau MVP):
  - AI Analytics (6.3): dùng mock data tĩnh thay vì gọi GPT API
  - Template Email (7): placeholder UI, chưa implement gửi thật
  - Backup tự động: chỉ làm backup thủ công
  - Màn In QR (3.2 tab 2): màn hình mượn/trả quan trọng hơn
  - Sách nổi bật drag-and-drop: dùng nút Up/Down thay thế

TỔNG SỐ MÀN HÌNH: 45 màn hình / screens
TỔNG SỐ TAB: 7 navigation tabs
MÀN HÌNH PHỨC TẠP NHẤT: 4.1 Mượn/Trả (cần xử lý nhiều state nhất)
MÀN HÌNH QUAN TRỌNG NHẤT: 4.1 → 4.3 → 2.1 → 3.1 → 5.1
```

---

*File này được tạo để import vào Figma hoặc đọc cho AI design tool.*
*Phiên bản: 1.0 — Tháng 6/2025*
*Dự án: Đồ án tốt nghiệp — Hệ thống Quản lý Thư viện*