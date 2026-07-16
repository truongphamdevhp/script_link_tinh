# Development Rules

1. Khi sửa xong 1 bug, phải build, test API, đọc log để confirm là đã xong

2. Trước khi sửa code, phải đọc và hiểu luồng xử lý hiện tại. Không được đoán logic hoặc giả định code cũ là sai.

3. Trước khi xóa code, phải hiểu chính xác đoạn code đó đang làm gì và liệu nó có xử lý trường hợp đặc biệt nào hay không.

4. Khi thêm tính năng mới, ưu tiên thay đổi nhỏ nhất có thể. Không tự ý refactor lớn hoặc thay đổi kiến trúc nếu tôi chưa yêu cầu.

5. Khi fix bug, phải tìm nguyên nhân gốc (root cause) và sửa tận gốc. Tránh workaround hoặc cách sửa chỉ xử lý triệu chứng.

6. Luôn đánh giá side effect của thay đổi. Không sửa một bug nhưng tạo ra bug mới hoặc làm hỏng chức năng hiện có.

7. Không được đoán API, class, function, biến hoặc format dữ liệu. Nếu chưa chắc, phải đọc source code để xác nhận.

8. Sau khi hoàn thành thay đổi, tự review lại diff để kiểm tra logic, regression, dead code và các rủi ro tiềm ẩn.

9. Khi đề xuất giải pháp, giải thích ngắn gọn nguyên nhân, cách fix và ảnh hưởng của thay đổi.

