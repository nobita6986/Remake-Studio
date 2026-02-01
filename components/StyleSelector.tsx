import React, { useState, useEffect } from 'react';
import type { Style } from '../types';
import { STYLES } from '../constants';
import { CopyIcon } from './icons';

const GUIDE_PROMPT_TEMPLATE = `Nếu tôi gửi kịch bản thì dừa trên kịch bản hãy viết 1 prompt mô tả phong cách vẽ ảnh phù hợp với nội dung
Nếu tôi gửi 1 ảnh thì đấy là ảnh tôi muốn sao chép phong cách, hãy phân tích ảnh và viết prompt mô tả phong cách vẽ ảnh đấy
Để đảm bải prompt mô tả phong cách viết ra đủ chi tiết, bắt buộc tuân theo cú pháp sau:
(lưu ý những phần đề trong dấu * là phần bất biến, bắt buộc giữ lại chính xác 100% nguyên văn). Phần trong [] là hướng dẫn fill thông tin vào 

*YÊU CẦU QUAN TRỌNG: Chỉ sử dụng hình ảnh tôi cung cấp để lấy thông tin về ngoại hình và trang phục của nhân vật. Toàn bộ bối cảnh, môi trường và hành động phải được tạo ra hoàn toàn dựa trên văn bản prompt sau đây. Không được sao chép hay tái sử dụng bối cảnh từ hình ảnh gốc" bắt buộc có trong mọi prompt

Hãy vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách:* [3D hay 2D, vẽ đơn giản, tả siêu thực hay phương thức nào khác, màu sắc sử dụng, cách phân bổ ánh sáng, các kỹ thuật điện ảnh thường áp dụng, mood của ảnh, ảnh dành cho đối tượng nào, mang lại cảm giác gì, nét vẽ  (trong trường hợp ảnh vẽ) cần được mô rả chi tiết]

*Chi tiết nhân vật: [CHARACTER_STYLE]*
*+ Màu da/màu lông (đối với động vật):* [cách vẽ làn da chi tiết đến mức nào, màu sắc, mang lại cảm giác gì, màu da thể hiện điều gì]
*+ Phong cách trang phục:* [Cách vẽ trang phục, mức độ chi tiết của trang phục, gam màu, tông màu]. *Nếu có yêu cầu khác ở phân cảnh thì phải check lại scene trước xem những scene nào cùng khung cảnh phải đồng nhất trang phục với các scene đó. Ví dụ cũng buổi chiều tại trường học, chỉ đổi góc độ quay nhân vật thì vẫn là trang phục đấy, một cảnh khác nhân vật đã đi nơi khác vào thời điểm khác thì cần phải check lại kịch bản để lựa chọn trang phục phù hợp.*
*+ Phong cách vẽ mặt nhân vật:* [Phong cách vẽ, phong thái biểu cảm, mức độ biểu cảm, mức độ chi tiết các bộ phận trên mặt, phụ kiện đi kèm để nhận diện (ví dụ mắt kính, cài tóc,...), cách vẽ các chi tiết trên mặt đặc biệt là mắt mũi miệng]
*+ Các nhân vật khác nếu có sẽ với phong cách:* [Mô tả phong cách các nhân vật phụ nếu có].
*+ Tỉ lệ kích thước cơ thể (Tất cả nhân vật):* [Ví dụ thường dùng nhất là tỷ lệ hợp lý, không quá tập trung vào phần đầu mà làm cho đầu to mình nhỏ]
*+ Phong cách vẽ bối cảnh:* [Phong cách vẽ chung, chi tiết các công trình, nhà cửa vẽ thế nào, xe cộ vẽ thế nào, cây cối vẽ thế nào, màu sắc của bối cảnh, cách đánh sáng và các kỹ thuật điện ảnh thường dùng trong minh hoạ bối cảnh]

*Bối cảnh của phân cảnh là [A]

HƯỚNG DẪN ĐẦU RA: Không viết bất kỳ văn bản, tiêu đề hay mô tả nào. Toàn bộ phản hồi của bạn phải chỉ là hình ảnh được tạo ra.*`;

