
import React, { ChangeEvent, useState } from 'react';
import type { Style, TableRowData, Character } from '../types';
import { ResultsTable } from './ResultsTable';
import { FileDropzone } from './FileDropzone';
import { ResultRow } from './ResultRow';
import { CopyIcon } from './icons';

interface ResultsViewProps {
  selectedStyle: Style;
  tableData: TableRowData[];
  characters: Character[];
  defaultCharacterIndex: number | null;
  onBack: () => void;
  onFileProcessed: (file: File) => void;
  onDocUpload: (file: File) => void;
  onUpdateRow: (row: TableRowData) => void;
  onGenerateImage: (rowId: number) => void;
  onGenerateAllImages: () => void;
  onGenerateVideoPrompt: (rowId: number) => void;
  onGenerateAllVideoPrompts: () => void;
  onDownloadAll: () => void;
  onViewImage: (imageUrl: string, rowId: number) => void;
  onStartRemake: (row: TableRowData) => void;
  onOpenHistory: (row: TableRowData) => void;
  onSendToVideo: (rowId: number) => void;
}

const CONTEXT_PROMPT_FOR_COPY = `Hãy kẽ bảng trình bày Prompt ảnh minh hoạ chi tiết cho mỗi phân cảnh. Đảm bảo đủ số lượng vừa nói.
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
Cột 2: Phân cảnh tiếng [Customize]: Nguyên văn của phân đoạn này bằng ngôn ngữ thứ 2 ngoài tiếng Việt đã được viết ở bước trước, nếu không có yêu cầu gì thì mặc định là tiếng Customize. Còn nếu kịch bản chỉ được viết bằng tiếng Việt thôi thì viết cột 2 và cột 3 đều bằng tiếng việt và giống hệt nhau (coi như Double check)
Cột 3: Phân cảnh tiếng Việt
Cột 4: Tên Prompt
Cột 5: Prompt bối cảnh. 
Định dạng Cột 1 (STT):
- **Số thứ tự BẮT BUỘC phải tăng dần nghiêm ngặt (1, 2, 3, 4, ...), mỗi hàng tăng một đơn vị.**
- **Cảnh có nhân vật chính:** Giữ nguyên số thứ tự tuần tự và thêm tên nhân vật đã được chuẩn hóa (không dấu, viết liền) vào trước số. Ví dụ: \`nhan2\`, \`[nhan+lam]3\`.
- **Cảnh không có nhân vật chính:** Chỉ sử dụng số thứ tự tuần tự. Ví dụ: \`1\`, \`4\`.
- **VÍ DỤ CHUỖI ĐÚNG:** Một chuỗi STT hợp lệ sẽ trông giống như sau: \`1\`, \`nhan2\`, \`[nhan+lam]3\`, \`4\`, \`thiendieu5\`.
Lưu ý 2: Do đây là prompt mô tả để AI vẽ lại nên sẽ không cần quan tâm đến tên nhân vật làm gì, tập trung vào mô tả vì khi tôi gửi prompt này cho AI sẽ gửi kèm ảnh nhân vật nếu có. Lưu ý 3: Một số chủ đề nhạy cảm có thể bị cấm tạo ảnh, vì vậy không sử dụng ngôn từ liên quan đến việc vi phạm các chính sách thay vào đó tập trung vào mô tả vị trí, hành động, biểu cảm nhé
Điều quan trọng nhắc lại 2 lần: Đảm bảo prompt ảnh minh họa đúng format và số hàng trong bảng đúng số lượng phân cảnh, không cắt xén, tôi muốn viết đầy đủ, không có chuyện 1,2,3... 220...227 nhé. HÃy viết hết sức có thể theo đúng số thứ tự cách nhau 1 đơn vị tuyệt đối không có chuyện nhảy cóc, nếu viết không đủ thì chia ra nhiều lần viết, mỗi lần viết hết số tokens trong khả năng của Model gemini tôi đang sử dụng, xong rồi hỏi tôi có muốn viết tiếp các phân cảnh tiếp theo không? chỉ cần bấm "ok" bạn sẽ tiếp tục viết tiếp và cố gắng viết lần sau độ dài lại gấp đôi lần trước, lưu ý 2 cột kịch bản rất quan trọng vì vậy luôn bám sát và tuyệt đối không thêm thắt kịch bản, không tự ý đổi ngôn ngữ. Còn nếu viết hết được thì ưu tiên viết hết đúng số lượng phân cảnh đã tách ra ở bước trên.`;

