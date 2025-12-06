// file: lib/utils.ts

/**
 * 1. HÀM FORMAT: Tự động tạo Slug chuẩn SEO từ Tiêu đề (Hỗ trợ tiếng Việt)
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase() // Chuyển thành chữ thường
    .normalize("NFD") // Tách dấu ra khỏi ký tự (VD: é -> e + dấu sắc)
    .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu vừa tách
    .replace(/[đĐ]/g, "d") // Xử lý chữ đ/Đ riêng
    .replace(/[^a-z0-9\s-]/g, "") // Xóa ký tự đặc biệt (@, #, !, ...)
    .trim() // Xóa khoảng trắng đầu cuối
    .replace(/\s+/g, "-"); // Thay khoảng trắng bằng dấu gạch ngang
}

/**
 * 2. HÀM VALIDATE: Kiểm tra dữ liệu đầu vào có hợp lệ không
 * Trả về: null nếu OK, hoặc chuỗi thông báo lỗi nếu sai.
 */
export function validatePostData(body: Record<string, unknown>) {
  // Kiểm tra tiêu đề
  if (!body.title || body.title.trim().length < 5) {
    return "Tiêu đề phải có ít nhất 5 ký tự.";
  }

  // Kiểm tra nội dung
  if (!body.content || body.content.trim() === "") {
    return "Nội dung bài viết không được để trống.";
  }

  // (Mở rộng) Kiểm tra trạng thái nếu cần
  const validStatus = ['DRAFT', 'PUBLISHED', 'SCHEDULED'];
  if (body.status && !validStatus.includes(body.status)) {
    return "Trạng thái bài viết không hợp lệ.";
  }

  return null; // Không có lỗi
}