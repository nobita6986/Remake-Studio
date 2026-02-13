import type { Style } from './types';

export const STYLES: Style[] = [
  {
    title: 'Siêu Thực Ám Ảnh U Buồn',
    description: 'Phong cách 3D siêu thực, tạo không khí lạnh lẽo, cô lập và u buồn. Nhấn mạnh vào nhân vật có ngoại hình chân thực đến đáng sợ (uncanny valley).',
    tooltip: 'Chọn phong cách này, sau đó tải tệp Excel chứa các bối cảnh bạn muốn áp dụng.',
    locked: false,
    imageUrls: [
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80', // Dark Forest
      'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80', // Gloomy Figure
      'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=600&q=80', // Mystic
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80', // Dark Mood
      'https://images.unsplash.com/photo-1505506874110-6a7a69069a08?auto=format&fit=crop&w=600&q=80'  // Spooky
    ],
    promptTemplate: `**YÊU CẦU QUAN TRỌNG: Chỉ sử dụng hình ảnh tôi cung cấp để lấy thông tin về ngoại hình và trang phục của nhân vật. Toàn bộ bối cảnh, môi trường và hành động phải được tạo ra hoàn toàn dựa trên văn bản prompt sau đây. Không được sao chép hay tái sử dụng bối cảnh từ hình ảnh gốc.**

Vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách sau
Phong cách: 3D thực tế, với phong cách tối giản và gam màu lạnh, u tối, tập trung vào việc tạo cảm giác u buồn và cô lập.
Chi tiết nhân vật:
[CHARACTER_STYLE]
+ Màu da: nhợt nhạt, hơi xám hoặc xanh tái, thể hiện sự thiếu sức sống, mệt mỏi.
+ Phong cách trang phục: Trang phục đơn giản, giữ như nguyên bản như ảnh nhân vật tôi gửi nhưng chi tiết chân thực. Màu sắc trang phục chủ yếu là các tông màu đất, xám, xanh đậm, đen. Nếu có yêu cầu khác ở phân cảnh thì phải check lại scene trước xem những scene nào cùng khung cảnh phải đồng nhất trang phục với các scene đó.
+ Phong cách vẽ mặt nhân vật: Siêu thật, khuôn mặt biểu cảm, tập trung vào đôi mắt trống rỗng, vô hồn, thể hiện sự [rùng rợn, ám ảnh đi sâu vào trong những nỗi sợ thuần khiết nhất của con người giống phong cách uncanny valley]. Các đường nét trên khuôn mặt sắc sảo, để tăng thêm vẻ u uất.
+ Các nhân vật khác nếu có sẽ với phong cách polygonol faceless, màu sắc cũng u ám, lạnh tối.
+ Tỉ lệ kích thước cơ thể: Hợp lý, không quá tập trung vào phần đầu mà làm cho đầu to mình nhỏ
+ Phong cách vẽ bối cảnh: Bối cảnh siêu thực và đầy áp lực, gợi cảm giác tù túng, khắc nghiệt. Các công trình kiến trúc có kiến trúc thô sơ, màu xám xịt, không có hoa văn trang trí. Cây cối trơ trụi hoặc bị bao phủ bởi màu sắc ảm đạm. Khung cảnh thường mờ ảo. Màu sắc của bối cảnh chủ yếu là tông màu tối, lạnh, như xám, xanh đậm, nâu đất, với những điểm nhấn màu đỏ hoặc cam cháy nhỏ để tạo sự tương phản và tăng tính bi kịch. Bối cảnh của phân cảnh là [A]

**HƯỚNG DẪN ĐẦU RA: Không viết bất kỳ văn bản, tiêu đề hay mô tả nào. Toàn bộ phản hồi của bạn phải chỉ là hình ảnh được tạo ra.**`
  },
  {
    title: 'Siêu thực',
    description: 'Phong cách 3D siêu thực, mô phỏng một cảnh quay điện ảnh chất lượng cao. Nhấn mạnh vào chi tiết, ánh sáng chuyên nghiệp và độ chân thực.',
    tooltip: 'Chọn phong cách này, sau đó tải tệp Excel chứa các bối cảnh bạn muốn áp dụng.',
    locked: false,
    imageUrls: [
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80', // High quality portrait
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80', // Clean office
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=600&q=80', // Business
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80', // Professional
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80'  // Corporate
    ],
    promptTemplate: `YÊU CẦU QUAN TRỌNG: Chỉ sử dụng hình ảnh tôi cung cấp để lấy thông tin về ngoại hình và trang phục của nhân vật. Toàn bộ bối cảnh, môi trường và hành động phải được tạo ra hoàn toàn dựa trên văn bản prompt sau đây. Không được sao chép hay tái sử dụng bối cảnh từ hình ảnh gốc

Hãy vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách:* Photorealistic, 3D render siêu thực (hyper-realistic). Phong cách này mô phỏng một cảnh quay điện ảnh (cinematic still) chất lượng cao. Màu sắc được cân bằng chuyên nghiệp, có độ tương phản rõ ràng và độ sâu trường ảnh (bokeh) mềm mại ở hậu cảnh. Ánh sáng sử dụng kỹ thuật 3-point-lighting (key, fill, rim light) để tạo khối và tách nhân vật khỏi nền. Mood của ảnh là chuyên nghiệp, đáng tin cậy và chân thực.

Chi tiết nhân vật: [CHARACTER_STYLE] + Màu da/màu lông (đối với động vật): Tả thực, với kết cấu da tự nhiên (natural skin texture), có thể thấy rõ các chi tiết nhỏ như lỗ chân lông một cách tinh tế (không quá lạm dụng). Màu da được render chân thực, có độ bóng và hấp thụ ánh sáng tự nhiên, mang lại cảm giác sống động. + Phong cách trang phục: Tả thực 100%. Chất liệu vải (ví dụ: cotton của áo phông) phải rõ ràng, với các nếp gấp, đường chỉ may, và cách vải đổ bóng một cách tự nhiên. Mức độ chi tiết cực cao. Nếu có yêu cầu khác ở phân cảnh thì phải check lại scene trước xem những scene nào cùng khung cảnh phải đồng nhất trang phục với các scene đó. Ví dụ cũng buổi chiều tại trường học, chỉ đổi góc độ quay nhân vật thì vẫn là trang phục đấy, một cảnh khác nhân vật đã đi nơi khác vào thời điểm khác thì cần phải check lại kịch bản để lựa chọn trang phục phù hợp. + Phong cách vẽ mặt nhân vật: Siêu thực (hyper-realistic). Khuôn mặt phải truyền tải biểu cảm một cách chính xác như ảnh chụp (photograph-like). Mắt có độ phản chiếu (reflections) và độ ẩm. Tóc được render từng sợi (hair strands) hoặc từng lọn tóc rõ ràng, không phải một khối đặc. + Các nhân vật khác nếu có sẽ với phong cách: Cũng siêu thực (photorealistic), cùng một cấp độ chi tiết và chất lượng ánh sáng như nhân vật chính để đảm bảo sự đồng nhất trong cảnh. + Tỉ lệ kích thước cơ thể (Tất cả nhân vật): Tỷ lệ cơ thể người hoàn toàn thực tế, chính xác về mặt giải phẫu. Không có bất kỳ sự cách điệu hay phóng đại nào. + Phong cách vẽ bối cảnh: Photorealistic. Bối cảnh (ví dụ: văn phòng, studio) được render với vật liệu thực tế (gỗ, kim loại, kính) và ánh sáng tự nhiên/nhân tạo tương tác chính xác. Hậu cảnh thường được làm mờ (depth of field / bokeh) để tập trung vào nhân vật. Các vật thể trong bối cảnh có chi tiết sắc nét (nếu ở focus) và phản chiếu thực tế.

Bối cảnh của phân cảnh là [A]

HƯỚNG DẪN ĐẦU RA: Không viết bất kỳ văn bản, tiêu đề hay mô tả nào. Toàn bộ phản hồi của bạn phải chỉ là hình ảnh được tạo ra.`
  },
  {
    title: 'Cổ tích Việt Nam',
    description: 'Phong cách 3D tả thực, điện ảnh, tập trung vào bối cảnh và trang phục truyền thống Việt Nam.',
    tooltip: 'Chọn phong cách này, sau đó tải tệp Excel chứa các bối cảnh bạn muốn áp dụng.',
    locked: false,
    imageUrls: [
        'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80', // Rice fields
        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80', // Temple
        'https://images.unsplash.com/photo-1599707367072-cd6ad66aa1a8?auto=format&fit=crop&w=600&q=80', // Dragon
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80', // Lanterns
        'https://images.unsplash.com/photo-1557456170-98535e56c592?auto=format&fit=crop&w=600&q=80'  // Lotus/Pond
    ],
    promptTemplate: `YÊU CẦU QUAN TRỌNG: Chỉ sử dụng hình ảnh tôi cung cấp để lấy thông tin về ngoại hình và trang phục của nhân vật. Toàn bộ bối cảnh, môi trường và hành động phải được tạo ra hoàn toàn dựa trên văn bản prompt sau đây. Không được sao chép hay tái sử dụng bối cảnh từ hình ảnh gốc

Hãy vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách: 3D, tả thực (realism) như ảnh chụp, với độ chi tiết cao. Phong cách tập trung vào sự chân thực về hình khối, ánh sáng, vật liệu và cảm xúc, mang tính điện ảnh hiện đại.

Màu sắc: Bảng màu tự nhiên, trung thực, phản ánh đúng môi trường và thời gian trong câu chuyện. Sử dụng dải màu rộng để thể hiện sắc thái và độ sâu của cảnh.

Ánh sáng: Sử dụng kỹ thuật chiếu sáng tả thực, mô phỏng ánh sáng tự nhiên (mặt trời, mặt trăng) hoặc ánh sáng nhân tạo một cách chính xác. Tạo bóng đổ mềm mại hoặc sắc nét tùy thuộc vào nguồn sáng, nhấn mạnh độ sâu và khối lượng của các đối tượng. Có thể áp dụng các kỹ thuật chiếu sáng điện ảnh như rim light, key light, fill light để tạo hiệu ứng ấn tượng.

Kỹ thuật: Mô hình 3D độ phân giải cao, kết xuất (rendering) với engine vật lý chính xác. Sử dụng hiệu ứng chiều sâu trường ảnh (depth of field), motion blur (mờ chuyển động) để tăng tính điện ảnh.

Mood: Tùy thuộc vào kịch bản, nhưng luôn duy trì sự chân thực và cảm xúc sâu sắc. Có thể là bi tráng, hùng vĩ, u tối hoặc ấm áp, thân thuộc.

Cảm giác: Mang lại cảm giác như đang xem một bộ phim điện ảnh chất lượng cao hoặc một bức ảnh chuyên nghiệp.

Nét vẽ: Không có nét vẽ theo nghĩa truyền thống, thay vào đó là sự mô phỏng chân thực về kết cấu bề mặt (surface texture) như da, vải, kim loại, gỗ, vảy... với độ chi tiết vi mô cao.

Chi tiết nhân vật: [CHARACTER_STYLE] + Màu da/màu lông (đối với động vật):

Da người: Tả thực hoàn toàn, với các chi tiết về lỗ chân lông, nếp nhăn nhỏ, tàn nhang (nếu có), độ bóng tự nhiên. Màu da phản ánh tông da người Việt Nam, có thể có các vết bẩn, trầy xước tùy theo tình huống.

Thần Điểu/Giao Long: Lông/vảy được mô phỏng chi tiết như thật, có độ bóng, phản chiếu ánh sáng và kết cấu riêng biệt. Màu sắc tự nhiên nhưng vẫn giữ được vẻ kỳ ảo, huyền thoại. + Phong cách trang phục: Trang phục Việt Nam truyền thống (áo bà ba, áo tứ thân, áo the, áo dài) được mô phỏng 3D chân thực, với chất liệu vải có thể nhìn thấy rõ sợi vải, nếp gấp tự nhiên, độ sờn rách (nếu có). Màu sắc và hoa văn chính xác theo văn hóa Việt. + Phong cách vẽ mặt nhân vật: Tả thực hoàn toàn, biểu cảm chân thật và sâu sắc.

Biểu cảm: Đa dạng, thể hiện rõ các cảm xúc nội tâm (vui, buồn, giận, sợ hãi, quyết tâm, mưu mô...).

Chi tiết trên mặt: Mắt, mũi, miệng, lông mày, tóc được mô phỏng 3D sống động. Đặc biệt, đôi mắt phải có hồn, thể hiện được chiều sâu suy nghĩ. Có thể có các chi tiết như mồ hôi, nước mắt, vết sẹo nhỏ để tăng tính chân thực. + Các nhân vật khác nếu có sẽ với phong cách: Đồng nhất phong cách 3D tả thực, đảm bảo sự hòa hợp về mặt thị giác. + Tỉ lệ kích thước cơ thể (Tất cả nhân vật): Tỷ lệ cơ thể người thực tế, chính xác về giải phẫu học. Các sinh vật thần thoại cũng được mô phỏng với tỷ lệ hợp lý, ấn tượng. + Phong cách vẽ bối cảnh:

Phong cách: 3D tả thực, môi trường được xây dựng chi tiết và sống động.

Công trình: Nhà cửa, làng mạc, đền đài được mô phỏng 3D chính xác theo kiến trúc Việt Nam cổ truyền (mái ngói, cột gỗ, sân gạch, vườn cây). Các vật liệu như gỗ, gạch, ngói, đất sét đều có kết cấu chi tiết.

Thiên nhiên: Cây cối (tre, khế, đa), sông nước, núi non, bãi biển được mô phỏng 3D với độ chi tiết cao, thể hiện rõ lá cây, sóng nước, kết cấu đá. Có thể thêm các yếu tố thời tiết (mưa, sương mù, nắng gắt) để tăng tính chân thực.

Màu sắc bối cảnh: Tự nhiên, phong phú, phản ánh đúng màu sắc của thiên nhiên và kiến trúc Việt Nam.

Ánh sáng: Sử dụng hệ thống chiếu sáng vật lý (physical-based rendering) để tạo ra ánh sáng và bóng đổ chân thực nhất. Có thể sử dụng các hiệu ứng ánh sáng volumetric (khối lượng ánh sáng) như tia nắng xuyên qua tán cây, sương mù có ánh sáng.

Bối cảnh của phân cảnh là [A]`
  },
  {
    title: 'Cyberpunk Neon',
    description: 'Phong cách Sci-fi tương lai với ánh sáng neon rực rỡ, công nghệ cao và không khí đô thị sầm uất.',
    tooltip: 'Chọn phong cách này cho các bối cảnh tương lai, khoa học viễn tưởng.',
    locked: false,
    imageUrls: [
      'https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&w=600&q=80', // Cyber city
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80', // Neon rain
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80', // Neon Signs
      'https://images.unsplash.com/photo-1535378437327-b7149a516c58?auto=format&fit=crop&w=600&q=80', // Robot
      'https://images.unsplash.com/photo-1605218453259-7df9192f1594?auto=format&fit=crop&w=600&q=80'  // Portrait
    ],
    promptTemplate: `YÊU CẦU QUAN TRỌNG: Chỉ sử dụng hình ảnh tôi cung cấp để lấy thông tin về ngoại hình và trang phục của nhân vật. Toàn bộ bối cảnh, môi trường và hành động phải được tạo ra hoàn toàn dựa trên văn bản prompt sau đây. Không được sao chép hay tái sử dụng bối cảnh từ hình ảnh gốc

Hãy vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách: Cyberpunk, Sci-fi, Futuristic.

Màu sắc: Sử dụng bảng màu Neon rực rỡ (Cyan, Magenta, Purple, Electric Blue) tương phản với màu đen sâu của bóng tối. Ánh sáng nhân tạo từ biển hiệu, đèn LED, hologram.

Không khí: Đô thị tương lai, công nghệ cao, có thể hơi tăm tối (dystopian) hoặc hào nhoáng (utopian).

Chi tiết nhân vật: [CHARACTER_STYLE] + Màu da: Có thể có ánh kim loại hoặc phản chiếu ánh sáng neon. + Phong cách trang phục: Trang phục công nghệ cao (techwear), áo khoác da, các chi tiết phát sáng, phụ kiện kim loại. + Phong cách vẽ mặt nhân vật: Chân thực nhưng có thể thêm các đường nét cybernetic hoặc trang điểm neon.

Bối cảnh của phân cảnh là [A]

HƯỚNG DẪN ĐẦU RA: Không viết bất kỳ văn bản, tiêu đề hay mô tả nào. Toàn bộ phản hồi của bạn phải chỉ là hình ảnh được tạo ra.`
  },
  {
    title: 'Phim Nhựa Cổ Điển',
    description: 'Phong cách nhiếp ảnh Analog, màu sắc hoài cổ, hạt film (grain), gợi cảm giác ký ức và quá khứ.',
    tooltip: 'Chọn phong cách này cho các bối cảnh hồi tưởng, lịch sử cận đại.',
    locked: false,
    imageUrls: [
      'https://images.unsplash.com/photo-1495572565679-026049a03195?auto=format&fit=crop&w=600&q=80', // Film grain
      'https://images.unsplash.com/photo-1517260739337-6799d2df9c72?auto=format&fit=crop&w=600&q=80', // Party
      'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=600&q=80', // Camera
      'https://images.unsplash.com/photo-1596525166948-c87bb3c3e6dc?auto=format&fit=crop&w=600&q=80', // Portrait
      'https://images.unsplash.com/photo-1550926866-92167d32c524?auto=format&fit=crop&w=600&q=80'  // Mood
    ],
    promptTemplate: `YÊU CẦU QUAN TRỌNG: Chỉ sử dụng hình ảnh tôi cung cấp để lấy thông tin về ngoại hình và trang phục của nhân vật. Toàn bộ bối cảnh, môi trường và hành động phải được tạo ra hoàn toàn dựa trên văn bản prompt sau đây. Không được sao chép hay tái sử dụng bối cảnh từ hình ảnh gốc

Hãy vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách: Nhiếp ảnh phim nhựa (Analog Film Photography), Retro, Vintage.

Kỹ thuật: Mô phỏng chất liệu ảnh phim cũ (film grain), độ nhiễu hạt tự nhiên, có thể có vết xước nhẹ hoặc light leak. Tiêu cự mềm mại.

Màu sắc: Màu sắc hơi ngả vàng (sepia) hoặc xanh (cool shift), độ bão hòa thấp (desaturated), mang lại cảm giác hoài cổ, ký ức.

Chi tiết nhân vật: [CHARACTER_STYLE] + Màu da: Tự nhiên nhưng chịu ảnh hưởng của tone màu film. + Phong cách trang phục: Trang phục phù hợp với thời đại (nếu có), texture vải rõ ràng. + Phong cách vẽ mặt nhân vật: Chân thực, cảm xúc lắng đọng.

Bối cảnh của phân cảnh là [A]

HƯỚNG DẪN ĐẦU RA: Không viết bất kỳ văn bản, tiêu đề hay mô tả nào. Toàn bộ phản hồi của bạn phải chỉ là hình ảnh được tạo ra.`
  },
  {
    title: 'Anime Nhật Bản',
    description: 'Phong cách hoạt hình Nhật Bản hiện đại, màu sắc tươi sáng, ánh sáng lung linh, chi tiết sắc nét.',
    tooltip: 'Chọn phong cách này cho các câu chuyện trẻ trung, năng động.',
    locked: false,
    imageUrls: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80', // Anime figure
      'https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=600&q=80', // Street
      'https://images.unsplash.com/photo-1562863777-62a987c9df9f?auto=format&fit=crop&w=600&q=80', // Akihabara
      'https://images.unsplash.com/photo-1612413156673-983198083c27?auto=format&fit=crop&w=600&q=80', // Art style
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?auto=format&fit=crop&w=600&q=80'  // Aesthetic
    ],
    promptTemplate: `YÊU CẦU QUAN TRỌNG: Chỉ sử dụng hình ảnh tôi cung cấp để lấy thông tin về ngoại hình và trang phục của nhân vật. Toàn bộ bối cảnh, môi trường và hành động phải được tạo ra hoàn toàn dựa trên văn bản prompt sau đây. Không được sao chép hay tái sử dụng bối cảnh từ hình ảnh gốc

Hãy vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách: Anime Nhật Bản hiện đại (Modern Anime Style), 2D hoặc 2.5D.

Màu sắc: Tươi sáng, rực rỡ (vibrant), độ bão hòa cao. Ánh sáng lung linh, có hiệu ứng bloom, lens flare.

Kỹ thuật: Nét vẽ sắc sảo (clean lines), đổ bóng cel-shading hoặc soft-shading tinh tế.

Chi tiết nhân vật: [CHARACTER_STYLE] + Màu da: Trắng sáng, hồng hào đặc trưng của anime. + Phong cách trang phục: Vẽ chi tiết, có nếp gấp vải rõ ràng. + Phong cách vẽ mặt nhân vật: Mắt to, long lanh, biểu cảm phong phú, đặc trưng anime.

Bối cảnh của phân cảnh là [A]

HƯỚNG DẪN ĐẦU RA: Không viết bất kỳ văn bản, tiêu đề hay mô tả nào. Toàn bộ phản hồi của bạn phải chỉ là hình ảnh được tạo ra.`
  }
];

