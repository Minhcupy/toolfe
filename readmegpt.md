# TOOLFE - Kế hoạch phát triển Frontend

## 1. Vai trò của project

`toolfe` là ứng dụng Angular cho toàn bộ hành trình người dùng:

- Đăng nhập và quản lý phiên.
- Tạo project, chọn ngôn ngữ, voice và kiểu output.
- Upload video lớn trực tiếp lên MinIO/S3 qua presigned multipart URL.
- Theo dõi từng stage và lỗi xử lý theo thời gian thực.
- Xem/sửa transcript, bản dịch, subtitle và timing trên timeline.
- Nghe preview voice, xem preview video rồi mới render toàn bộ.
- Tải video, audio dub, SRT/VTT/ASS và xem usage.

Frontend không giữ secret của storage/AI provider và không tự gọi trực tiếp API STT/TTS trả phí.

## 2. Luồng người dùng chính

```text
Đăng nhập
  -> Dashboard
  -> Tạo project
  -> Upload video
  -> Chọn ngôn ngữ/giọng/subtitle
  -> Bắt đầu xử lý
  -> Theo dõi progress
  -> Review transcript + bản dịch
  -> Nghe/xem preview
  -> Render final
  -> Tải output
```

Luồng phải cho phép quay lại sau khi reload/đóng trình duyệt; Backend là source of truth cho upload/job status.

## 3. Cấu trúc feature đề xuất

```text
src/app/
  core/
    auth/
    api/
    guards/
    interceptors/
    errors/
    config/
  shared/
    ui/
    pipes/
    validators/
    models/
  features/
    auth/
    dashboard/
    projects/
    upload/
    processing/
    editor/
    outputs/
    settings/
  layout/
```

Ưu tiên standalone components, lazy-loaded routes, typed reactive forms và Angular Signals cho UI state. RxJS dùng cho HTTP/SSE/upload streams. Không đưa toàn bộ state lên global store nếu feature-local state đã đủ.

## 4. Route dự kiến

- `/login`, `/register`
- `/projects`
- `/projects/new`
- `/projects/:projectId`
- `/projects/:projectId/upload`
- `/projects/:projectId/process`
- `/projects/:projectId/editor`
- `/projects/:projectId/outputs`
- `/settings/voices`
- `/admin/jobs` (phase production/admin)

## 5. Màn hình quan trọng

### Upload

- Drag/drop hoặc file picker, kiểm tra type/size/duration sơ bộ.
- Multipart upload có progress, pause/resume/retry và cancel.
- Chỉ upload trực tiếp vào presigned URL do Backend cấp.
- Lưu `uploadId`, part/ETag cần thiết để reload vẫn resume được; dữ liệu local chỉ là cache, phải reconcile với Backend.
- Cảnh báo không đóng tab khi part đang gửi nhưng không khóa người dùng vô lý.

### Processing

- Stepper thể hiện stage hiện tại và stage đã xong.
- Hiển thị progress, elapsed time, thông báo dễ hiểu, không đưa stack trace lên UI.
- SSE tự reconnect với backoff; khi reconnect phải gọi lại API status để tránh mất terminal event.
- Nút cancel/retry tùy theo state và quyền.

### Editor

- Video player là clock chính; segment list tự scroll theo current time.
- Hai cột source/translation, speaker/voice và start/end time.
- Waveform/timeline chỉ tải dữ liệu mức cần thiết, virtualize danh sách segment dài.
- Validate overlap, khoảng trống, ký tự/giây và độ dài audio dự kiến.
- Autosave có debounce + optimistic locking; xử lý xung đột version rõ ràng.
- Preview theo một segment hoặc range để tiết kiệm thời gian/chi phí.

### Output

- So sánh source/final, chọn subtitle bật/tắt khi output hỗ trợ.
- Tải video/audio/subtitle qua signed URL có hạn dùng.
- Hiện version, cấu hình render, thời gian tạo và dung lượng.

## 6. UX cho “khớp âm thanh và hành động”

- Timeline phải phân biệt rõ source audio, dubbed audio và subtitle segments.
- Segment có cảnh báo khi speech dài hơn slot, TTS speed vượt ngưỡng hoặc chồng lấn.
- Hiển thị scene cut marker để người dùng không kéo câu qua cảnh không phù hợp.
- Cho nghe A/B source/dub tại cùng timestamp.
- Lip-sync nếu có phải là tùy chọn nâng cao, hiển thị thời gian/chi phí và nhãn AI; không mô tả như bảo đảm chính xác tuyệt đối.
- Không tự bật voice cloning; phải có xác nhận quyền sử dụng giọng và consent rõ ràng.

## 7. Các phase triển khai

### Phase 0 - Design system và API foundation

Mục tiêu: nền tảng UI nhất quán, typed và dễ test.

- Chốt màu, typography, spacing, loading/empty/error states và responsive breakpoints.
- Tạo app shell, header/sidebar, toast/dialog, form controls cơ bản.
- Environment config, typed API client sinh từ OpenAPI hoặc bọc tập trung.
- Auth interceptor, error mapping, correlation ID hiển thị khi cần support.
- Route lazy loading, guards và skeleton pages.
- Thiết lập lint/format/unit test; kiểm tra accessibility cơ bản.

