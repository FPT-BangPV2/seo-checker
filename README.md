# MetaTag Auditor - Chrome & Edge Extension ✨

<img src="https://raw.githubusercontent.com/FPT-BangPV2/headtag-checker/main/extension/icon.png" align="right" width="128px"/>

**Phát hiện ngay lập tức các lỗi SEO nghiêm trọng trong phần `<head>` và heading trên trang:**

- Thẻ `<title>` trùng lặp hoặc thiếu

- `<meta description>` trùng hoặc thiếu

- Multiple H1, thiếu H1

- Multiple canonical

- Multiple meta robots

- Open Graph / Twitter Cards bị trùng hoặc thiếu các thẻ quan trọng

- Thẻ hreflang lỗi/mâu thuẫn

- Và rất nhiều lỗi phổ biến khác

Phù hợp cho: SEO specialist, Front-end Dev, Content Editor, Agency kiểm tra website khách hàng nhanh.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/xxxxxxxxxxxxxxxxx?label=Chrome%20Web%20Store&style=for-the-badge&logo=googlechrome)](https://chrome.google.com/webstore/detail/xxxx)

[![Edge Add-ons](https://img.shields.io/badge/Edge_Addons-0078D4?style=for-the-badge&logo=microsoftedge)](https://microsoftedge.microsoft.com/addons/detail/xxxx)

[![GitHub stars](https://img.shields.io/github/stars/username/metatag-auditor?style=for-the-badge)](https://github.com/username/metatag-auditor/stargazers)

## Demo (GIF/Video)

![Demo](assets/demo.gif)

## Current Features

- Phát hiện thẻ trùng lặp trong `<head>` (title, meta description, canonical, robots, og:title, og:description…)

- Kiểm tra cấu trúc heading (multiple H1, thiếu H1, H2-H6 bị bỏ qua)

- Hỗ trợ hreflang validation cơ bản

- Hoạt động trên mọi website (kể cả localhost, dev environment)

- Không gửi dữ liệu ra ngoài → 100% privacy

## Quick Installation (Dev Mode)

1. Clone hoặc download repo này

2. Mở Chrome → `chrome://extensions`

3. Bật "Developer, **Developer mode**"

4. Click "**Load unpacked**" → chọn thư mục dự án

5. Done! Icon sẽ xuất hiện trên thanh công cụ

Edge cũng làm tương tự tại `edge://extensions`

## Publish to Store (Successfully Tested)

- Đã publish trên cả Chrome Web Store và Microsoft Edge Add-ons

- File `manifest.json` dùng manifest v3 chuẩn

- Tối ưu dung lượng < 200KB

## Upcoming Features (In Development & Open for Suggestions)

- [ ] So sánh head tag giữa 2 URL (rất hay khi kiểm tra staging vs production)

- [ ] Export báo cáo PDF/CSV

- [ ] Kiểm tra tốc độ load các thẻ (og:image quá lớn, favicon 404…)

- [ ] Dark mode cho popup

- [ ] Tích hợp AI gợi ý meta description tối ưu (dựa on-page content)

- [ ] Kiểm tra structured data (JSON-LD, microdata) cơ bản

- [ ] Lịch sử kiểm tra các trang đã duyệt

- [ ] Whitelist/Blacklist domain

- [ ] Highlight trực tiếp trên trang (màu đỏ = lỗi nghiêm trọng, vàng = cảnh báo)

- [ ] Popup chi tiết + số lượng lỗi

## Contribute

Rất hoan nghênh tham gia phát triển dự án :

- Thêm ngôn ngữ (i18n) - hiện tại có tiếng Việt + tiếng Anh

- Thêm rule kiểm tra mới

- Cải thiện UI/UX

## License

MIT © 2025

---

⭐ Nếu bạn thấy hữu ích, hãy cho 1 star để mình có động lực phát triển tiếp nhé!

Có vấn đề hoặc yêu cầu tính năng mới → mở issue hoặc inbox admin.

Happy SEO! 🚀