export const PRESET_PROMPT_SEGMENT = `Chia nhỏ kịch bản trên ra thành các dòng ngắn 7-15 chữ (lưu ý không cắt ngang nội dung đang nói cho phù hợp với số chữ, câu nào phải hết ý câu đó, lưu ý chỉ cắt ngắn không thêm không bớt bất kỳ chữ nào vào kịch bản mỗi đoạn viết ở một dòng, xuống hàng rồi đến phân đoạn tiếp theo, giữ nguyên ngôn ngữ của kịch bản không dịch sang ngôn ngữ khác nếu không có yêu cầu gì khác. ví dụ câu trả lời mẫu là:
"Ngày hôm nay chúng ta cùng nhau chào đón một vị khách mời
Người này vô cùng đặc biệt.
Có thể bạn đã thấy anh ta qua tivi, vì anh ta nổi tiếng.
Mỗi phân đoạn chia ngắn như vậy về sau nhằm mục đích tạo giọng nói và tạo ảnh minh họa vì vậy không được chia quá ngắn và không được cắt ngang ý đang triển khai"
Chỉ viết kịch bản, không thông báo, không trình bày, không chào hỏi, không nói gì thêm khác, chỉ chia nhỏ kịch bản, bắt đầu bằng phân đoạn đầu được chia nhỏ kết thúc là phân đoạn cuối`;

