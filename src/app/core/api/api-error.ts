import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    return error.error?.message ?? (error.status === 0 ? 'Không thể kết nối tới máy chủ.' : 'Yêu cầu không thành công.');
  }
  return 'Đã có lỗi không mong muốn xảy ra.';
}
