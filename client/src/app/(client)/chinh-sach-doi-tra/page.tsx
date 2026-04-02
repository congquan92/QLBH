export default function ReturnPolicy() {
    return (
        <div className="bg-white py-10 lg:py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Heading */}
                <h2 className="text-xl font-semibold text-neutral-700 mb-3">Chính sách đổi trả</h2>

                <h1 className="text-3xl md:text-4xl font-bold tracking-wide mb-10">CHÍNH SÁCH ĐỔI TRẢ ARES CLUB</h1>

                {/* Section 1 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">1. Điều kiện đổi trả</h3>

                    <p className="mb-4 leading-relaxed text-neutral-700">ARES CLUB hỗ trợ đổi/ trả trong thời hạn quy định khi sản phẩm đáp ứng các điều kiện sau:</p>

                    <ul className="list-disc ml-6 space-y-2 text-neutral-700">
                        <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng, chưa giặt ủi.</li>
                        <li>Không bị bẩn, rách, biến dạng hoặc có mùi lạ.</li>
                        <li>Còn đầy đủ phụ kiện đi kèm (nếu có).</li>
                        <li>Có hóa đơn/ mã đơn hàng hợp lệ.</li>
                    </ul>
                </section>

                {/* Section 2 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">2. Thời hạn đổi trả</h3>

                    <p className="mb-4 leading-relaxed text-neutral-700">
                        ARES CLUB áp dụng đổi/ trả trong vòng <b>07 ngày</b> kể từ khi nhận hàng (tính theo dấu bưu điện hoặc xác nhận giao hàng).
                    </p>

                    <p className="mb-4 leading-relaxed text-neutral-700">Sau thời hạn trên, ARES CLUB xin phép không tiếp nhận yêu cầu đổi/ trả.</p>
                </section>

                {/* Section 3 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">3. Trường hợp được đổi trả</h3>

                    <ul className="list-disc ml-6 space-y-2 text-neutral-700">
                        <li>Sản phẩm lỗi do nhà sản xuất.</li>
                        <li>Giao sai mẫu, sai màu, sai size so với đơn đặt hàng.</li>
                        <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển.</li>
                    </ul>
                </section>

                {/* Section 4 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">4. Trường hợp không hỗ trợ đổi trả</h3>

                    <ul className="list-disc ml-6 space-y-2 text-neutral-700">
                        <li>Sản phẩm đã qua sử dụng, giặt ủi hoặc bị tác động làm thay đổi form.</li>
                        <li>Sản phẩm không còn đầy đủ tem mác hoặc phụ kiện đi kèm.</li>
                        <li>Sản phẩm thuộc danh mục khuyến mãi/ xả kho (nếu có thông báo riêng).</li>
                        <li>Lỗi phát sinh do người sử dụng.</li>
                    </ul>
                </section>

                {/* Section 5 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">5. Quy trình đổi trả</h3>

                    <ol className="list-decimal ml-6 space-y-2 text-neutral-700">
                        <li>Liên hệ ARES CLUB qua hotline/ kênh hỗ trợ để xác nhận yêu cầu.</li>
                        <li>Đóng gói sản phẩm và gửi về địa chỉ được hướng dẫn.</li>
                        <li>ARES CLUB kiểm tra và phản hồi trong vòng 2-3 ngày làm việc.</li>
                        <li>Tiến hành đổi size/ đổi mẫu hoặc hoàn tiền theo thỏa thuận.</li>
                    </ol>
                </section>

                {/* Section 6 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">6. Phí vận chuyển</h3>

                    <p className="mb-4 leading-relaxed text-neutral-700">
                        Nếu lỗi thuộc về ARES CLUB, chúng tôi chịu toàn bộ phí vận chuyển đổi/ trả. Trường hợp đổi size theo nhu cầu cá nhân, khách hàng vui lòng thanh toán phí vận chuyển hai chiều.
                    </p>
                </section>

                {/* Section 7 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">7. Lưu ý</h3>

                    <p className="mb-4 leading-relaxed text-neutral-700">Chính sách có thể được điều chỉnh tùy thời điểm. ARES CLUB sẽ cập nhật thông tin trên website để khách hàng tiện theo dõi.</p>
                </section>
            </div>
        </div>
    );
}
