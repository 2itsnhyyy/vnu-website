export interface FaqType {
  question: string;
  content: string;
}

export const faqs: FaqType[] = [
    {
      question: "Tôi có thể xem được những gì trên website này?",
      content:
        "Bạn có thể quan sát toàn cảnh khu đô thị ĐHQG dưới dạng bản đồ 3D sinh động, hiển thị rõ các tòa nhà, trường học, công trình, cây xanh, và các địa điểm nổi bật. Website cho phép bạn tắt/mở các lớp như cây xanh, tòa nhà, hoặc đường đi để dễ dàng tìm kiếm và khám phá không gian theo ý muốn.",
    },
    {
      question: "Làm thế nào để xem thông tin chi tiết của một tòa nhà?",
      content:
        "Rất đơn giản! Bạn chỉ cần nhấp vào tòa nhà mà bạn quan tâm trên bản đồ 3D. Một cửa sổ thông tin sẽ hiện ra, cung cấp cho bạn các chi tiết như tên tòa nhà, chức năng, số tầng, và các thông tin liên quan khác.",
    },
    {
      question: "Tôi có thể tìm đường từ nơi này sang nơi khác trong khu đô thị không?",
      content:
        "Hoàn toàn có thể! Website cung cấp tính năng tìm đường thông minh. Bạn chỉ cần nhập điểm xuất phát và điểm đến, hệ thống sẽ tự động tính toán và hiển thị lộ trình tối ưu nhất trên bản đồ 3D.",
    },
    {
      question: "Tôi có cần đăng nhập để xem bản đồ 3D không?",
      content:
        "Bạn không cần đăng nhập để truy cập và xem bản đồ 3D. Tuy nhiên, nếu bạn muốn sử dụng các tính năng nâng cao như tương tác trên forum, bạn sẽ cần tạo một tài khoản và đăng nhập.",
    },
    {
      question: "Website có cập nhật tin tức mới về ĐHQG không?",
      content:
        "MyVNU luôn luôn cập nhật những tin tức mới nhất về các sự kiện, hoạt động và thông báo quan trọng liên quan đến ĐHQG. Hãy thường xuyên ghé thăm trang tin tức để không bỏ lỡ bất kỳ thông tin nào!",
    },
  ];