**Hoàn thành khi:** app shell chạy responsive, route lazy load, API error có UI thống nhất và CI build/test pass.

### Phase 1 - Auth, dashboard, project và upload

Mục tiêu: hoàn thành vòng đời trước khi xử lý.

- Login/register/logout/refresh token theo contract Backend.
- Dashboard project: list, search, filter status, pagination, empty state.
- Wizard tạo project: source/target language, subtitle, voice cơ bản.
- Multipart upload service: parallel parts có giới hạn, retry, pause/resume/cancel.
- Hiển thị validate file và lỗi storage/API thân thiện.
- Route protection và kiểm tra ownership từ server response.

**Hoàn thành khi:** upload file lớn ổn định, refresh trang resume/reconcile được và token hết hạn không làm mất toàn bộ thao tác.

### Phase 2 - Processing progress realtime

Mục tiêu: người dùng hiểu hệ thống đang làm gì và xử lý được lỗi.

- Trang progress theo state machine chuẩn.
- SSE client có reconnect/backoff, teardown đúng khi đổi route.
- Fallback polling chậm khi SSE không khả dụng.
- Cancel/retry với confirm phù hợp và idempotency key.
- Error catalog: lỗi file, ngôn ngữ, provider, quota, render; gợi ý hành động tiếp theo.

**Hoàn thành khi:** reload không sai trạng thái, terminal event luôn được phản ánh và không có nhiều SSE connection bị rò rỉ.

### Phase 3 - Transcript/subtitle editor

Mục tiêu: human-in-the-loop trước khi render final.

- Video player + segment list đồng bộ timestamp.
- Sửa source/translation/timing/speaker/voice.
- Autosave theo batch, dirty state, undo/redo cục bộ và optimistic conflict handling.
- Import/export SRT/VTT; subtitle preview có style cơ bản.
- Waveform, keyboard shortcuts, virtual scroll cho video dài.
- Cảnh báo CPS, overlap, segment quá ngắn/dài.

**Hoàn thành khi:** edit 1-2 giờ video vẫn mượt, seek/segment sync đúng và không mất thay đổi khi API lỗi.

### Phase 4 - Voice preview, dubbing và render

Mục tiêu: kiểm tra chất lượng với chi phí thấp trước final.

- Voice browser/filter theo ngôn ngữ, giới tính/style nếu provider hỗ trợ.
- Map voice theo speaker; preview một segment/range.
- A/B audio và hiển thị độ lệch duration.
- Render configuration: resolution, subtitle burn-in/soft-sub, audio mix, output format.
- Output history, version compare và download signed URL.
- Consent flow cho custom/clone voice và nhãn nội dung AI.

**Hoàn thành khi:** thay voice chỉ gọi redub downstream, preview không bị nhầm version và output download hết hạn được refresh an toàn.

### Phase 5 - Quality, accessibility và production

Mục tiêu: trải nghiệm ổn định trên thiết bị và mạng thực tế.

- Responsive desktop/tablet; editor ưu tiên desktop, mobile có thông báo giới hạn hợp lý.
- WCAG: keyboard navigation, focus, label, contrast, caption cho preview.
- Performance budget, route preloading có chọn lọc, waveform/video memory profiling.
- Analytics không chứa transcript/filename nhạy cảm; error monitoring có sanitize.
- E2E cho happy path và failure path; visual regression cho màn hình chính.
- i18n giao diện Việt/Anh, timezone/number/date đúng locale.

**Hoàn thành khi:** Core Web Vitals hợp lý trên dashboard, editor không leak memory, E2E critical path pass và accessibility audit không còn lỗi nghiêm trọng.

## 8. State và API rules

- Server là source of truth cho project/job; UI state không tự “đoán” job completed.
- Các action tạo/cancel/retry/render gửi `Idempotency-Key`.
- Model từ API tách khỏi view model để Backend đổi field ít ảnh hưởng component.
- Không lưu access token lâu dài trong `localStorage` nếu có thể dùng HttpOnly secure cookie; nếu contract dùng bearer token phải đánh giá XSS và refresh rotation.
- Signed URL không ghi vào analytics/log và không cache lâu hơn TTL.
- UI chỉ hiện action hợp lệ theo state nhưng Backend vẫn phải kiểm quyền và transition.

## 9. Testing tối thiểu

- Unit: validator, mapper, progress state, upload part scheduler, SSE reconnect.
- Component: upload, progress stepper, segment row/editor và error states.
- Contract: client build từ OpenAPI hoặc kiểm schema response.
- E2E: login -> create -> upload -> process -> edit -> render -> download.
- E2E lỗi: upload part fail/resume, token refresh, SSE disconnect, version conflict, job failed/retry.

## 10. Definition of Done chung

- Có loading, empty, success và error state; không chỉ làm happy path.
- Component có keyboard/focus behavior và responsive state phù hợp.
- Subscription/SSE/object URL được cleanup khi component destroy.
- Không log token, presigned URL hoặc transcript nhạy cảm.
- Feature có unit/component test và critical flow có E2E khi phù hợp.
- UI dùng đúng API/event contract version đã chốt với hai service còn lại.

