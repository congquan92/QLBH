export type PublicPageContent = {
    eyebrow: string;
    title: string;
    description: string;
    highlights: string[];
    sections: Array<{
        title: string;
        body: string[];
    }>;
};

export const PUBLIC_PAGES: Record<string, PublicPageContent> = {
    "he-thong-cua-hang": {
        eyebrow: "Hệ thống bán lẻ",
        title: "Mạng lưới cửa hàng ARES CLUB",
        description: "Thông tin trưng bày tại website đang được đồng bộ với hệ thống bán hàng. Bạn có thể xem nhanh các khu vực phục vụ và thời gian hoạt động trước khi ghé mua trực tiếp.",
        highlights: ["Mở cửa 09:00 - 21:00", "Tư vấn size trực tiếp", "Đổi trả tại cửa hàng"],
        sections: [
            {
                title: "Khu vực phục vụ",
                body: ["Hà Nội: Hoàng Mai, Cầu Giấy, Hà Đông.", "TP.HCM: Quận 1, Quận 7, Thủ Đức.", "Các điểm bán đang được đồng bộ thêm từ hệ thống nội bộ để hiển thị chi tiết trên website."],
            },
            {
                title: "Dịch vụ tại cửa hàng",
                body: ["Tư vấn phối đồ, kiểm tra tồn kho tại chỗ và hỗ trợ đổi size theo chính sách hiện hành.", "Bạn nên lưu lại mã hoặc tên sản phẩm trên website để nhân viên tra cứu nhanh khi tới cửa hàng."],
            },
        ],
    },
    "canh-bao": {
        eyebrow: "An toàn giao dịch",
        title: "Cảnh báo lừa đảo khi mua sắm online",
        description: "ARES CLUB chỉ hỗ trợ thanh toán và xác nhận đơn qua các kênh chính thức. Không chuyển khoản hoặc cung cấp OTP cho bên thứ ba khi chưa xác minh nguồn liên hệ.",
        highlights: ["Không chia sẻ OTP", "Chỉ thanh toán qua kênh chính thức", "Kiểm tra đúng tên miền website"],
        sections: [
            {
                title: "Dấu hiệu cần cảnh giác",
                body: [
                    "Tin nhắn yêu cầu chuyển khoản vào tài khoản cá nhân để giữ hàng hoặc nâng cấp đơn.",
                    "Liên kết đăng nhập hoặc nhập mã OTP không thuộc tên miền chính thức của cửa hàng.",
                    "Cuộc gọi tự xưng nhân viên kỹ thuật yêu cầu đọc mã xác thực để nhận quà hoặc hoàn tiền.",
                ],
            },
            {
                title: "Cách xử lý",
                body: ["Ngừng giao dịch ngay khi có dấu hiệu bất thường và liên hệ hotline hoặc email trên website.", "Chụp lại màn hình cuộc trò chuyện, số điện thoại hoặc tài khoản nhận tiền để hỗ trợ xác minh."],
            },
        ],
    },
    "lien-he": {
        eyebrow: "Liên hệ hỗ trợ",
        title: "Kết nối với ARES CLUB",
        description: "Thông tin liên hệ trên website đang được dùng thống nhất với dữ liệu hiển thị ở footer. Nếu bạn cần hỗ trợ đơn hàng, đổi trả hoặc tư vấn sản phẩm, hãy dùng các kênh dưới đây.",
        highlights: ["Hotline: 0964247171", "Email: quan@aresclub.vn", "Hỗ trợ cả tuần"],
        sections: [
            {
                title: "Kênh chăm sóc khách hàng",
                body: ["Hotline: 0964247171.", "Email: quan@aresclub.vn.", "Địa chỉ văn phòng: Tầng 16, Tòa nhà Rainbow Linh Đàm, Quận Hoàng Mai, Hà Nội."],
            },
            {
                title: "Thời gian phản hồi",
                body: ["Khung giờ 09:00 - 21:00 mỗi ngày đối với tư vấn sản phẩm và hỗ trợ đặt hàng.", "Các yêu cầu gửi ngoài giờ sẽ được xử lý vào phiên làm việc kế tiếp."],
            },
        ],
    },
    "huong-dan": {
        eyebrow: "Hỗ trợ đổi trả",
        title: "Hướng dẫn đổi sản phẩm nhanh",
        description: "Website hiện hỗ trợ tra cứu sản phẩm và thông tin đơn hàng. Khi cần đổi hàng, bạn chỉ cần chuẩn bị mã đơn và giữ nguyên tình trạng sản phẩm theo quy định.",
        highlights: ["Giữ tem mác đầy đủ", "Đổi trong thời hạn chính sách", "Có thể đổi tại cửa hàng"],
        sections: [
            {
                title: "Các bước thực hiện",
                body: [
                    "Chuẩn bị mã đơn hàng hoặc thông tin người nhận để đối soát nhanh.",
                    "Liên hệ chăm sóc khách hàng hoặc mang sản phẩm tới cửa hàng gần nhất.",
                    "Nhân viên sẽ kiểm tra tình trạng sản phẩm và hướng dẫn đổi size hoặc mẫu tương ứng.",
                ],
            },
            {
                title: "Điều kiện áp dụng",
                body: ["Sản phẩm còn mới, chưa qua sử dụng và còn tem mác.", "Không áp dụng với sản phẩm nằm trong chương trình xả kho hoặc ghi chú không hỗ trợ đổi trả."],
            },
        ],
    },
    "tin-tuc": {
        eyebrow: "Bản tin thương hiệu",
        title: "Tin tức và cập nhật mới",
        description: "Phần nội dung bài viết chuyên sâu đang được hoàn thiện. Trong giai đoạn này, website ưu tiên hiển thị sản phẩm, danh mục và thông tin mua sắm cốt lõi trước.",
        highlights: ["Cập nhật bộ sưu tập", "Thông báo ưu đãi", "Lịch mở bán"],
        sections: [
            {
                title: "Nội dung sắp có",
                body: ["Giới thiệu bộ sưu tập theo mùa.", "Tổng hợp mẹo phối đồ, chọn size và chăm sóc trang phục nam."],
            },
        ],
    },
    "gioi-thieu": {
        eyebrow: "Về thương hiệu",
        title: "ARES CLUB và định hướng phong cách nam hiện đại",
        description: "Khu vực giới thiệu được giữ ngắn gọn để tập trung trải nghiệm mua sắm. Thương hiệu hướng tới dòng sản phẩm nam trẻ trung, dễ phối, tập trung vào tính ứng dụng hằng ngày.",
        highlights: ["Phong cách nam hiện đại", "Thiết kế dễ mặc", "Danh mục trải rộng"],
        sections: [
            {
                title: "Định vị sản phẩm",
                body: ["Tập trung vào nhóm áo, quần và phụ kiện nam theo nhu cầu mặc đi làm, đi chơi và sinh hoạt hằng ngày.", "Kết hợp mức giá hợp lý với trải nghiệm mua sắm trực tuyến rõ ràng, dễ tra cứu."],
            },
        ],
    },
    "chinh-sach-doi-tra": {
        eyebrow: "Chính sách mua hàng",
        title: "Chính sách đổi trả",
        description: "Trang này tổng hợp ngắn gọn các nguyên tắc đổi trả đang được đội vận hành áp dụng để khách hàng dễ tra cứu trước khi liên hệ hỗ trợ.",
        highlights: ["Đổi size theo điều kiện", "Kiểm tra sản phẩm trước khi đổi", "Hỗ trợ tại cửa hàng"],
        sections: [
            {
                title: "Nguyên tắc chung",
                body: ["Sản phẩm phải còn nguyên tem mác và chưa qua sử dụng.", "Yêu cầu đổi trả cần nằm trong thời hạn được công bố tại điểm bán hoặc trong xác nhận đơn hàng."],
            },
        ],
    },
    "chinh-sach-bao-mat": {
        eyebrow: "Quyền riêng tư",
        title: "Chính sách bảo mật thông tin",
        description: "Website chỉ sử dụng dữ liệu khách hàng cho mục đích xử lý đơn hàng, hỗ trợ sau bán và cải thiện trải nghiệm mua sắm theo đúng phạm vi được cung cấp.",
        highlights: ["Chỉ dùng cho xử lý đơn hàng", "Không chia sẻ trái phép", "Lưu trữ có kiểm soát"],
        sections: [
            {
                title: "Dữ liệu được sử dụng",
                body: [
                    "Thông tin nhận hàng, số điện thoại, email và lịch sử đơn để phục vụ xác nhận giao hàng và chăm sóc khách hàng.",
                    "Dữ liệu được giới hạn theo nhu cầu vận hành và không dùng ngoài mục đích bán hàng nếu không có sự đồng ý của khách hàng.",
                ],
            },
        ],
    },
    "tuyen-dung": {
        eyebrow: "Cơ hội nghề nghiệp",
        title: "Tuyển dụng tại ARES CLUB",
        description: "Khối quản trị và vận hành nhân sự đã có backend riêng trong hệ thống. Khu vực client hiện giữ vai trò giới thiệu nhanh các nhóm vị trí đang được ưu tiên tuyển dụng.",
        highlights: ["Bán hàng tại cửa hàng", "Kho vận", "Vận hành thương mại điện tử"],
        sections: [
            {
                title: "Nhóm vị trí thường mở",
                body: ["Nhân viên bán hàng và tư vấn khách hàng tại cửa hàng.", "Nhân viên kho, điều phối đơn và hỗ trợ vận hành nhập xuất.", "Nhân sự nội dung, chăm sóc khách hàng và vận hành gian hàng trực tuyến."],
            },
        ],
    },
};