const EXAMPLE_PROMPT = `YÊU CẦU QUAN TRỌNG: Chỉ sử dụng hình ảnh tôi cung cấp để lấy thông tin về ngoại hình và trang phục của nhân vật. Toàn bộ bối cảnh, môi trường và hành động phải được tạo ra hoàn toàn dựa trên văn bản prompt sau đây. Không được sao chép hay tái sử dụng bối cảnh từ hình ảnh gốc" bắt buộc có trong mọi prompt

Hãy lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách: 3D thực tế, với phong cách tối giản và gam màu lạnh, u tối, tập trung vào việc tạo cảm giác u buồn và cô lập.

Chi tiết nhân vật: [CHARACTER_STYLE]
+ Màu da: nhợt nhạt, hơi xám hoặc xanh tái, thể hiện sự thiếu sức sống, mệt mỏi.
+ Phong cách trang phục: Trang phục đơn giản, giữ như nguyên bản như ảnh nhân vật tôi gửi nhưng chi tiết chân thực. Màu sắc trang phục chủ yếu là các tông màu đất, xám, xanh đậm, đen. Nếu có yêu cầu khác ở phân cảnh thì phải check lại scene trước xem những scene nào cùng khung cảnh phải đồng nhất trang phục với các scene đó. Ví dụ cũng buổi chiều tại trường học, chỉ đổi góc độ quay nhân vật thì vẫn là trang phục đấy, một cảnh khác nhân vật đã đi nơi khác vào thời điểm khác thì cần phải check lại kịch bản để lựa chọn trang phục phù hợp.
+ Phong cách vẽ mặt nhân vật: Siêu thật, khuôn mặt biểu cảm, tập trung vào đôi mắt trống rỗng, vô hồn, thể hiện sự [rùng rợn, ám ảnh đi sâu vào trong những nỗi sợ thuần khiết nhất của con người giống phong cách uncanny valley]. Các đường nét trên khuôn mặt sắc sảo, để tăng thêm vẻ u uất.
+ Các nhân vật khác nếu có sẽ với phong cách polygonol faceless, màu sắc cũng u ám, lạnh tối.
+ Tỉ lệ kích thước cơ thể (Tất cả nhân vật): Hợp lý, không quá tập trung vào phần đầu mà làm cho đầu to mình nhỏ

+ Phong cách vẽ bối cảnh: Bối cảnh siêu thực và đầy áp lực, gợi cảm giác tù túng, khắc nghiệt. Các công trình kiến trúc có kiến trúc thô sơ, màu xám xịt, không có hoa văn trang trí. Cây cối trơ trụi hoặc bị bao phủ bởi màu sắc ảm đạm. Khung cảnh thường mờ ảo. Màu sắc của bối cảnh chủ yếu là tông màu tối, lạnh, như xám, xanh đậm, nâu đất, với những điểm nhấn màu đỏ hoặc cam cháy nhỏ để tạo sự tương phản và tăng tính bi kịch. 

Bối cảnh của phân cảnh là [A]

HƯỚN DẪN ĐẦU RA: Không viết bất kỳ văn bản, tiêu đề hay mô tả nào. Toàn bộ phản hồi của bạn phải chỉ là hình ảnh được tạo ra.`;


interface StyleSelectorProps {
  onSelectStyle: (style: Style) => void;
}