export const ResultsView: React.FC<ResultsViewProps> = ({
  selectedStyle,
  tableData,
  characters,
  onBack,
  onFileProcessed,
  onDocUpload,
  onStartRemake,
  onOpenHistory,
  onGenerateAllImages,
  onGenerateAllVideoPrompts,
  onGenerateVideoPrompt,
  onDownloadAll,
  defaultCharacterIndex,
  onViewImage,
  ...rest
}) => {
  const [copyButtonText, setCopyButtonText] = useState('Prompt Mô Tả Bối Cảnh');
  
  const handleExcelInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileProcessed(file);
    }
    event.target.value = '';
  };

  const handleDocInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onDocUpload(file);
    }
    event.target.value = '';
  };

  const handleFileDrop = (files: File[]) => {
    if (files.length > 0) {
      onFileProcessed(files[0]);
    }
  };

  const handleCopyContextPrompt = () => {
    navigator.clipboard.writeText(CONTEXT_PROMPT_FOR_COPY).then(() => {
        setCopyButtonText('✓ Đã chép!');
        setTimeout(() => setCopyButtonText('Prompt Mô Tả Bối Cảnh'), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Không thể sao chép. Vui lòng thử lại.');
    });
  };

  return (
    <section className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Phong cách đã chọn: <span className="text-green-600 dark:text-green-300">{selectedStyle.title}</span>
        </h2>
        <div className="flex items-center gap-2">
            {tableData.length > 0 && (
                <>
                    <label htmlFor="replace-excel-uploader" className="cursor-pointer font-semibold py-2 px-4 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 dark:bg-[#0f3a29] dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900 transition-colors">
                        Tải kịch bản khác
                    </label>
                    <input type="file" id="replace-excel-uploader" className="hidden" accept=".xlsx, .xls" onChange={handleExcelInputChange} />
                </>
            )}
            <button onClick={onBack} className="font-semibold py-2 px-4 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 dark:bg-[#0f3a29] dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900 transition-colors">
                &larr; Quay lại chọn phong cách
            </button>
        </div>
      </div>

      {tableData.length === 0 ? (
        <>
        <FileDropzone
            onDrop={handleFileDrop}
            accept=".xlsx,.xls"
            className="text-center py-10 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg"
            dropMessage="Thả tệp Excel vào đây"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">Kéo và thả tệp Excel (.xlsx, .xls) của bạn vào đây, hoặc chọn tệp.</p>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Tệp chuẩn cần có 5 cột: STT, Ngôn ngữ khác, Phân cảnh tiếng Việt, Tên prompt, Prompt bối cảnh.</p>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <label htmlFor="excel-file-uploader" className="cursor-pointer inline-block font-semibold py-3 px-6 rounded-lg bg-green-500 text-white hover:bg-green-600 dark:bg-green-400 dark:text-[#051a11] dark:hover:bg-green-300 transition-colors">
                Chọn tệp Excel
            </label>
            <input type="file" id="excel-file-uploader" className="hidden" accept=".xlsx, .xls" onChange={handleExcelInputChange} />

            <span className="text-gray-500 dark:text-gray-400 font-semibold">HOẶC</span>

            <label htmlFor="doc-file-uploader" className="cursor-pointer inline-block font-semibold py-3 px-6 rounded-lg bg-green-500 text-white hover:bg-green-600 dark:bg-green-400 dark:text-[#051a11] dark:hover:bg-green-300 transition-colors">
                Tải kịch bản (Doc, Txt)
            </label>
            <input type="file" id="doc-file-uploader" className="hidden" accept=".txt,.docx" onChange={handleDocInputChange} />

            <button
                onClick={handleCopyContextPrompt}
                className="flex items-center gap-2 cursor-pointer font-semibold py-3 px-6 rounded-lg bg-green-500 text-white hover:bg-green-600 dark:bg-green-400 dark:text-[#051a11] dark:hover:bg-green-300 transition-colors"
              >
                <CopyIcon className="w-4 h-4" />
                {copyButtonText}
              </button>
          </div>
        </FileDropzone>
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2 max-w-3xl mx-auto">
            <p className="font-semibold">Nếu bạn không biết làm thế nào để có được bảng Format chuẩn X.Image, hãy thử một trong hai cách sau:</p>
            <p>
                <strong>Cách 1:</strong> Ấn nút "Prompt Mô Tả Bối Cảnh", dán vào Gemini kèm với kịch bản của bạn. Một bảng sẽ được trình bày. Chuyển bảng đó thành file Excel, tải về máy và upload lên đây.
            </p>
            <p>
                <strong>Cách 2 (Khuyên dùng):</strong> Tải file kịch bản (file .doc, .txt chỉ chứa kịch bản). Một cửa sổ chat sẽ hiện ra. Trong đó, chọn "Phân đoạn" để chia ngắn kịch bản, sau đó chọn "Mô tả bối cảnh" để tạo bảng. Cuối cùng, ấn vào nút "Trình bày kịch bản" để chuyển kết quả xuống bảng chính.
            </p>
        </div>
        </>
      ) : (
        <ResultsTable
          tableData={tableData}
          characters={characters}
          selectedStyle={selectedStyle}
          defaultCharacterIndex={defaultCharacterIndex}
          onStartRemake={onStartRemake}
          onOpenHistory={onOpenHistory}
          onGenerateAllImages={onGenerateAllImages}
          onGenerateAllVideoPrompts={onGenerateAllVideoPrompts}
          onGenerateVideoPrompt={onGenerateVideoPrompt}
          onDownloadAll={onDownloadAll}
          onViewImage={onViewImage}
          {...rest}
        />
      )}
    </section>
  );
};