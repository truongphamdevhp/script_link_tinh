# Quy tắc làm việc

1. Trước khi sửa code, phải đọc và hiểu luồng xử lý hiện tại. Không được đoán logic, API, class, function, biến, format dữ liệu hoặc giả định code cũ là sai.

2. Khi fix bug:

   * Phải cố gắng tái hiện bug trước khi sửa.
   * Có thể thêm log, debug hoặc breakpoint để tìm nguyên nhân gốc.
   * Phải sửa root cause, không chỉ xử lý triệu chứng hoặc dùng workaround.
   * Sau khi sửa, phải build, chạy lại đúng kịch bản gây lỗi, test API/UI/automation liên quan và kiểm tra log.
   * Nên thêm regression test nếu dự án cho phép.

3. Khi thêm feature:

   * Phải đọc và hiểu các feature, flow và cấu hình liên quan.
   * Ưu tiên thay đổi nhỏ nhất có thể, không tự ý refactor lớn hoặc đổi kiến trúc.
   * Phải kiểm tra feature mới hoạt động đúng và không mâu thuẫn hoặc làm hỏng feature hiện có.
   * Test happy path, dữ liệu rỗng, input sai, lỗi xử lý và các trường hợp biên liên quan.

4. Trước khi xóa hoặc thay thế code, phải hiểu chính xác mục đích của nó, các nơi đang sử dụng và những trường hợp đặc biệt mà nó có thể đang xử lý.

5. Luôn đánh giá side effect và regression của thay đổi. Không sửa một lỗi nhưng tạo lỗi mới hoặc làm thay đổi hành vi cũ ngoài yêu cầu.

6. Nếu phải viết logic có tính trick, bất thường, khó hiểu, ngược trực giác, phụ thuộc platform/framework hoặc workaround bắt buộc, phải thêm comment ngắn bằng tiếng Anh, giải thích:

   * Vì sao đoạn code đó cần thiết.
   * Nó ngăn lỗi hoặc trường hợp đặc biệt nào.
   * Vì sao cách viết đơn giản hơn không đúng.

   Comment phải giải thích lý do, không mô tả lại code hiển nhiên.

7. Không để lại code tạm sau khi hoàn thành: debug log, print, code thử nghiệm, code bị comment, biến tạm hoặc workaround không còn cần thiết.

8. Sau khi sửa xong:

   * Build project hoặc target bị ảnh hưởng.
   * Chạy các test phù hợp.
   * Test API/UI/runtime thực tế nếu có thể.
   * Đọc log để xác nhận flow chạy đúng và không có lỗi ẩn.
   * Tự review toàn bộ diff để kiểm tra logic, regression, dead code, thay đổi ngoài phạm vi và rủi ro tiềm ẩn.

9. Không được nói bug đã fix hoặc feature đã hoàn thành nếu chưa có bằng chứng kiểm chứng. Nếu không thể build hoặc test vì thiếu môi trường, service, tài khoản, dữ liệu hoặc hardware, phải nói rõ phần nào chưa được xác minh.

10. Khi hoàn thành, báo cáo ngắn gọn:

* Root cause hoặc cách triển khai.
* Những gì đã thay đổi.
* Cách đã build/test/xác minh.
* Side effect hoặc regression đã kiểm tra.
* Những phần chưa thể kiểm tra và rủi ro còn lại.