const StyleCard: React.FC<{ style: Style; onSelect: () => void; }> = ({ style, onSelect }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hasMultipleImages = style.imageUrls && style.imageUrls.length > 1;

    useEffect(() => {
        if (!hasMultipleImages) return;

        const intervalId = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % style.imageUrls!.length);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [hasMultipleImages, style.imageUrls]);

    return (
        <button
            onClick={onSelect}
            className="w-full text-left rounded-lg overflow-hidden border-2 border-transparent hover:border-green-400 bg-gray-50 dark:bg-[#020a06] hover:bg-green-50 dark:hover:bg-[#0f3a29] transition-all duration-300 group shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-gray-200 dark:bg-black/20">
                {style.imageUrls && style.imageUrls.length > 0 ? (
                    style.imageUrls.map((url, index) => (
                         <img
                            key={url + index}
                            src={url}
                            alt={`${style.title} preview ${index + 1}`}
                            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                         />
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500">No Image</span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <h4 className="font-bold text-green-700 dark:text-green-300 group-hover:text-green-600 dark:group-hover:text-green-200">{style.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{style.description}</p>
            </div>
        </button>
    );
};


export const StyleSelector: React.FC<StyleSelectorProps> = ({ onSelectStyle }) => {
  const [prompt, setPrompt] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy Prompt Hướng dẫn');

  const prebuiltStyles = STYLES.filter(s => !s.locked);

  const handleUsePrebuiltStyle = (style: Style) => {
    if (style.promptTemplate) {
      setPrompt(style.promptTemplate);
    }
  };

  const handleConfirm = () => {
    if (!prompt.trim()) {
      alert('Vui lòng nhập prompt phong cách hoặc chọn một phong cách có sẵn.');
      return;
    }
    const newStyle: Style = {
      title: 'Phong cách tùy chỉnh',
      description: 'Phong cách do người dùng định nghĩa.',
      tooltip: '',
      locked: false,
      promptTemplate: prompt,
    };
    onSelectStyle(newStyle);
  };

  const handleCopyGuidePrompt = () => {
    navigator.clipboard.writeText(GUIDE_PROMPT_TEMPLATE).then(() => {
        setCopyButtonText('Đã chép!');
        setTimeout(() => setCopyButtonText('Copy Prompt Hướng dẫn'), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Không thể sao chép. Vui lòng thử lại.');
    });
  };

  return (
    <section className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Định nghĩa Phong cách Vẽ</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Bắt đầu bằng cách chọn một phong cách có sẵn hoặc tự định nghĩa phong cách của riêng bạn.</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Phong cách có sẵn</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {prebuiltStyles.map((style) => (
                <StyleCard 
                    key={style.title}
                    style={style}
                    onSelect={() => handleUsePrebuiltStyle(style)}
                />
            ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center">
            <span className="bg-white dark:bg-[#0b2b1e] px-2 text-sm text-gray-500 dark:text-gray-400">Hoặc</span>
        </div>
      </div>


      <div>
        <label htmlFor="custom-style-prompt" className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 block">Nhập thủ công</label>
        <textarea
          id="custom-style-prompt"
          rows={10}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Dán prompt phong cách của bạn vào đây..."
          className="bg-gray-50 dark:bg-[#020a06] border border-gray-300 dark:border-[#1f4d3a] text-gray-900 dark:text-gray-200 p-3 rounded-md w-full focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
        />
      </div>

      <div className="text-center">
        <button
          onClick={handleConfirm}
          className="w-full max-w-xs font-semibold py-3 px-6 rounded-lg bg-green-500 text-white hover:bg-green-600 dark:bg-green-400 dark:text-[#051a11] dark:hover:bg-green-300 transition-colors transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!prompt.trim()}
        >
          Áp dụng và Tiếp tục
        </button>
      </div>

       {/* New Guide Section */}
       <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Hướng dẫn lấy Phong cách chuẩn</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. Copy prompt hướng dẫn dưới đây cùng với kịch bản của bạn hoặc một tấm ảnh mẫu.</p>
            <p>2. Gửi cho Gemini hoặc ChatGPT để tạo ra prompt mô tả phong cách.</p>
            <p>3. Dán prompt mô tả phong cách bạn nhận được vào ô "Nhập thủ công" ở trên. Prompt hợp lệ sẽ bắt đầu bằng <strong>"YÊU CẦU QUAN TRỌNG..."</strong> và kết thúc bằng <strong>"...phải chỉ là hình ảnh được tạo ra."</strong></p>
        </div>
        <div className="mt-4">
            <button
                onClick={handleCopyGuidePrompt}
                className="flex items-center gap-2 font-semibold py-2 px-4 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-[#0f3a29] dark:text-green-300 dark:hover:bg-green-900 border border-gray-300 dark:border-green-700 transition-colors"
            >
                <CopyIcon className="w-4 h-4" />
                {copyButtonText}
            </button>
        </div>
        <div className="mt-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Ví dụ về Prompt mô tả phong cách chuẩn:</h4>
            <pre className="bg-gray-100 dark:bg-black/20 p-4 rounded-lg text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                <code>
                    {EXAMPLE_PROMPT}
                </code>
            </pre>
        </div>
    </div>
    </section>
  );
};