export const PRESET_PROMPT_CONTEXT = `”Phân tích kịch bản gốc đã được cung cấp trong cuộc trò chuyện.
1. Xác định ngôn ngữ của kịch bản gốc.
2. Nếu kịch bản gốc là tiếng Việt: Điền nội dung đã được phân cảnh vào "Cột 3: Phân cảnh tiếng Việt". Dịch các phân cảnh đó sang "Phân cảnh tiếng [Đức]" và điền vào Cột 2.
3. Nếu kịch bản gốc KHÔNG phải là tiếng Việt: Dịch các phân cảnh đó sang tiếng Việt và điền vào "Cột 3: Phân cảnh tiếng Việt". Đồng thời, điền nội dung gốc vào "Cột 2: Phân cảnh tiếng [Đức]" (nếu ngôn ngữ gốc khác với ngôn ngữ yêu cầu trong tên cột thì hãy dịch nó).
Sau khi hoàn thành Cột 2 và Cột 3, hãy tiếp tục tạo các cột còn lại của bảng theo hướng dẫn chi tiết dưới đây.
---
Hãy kẽ bảng trình bày Prompt ảnh minh hoạ chi tiết cho mỗi phân cảnh. Đảm bảo đủ số lượng vừa nói.
Prompt ảnh minh hoạ theo bố cục sau (đảm bảo tuân thủ bố cục này):
+ Bối cảnh ảnh diễn ra vào thời điểm nào (Ví dụ Nhật Bản 1889), ở nơi nào và vị trí nào trong nơi đó (Ví dụ: Ở sân một trường cấp 2), vào thời điểm nào (Ví dụ: vào giờ ra chơi).
+ Nhân vật: Trong khung cảnh có những ai? Họ đang ở vị trí nào, hành động của họ ra sao, biểu cảm  của nhân vật chính thế nào? Tùy trường hợp nhân vật phụ có thể là faceless hoặc chi tiết mặt. Nếu có chi tiết mặt thì biểu cảm của họ ra sao? Ở từng phân cảnh check xem ở phân cảnh trước và sau có cùng trang phục với bối cảnh đang viết hay không (cùng thời điểm, cùng vị trí, cùng buổi, chưa đổi qua cảnh khác,... là một vài trường hợp có thể cùng trang phục), nếu có thì phải mô tả trang phục một cách chi tiết đến mức không thể nào vẽ khác được trang phục, nếu scene trước đã có mô tả trang phục rồi thì trang sau phải viết y chang trang phục như scene trước. Trang phục phải phù hợp với bối cảnh và nội dung.
+ Góc nhìn thấy nhân vật qua ảnh: Nhân vật được nhìn ở góc nào? Điều gì cần thể hiện rõ ở góc này  (ví dụ: Góc sau vai của nhân vật chính cho thấy bóng lưng co rúm, góc flycam cho thấy toàn cảnh sân trường và hành động của mọi người và nhân vật đang ngồi co rúm một góc trong lớp, góc sau vai cận vào hành động tay đang làm thao tác đeo găng tay,...). 
+ Vị trí và hướng chụp ảnh: Khác với góc độ của nhân vật thì phần này mô tả vị trí và hướng đặt của camera? Ví dụ cùng một góc sau lưng nhân vật thì camera có thể cận sát phía dưới chân nhân vật chụp lên, hoặc flycam từ xa chụp xuống hoặc cảnh trung, góc nhìn sau vai của một nhân vật khác cho thấy nhân vật chính đang quay lưng về hướng họ,... 
Lưu ý ở 2 phân cảnh cạnh nhau thì không dùng cùng góc nhìn thấy nhân vật và vị trí, hướng chụp ảnh để tạo nên sự đa dạng cho các phân cảnh mô tả.
+ Các yếu tố khác: Nếu muốn bổ sung
+ Tóm tắt bố cục: Camera được đặt ở góc, gần camera nhất là người/vật gì, vị trí của người/vật gần nhất là ở đâu (trái, phải, trung tâm, 2 bên), hướng của người vật gần camera nhất (xéo, nghiêng, mặt gần chân xa,...), trung cảnh là gì (Ví dụ đường xá, sân trường), bối cảnh nằm trên trung cảnh có gì), hậu cảnh là gì (ví dụ: một ngôi nhà, một tòa lâu đài, dãy lớp học), nhân vật chính nếu có thì đang ở đâu trên toàn bộ khung cảnh đấy, từ nơi camera đến thì nhân vật chính (hoặc từng nhân vật phụ) đang hướng về góc nào, nhìn ở đâu (ví dụ: trực diện, nhìn từ dưới lên camera, ngồi trong quán cà phê, nhìn qua được sau ô cửa sổ, đang ngồi một góc nghiêng so với camera, đang nhìn mông lung ra đường (không nhìn camera)
Yêu cầu: Prompt viết bằng tiếng Anh, đặt tên prompt bằng tiếng việt (tên prompt là 1 dòng ngắn tóm tắt những gì xảy ra trong câu chuyện)
Output: Bảng trình bày gồm 5 cột: 
Cột 1: STT 
Cột 2: Phân cảnh tiếng [Đức]: Nguyên văn của phân đoạn này bằng ngôn ngữ thứ 2 ngoài tiếng Việt đã được viết ở bước trước, nếu không có yêu cầu gì thì mặc định là tiếng Đức. Còn nếu kịch bản chỉ được viết bằng tiếng Việt thôi thì viết cột 2 và cột 3 đều bằng tiếng việt và giống hệt nhau (coi như Double check)
Cột 3: Phân cảnh tiếng Việt
Cột 4: Tên Prompt
Cột 5: Prompt bối cảnh. 

[CHARACTER_GUIDANCE]

YÊU CẦU ĐỊNH DẠNG BẢNG:
- Toàn bộ câu trả lời của bạn BẮT BUỘC phải là một bảng Markdown. Không thêm bất kỳ văn bản, lời chào, hay giải thích nào trước hoặc sau bảng.
- Bảng phải có chính xác 5 cột như đã mô tả.
- Dòng tiêu đề phải được theo sau bởi một dòng phân cách (ví dụ: |---|---|---|---|---|).
- Mỗi hàng dữ liệu phải bắt đầu và kết thúc bằng ký tự "|".
- Nếu một ô không có dữ liệu, hãy để trống nhưng vẫn giữ các ký tự "|" để đảm bảo đủ 5 cột.

Định dạng Cột 1 (STT):
- **Số thứ tự BẮT BUỘC phải tăng dần nghiêm ngặt (1, 2, 3, 4, ...), mỗi hàng tăng một đơn vị.**
- **Cảnh có nhân vật chính:** Giữ nguyên số thứ tự tuần tự và thêm tên nhân vật đã được chuẩn hóa (không dấu, viết liền) vào trước số. Ví dụ: \`nhan2\`, \`[nhan+lam]3\`.
- **Cảnh không có nhân vật chính:** Chỉ sử dụng số thứ tự tuần tự. Ví dụ: \`1\`, \`4\`.
- **VÍ DỤ CHUỖI ĐÚNG:** Một chuỗi STT hợp lệ sẽ trông giống như sau: \`1\`, \`nhan2\`, \`[nhan+lam]3\`, \`4\`, \`thiendieu5\`.

Lưu ý 2: Do đây là prompt mô tả để AI vẽ lại nên sẽ không cần quan tâm đến tên nhân vật làm gì, tập trung vào mô tả vì khi tôi gửi prompt này cho AI sẽ gửi kèm ảnh nhân vật nếu có. Lưu ý 3: Một số chủ đề nhạy cảm có thể bị cấm tạo ảnh, vì vậy không sử dụng ngôn từ liên quan đến việc vi phạm các chính sách thay vào đó tập trung vào mô tả vị trí, hành động, biểu cảm nhé
Điều quan trọng nhắc lại 2 lần: Đảm bảo prompt ảnh minh họa đúng format và số hàng trong bảng đúng số lượng phân cảnh, không cắt xén, tôi muốn viết đầy đủ, không có chuyện 1,2,3... 220...227 nhé. HÃy viết hết sức có thể theo đúng số thứ tự cách nhau 1 đơn vị tuyệt đối không có chuyện nhảy cóc, nếu viết không đủ thì chia ra nhiều lần viết, mỗi lần viết hết số tokens trong khả năng của Model gemini tôi đang sử dụng, xong rồi hỏi tôi có muốn viết tiếp các phân cảnh tiếp theo không? chỉ cần bấm "ok" bạn sẽ tiếp tục viết tiếp và cố gắng viết lần sau độ dài lại gấp đôi lần trước, lưu ý 2 cột kịch bản rất quan trọng vì vậy luôn bám sát và tuyệt đối không thêm thắt kịch bản, không tự ý đổi ngôn ngữ. Còn nếu viết hết được thì ưu tiên viết hết đúng số lượng phân cảnh đã tách ra ở bước trên.”`;