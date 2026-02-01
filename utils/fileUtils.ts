
import { ChangeEvent } from 'react';
// FIX: Import AdjustmentOptions to be used in getPromptAndPartsForRow
import type { ProjectData, ExcelRow, TableRowData, Style, Character, AdjustmentOptions } from './types';

// These are expected to be available globally from CDN scripts in index.html
declare const XLSX: any;
declare const JSZip: any;
declare const mammoth: any;

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target!.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

export const readTextFile = (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const filename = file.name.toLowerCase();
        if (filename.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target!.result as string);
            reader.onerror = reject;
            reader.readAsText(file, 'UTF-8');
        } else if (filename.endsWith('.docx')) {
            if (typeof mammoth === 'undefined') {
                return reject(new Error('Thư viện đọc file .docx (mammoth.js) chưa được tải.'));
            }
            try {
                const arrayBuffer = await readFileAsArrayBuffer(file);
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                resolve(result.value);
            } catch (error) {
                reject(new Error('Không thể đọc nội dung từ file .docx.'));
            }
        } else {
            reject(new Error('Định dạng file không được hỗ trợ. Vui lòng sử dụng .txt hoặc .docx.'));
        }
    });
};

export const readExcelFile = async (file: File): Promise<ExcelRow[]> => {
    if (!file) throw new Error('No file provided');

    try {
        const data = await readFileAsArrayBuffer(file);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    } catch (err) {
        console.error("Error reading Excel file:", err);
        throw err;
    }
};

export const readKeysFromExcel = async (file: File): Promise<string[]> => {
    if (!file) throw new Error('No file provided');
    try {
        const data = await readFileAsArrayBuffer(file);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // Extract keys from the first column, filtering out empty strings/headers
        return jsonData.map(row => String(row[0] || '').trim()).filter(key => key.length > 0);
    } catch (err) {
        console.error("Error reading keys from Excel file:", err);
        throw err;
    }
};

export const readJsonFile = (file: File): Promise<{ project: ProjectData; file: File } | null> => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return resolve(null);
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const project = JSON.parse(e.target!.result as string);
                resolve({ project, file });
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const saveJsonFile = (data: ProjectData, filename: string) => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const getExtensionFromDataUrl = (dataUrl: string): string => {
    const mimeType = dataUrl.match(/data:(image\/[^;]+);/);
    if (mimeType && mimeType[1]) {
        switch (mimeType[1]) {
            case 'image/jpeg':
                return '.jpg';
            case 'image/png':
                return '.png';
            default:
                const extension = mimeType[1].split('/')[1];
                return extension ? `.${extension}` : '.png';
        }
    }
    return '.png';
};

// FIX: This function was updated to use `selectedCharacterIndices` array instead of the deprecated `selectedCharacterIndex`.
// It now correctly handles multiple characters, "Random", and "None" selections.
export const getPromptForRow = (row: TableRowData, selectedStyle: Style, characters: Character[]): string => {
    if (!selectedStyle?.promptTemplate) return row.contextPrompt || "";

    const selectedCharIndices = row.selectedCharacterIndices;
    let basePrompt = '';
    const originalTemplate = selectedStyle.promptTemplate;

    if (selectedCharIndices.length > 0 && selectedCharIndices[0] >= 0) { // Character(s) selected
        let characterDetails = '';
        const characterNames: string[] = [];

        selectedCharIndices.forEach((charIndex) => {
            const character = characters[charIndex];
            if (!character || !character.name) return;
            
            characterNames.push(`"${character.name}"`);
            
            if (character.stylePrompt) {
                characterDetails += `+ Phong cách nhân vật "${character.name}": ${character.stylePrompt}\n`;
            }
        });
        
        let template = originalTemplate;
        if (characterNames.length > 0) {
             const multiCharacterInstruction = `**YÊU CẦU QUAN TRỌNG:** Vẽ lại các nhân vật sau: ${characterNames.join(', ')}. Bạn sẽ được cung cấp hình ảnh tham chiếu cho mỗi nhân vật này. Bắt buộc phải tuân thủ nghiêm ngặt ngoại hình và trang phục từ các hình ảnh tham chiếu tương ứng cho TỪNG nhân vật. Toàn bộ bối cảnh, môi trường và hành động phải được tạo ra hoàn toàn dựa trên văn bản prompt sau đây. Không được sao chép hay tái sử dụng bối cảnh từ hình ảnh gốc.

Hãy vẽ lại các nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách sau`;
            
            const introRegex = /^\*\*YÊU CẦU QUAN TRỌNG:[\s\S]*?Vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách sau/s;
            template = template.replace(introRegex, multiCharacterInstruction);
        }

        basePrompt = template.replace('[CHARACTER_STYLE]', characterDetails).replace('[A]', row.contextPrompt);

    } else if (selectedCharIndices.length === 1 && selectedCharIndices[0] === -2) { // Random Character
        const randomCharacterInstruction = `**YÊU CẦU QUAN TRỌNG: Sử dụng hình ảnh tôi cung cấp CHỈ để tham chiếu phong cách nghệ thuật (màu sắc, ánh sáng, kết cấu). KHÔNG được sao chép nhân vật trong hình ảnh tham chiếu. Thay vào đó, hãy TẠO MỘT NHÂN VẬT MỚI theo phong cách đó. Hãy đọc kỹ kịch bản và bối cảnh sau đây để xác định các đặc điểm ngoại hình phù hợp cho nhân vật (khoảng tuổi, giới tính, quốc gia, màu da, v.v.).**`;
        let template = originalTemplate;
        template = template.replace(
            /^\*\*YÊU CẦU QUAN TRỌNG:[\s\S]*?Vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách sau/s,
            randomCharacterInstruction
        );
        template = template.replace('[CHARACTER_STYLE]', '');
        basePrompt = template.replace('[A]', row.contextPrompt);
    } else { // None or No Selection (empty array)
        const nonCharacterInstruction = `\n\n**LƯU Ý:** Không cần tạo hình ảnh có nhân vật chính. Bối cảnh cần được vẽ theo phong cách nghệ thuật đã được định sẵn. Nếu trong bối cảnh có nhân vật phụ, các nhân vật này cũng cần tuân theo phong cách nghệ thuật chung.`;
        const refCharacterIndex = characters.findIndex(c => c && c.images.length > 0);
        let sceneTemplate;

        if (refCharacterIndex === -1) {
            sceneTemplate = originalTemplate.replace(/^\*\*YÊU CẦU QUAN TRỌNG:[\s\S]*?Vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách sau/s, 'Tạo một hình ảnh với phong cách nghệ thuật nhất quán như các ảnh phân cảnh trước đó.');
        } else {
            sceneTemplate = originalTemplate.replace(/^\*\*YÊU CẦU QUAN TRỌNG:[\s\S]*?Vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách sau/s, `**YÊU CẦU QUAN TRỌNG: Sử dụng hình ảnh tôi cung cấp CHỈ để tham chiếu phong cách nghệ thuật (màu sắc, ánh sáng, kết cấu). KHÔNG được vẽ nhân vật trong hình ảnh này vào bối cảnh. Toàn bộ bối cảnh, môi trường và hành động phải được tạo ra hoàn toàn dựa trên văn bản prompt sau đây.**`);
        }
        sceneTemplate = sceneTemplate.replace(/Chi tiết nhân vật:[\s\S]*?\+ Phong cách vẽ bối cảnh:/s, '+ Phong cách vẽ bối cảnh:');
        sceneTemplate = sceneTemplate.replace('[CHARACTER_STYLE]', '');
        basePrompt = sceneTemplate.replace('[A]', row.contextPrompt) + nonCharacterInstruction;
    }
    return basePrompt.trim();
};

// FIX: Add missing 'getPromptAndPartsForRow' function to support multimodal image generation.
export const getPromptAndPartsForRow = ({
    row,
    tableData,
    selectedStyle,
    characters,
    adjustments,
    // Add unused params to match call signature from App.tsx
    rowIndex,
    defaultCharacterIndex,
}: {
    row: TableRowData;
    rowIndex: number;
    tableData: TableRowData[];
    selectedStyle: Style;
    characters: Character[];
    defaultCharacterIndex: number | null;
    adjustments?: AdjustmentOptions;
}): { prompt: string; parts: any[] } => {
    let prompt = getPromptForRow(row, selectedStyle, characters);
    const parts: any[] = [];

    // Add character images for reference
    const selectedCharIndices = row.selectedCharacterIndices;
    if (selectedCharIndices.length > 0 && selectedCharIndices[0] >= 0) { // Character(s) selected
        selectedCharIndices.forEach((charIndex) => {
            const character = characters[charIndex];
            if (character && character.images.length > 0) {
                character.images.forEach((imgDataUrl) => {
                    const [header, base64Data] = imgDataUrl.split(',');
                    const mimeType = header.match(/data:(.*);base64/)?.[1] || 'image/png';
                    parts.push({
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType,
                        },
                    });
                });
            }
        });
    } else { // 'None' or 'Random' or no character selected, use a reference image for style
        const refCharacter = characters.find((c) => c && c.images.length > 0);
        if (refCharacter && refCharacter.images.length > 0) {
            const imgDataUrl = refCharacter.images[0]; // Use the first image of the first character with images
            const [header, base64Data] = imgDataUrl.split(',');
            const mimeType = header.match(/data:(.*);base64/)?.[1] || 'image/png';
            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            });
        }
    }

    // Apply adjustments from Remake Modal
    if (adjustments) {
        const ADJUSTMENT_OPTIONS = {
            RE_EVALUATE_LOGIC: 'Logic lại ảnh: Yêu cầu đọc lại "Nguyên văn phân cảnh" để hiểu rõ câu chuyện.',
            BYPASS_POLICY: 'Lách chính sách: Viết lại prompt để tránh vi phạm chính sách nội dung.',
            STYLE_CONSISTENCY: 'Đồng nhất phong cách vẽ: Yêu cầu phong cách nghệ thuật phải nhất quán với các ảnh đã tạo thành công trước đó.',
            CHARACTER_STYLE: 'Phong cách nhân vật: Yêu cầu tuân thủ nghiêm ngặt phong cách nhân vật đã mô tả.',
            CHARACTER_CONSISTENCY: 'Đồng nhất nhân vật: Yêu cầu xem lại ảnh gốc để đồng nhất nhân vật.',
            COSTUME_CONSISTENCY: 'Đồng nhất trang phục: Đồng nhất trang phục với các scene cùng bối cảnh.',
            CAMERA_POSITION: 'Trùng vị trí camera: Yêu cầu đổi một góc camera khác với ảnh đã tạo trước đó.',
            CHARACTER_ANGLE: 'Trùng góc nhân vật: Đổi góc độ nhìn nhân vật (ví dụ: trực diện sang nghiêng, sau lưng,...).',
            MATCH_ASPECT_RATIO: 'Sai tỉ lệ ảnh: Yêu cầu tỉ lệ khung ảnh phải nhất quán với ảnh gần nhất.',
        };

        let adjustmentText = "\n\n**ĐIỀU CHỈNH BỔ SUNG:** Dựa trên các phản hồi sau, hãy sửa đổi hình ảnh:";
        
        adjustments.options.forEach((opt) => {
            const description = ADJUSTMENT_OPTIONS[opt as keyof typeof ADJUSTMENT_OPTIONS];
            if (description) {
                adjustmentText += `\n- ${description}`;
            }
        });

        if (adjustments.manualPrompt) {
            adjustmentText += `\n- Yêu cầu thủ công: ${adjustments.manualPrompt}`;
            
            const sceneMatches = adjustments.manualPrompt.match(/\[scene_([\w.-]+)\]/g);
            if (sceneMatches) {
                adjustmentText += `\n- Các ảnh tham chiếu được cung cấp:`;
                sceneMatches.forEach((match) => {
                    const sceneId = match.match(/\[scene_([\w.-]+)\]/)?.[1];
                    if (sceneId) {
                        const referencedRow = tableData.find((r) => String(r.originalRow[0]) === sceneId);
                        if (referencedRow) {
                            const mainIndex = referencedRow.mainImageIndex > -1 ? referencedRow.mainImageIndex : (referencedRow.generatedImages.length > 0 ? referencedRow.generatedImages.length - 1 : -1);
                            const mainAsset = mainIndex !== -1 ? referencedRow.generatedImages[mainIndex] : null;

                            if (mainAsset && mainAsset.startsWith('data:image')) {
                                const [header, base64Data] = mainAsset.split(',');
                                const mimeType = header.match(/data:(.*);base64/)?.[1] || 'image/png';
                                parts.push({
                                    inlineData: {
                                        data: base64Data,
                                        mimeType: mimeType,
                                    },
                                });
                                adjustmentText += ` Ảnh từ scene ${sceneId}.`;
                            }
                        }
                    }
                });
            }
        }
        
        if (adjustments.options.length > 0 || adjustments.manualPrompt) {
            prompt += adjustmentText;
        }
    }

    parts.push({ text: prompt });

    return { prompt, parts };
};

const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const exportPromptsToTxt = (tableData: TableRowData[], filename: string) => {
    const prompts = tableData
        .filter(row => row.videoPrompt && row.videoPrompt.trim())
        .map(row => row.videoPrompt!.trim());

    if (prompts.length === 0) {
        alert('Không có prompt video nào được tạo để xuất.');
        return;
    }

    const content = prompts.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, filename);
};


const getValidRowsForJsonExport = (tableData: TableRowData[]) => {
  return tableData
    .map(row => {
      if (row.generatedImages.length > 0) {
        const mainIndex = row.mainImageIndex > -1 ? row.mainImageIndex : row.generatedImages.length - 1;
        const mainAsset = row.generatedImages[mainIndex];
        if (!mainAsset || !mainAsset.startsWith('data:image')) return null;

        return {
          asset: mainAsset,
          videoPrompt: row.videoPrompt || "",
        };
      }
      return null;
    })
    .filter((row): row is { asset: string; videoPrompt: string } => row !== null);
};

export const createFramesJsonWithBase64 = (tableData: TableRowData[], filename: string) => {
    const validRows = getValidRowsForJsonExport(tableData);

    if (validRows.length === 0) {
        alert('Không có ảnh nào được tạo để xuất ra JSON.');
        return;
    }

    const frames = validRows.map((row, index, arr) => {
        const extension = getExtensionFromDataUrl(row.asset);
        const startFrameName = `${index + 1}${extension}`;
        
        const nextRow = arr[index + 1];
        const endFrameName = nextRow ? `${index + 2}${getExtensionFromDataUrl(nextRow.asset)}` : "";

        return {
            startFrameName,
            endFrameName,
            base64Data: row.asset,
        };
    });

    const jsonData = { frames };
    const dataStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(blob, filename);
};


export const createFramesJsonWithImgAndPrompt = (tableData: TableRowData[], filename: string) => {
    const validRows = getValidRowsForJsonExport(tableData);

    if (validRows.length === 0) {
        alert('Không có ảnh nào được tạo để xuất ra JSON.');
        return;
    }

    const frames = validRows.map((row, index, arr) => {
        const extension = getExtensionFromDataUrl(row.asset);
        const startFrameName = `${index + 1}${extension}`;
        
        const nextRow = arr[index + 1];
        const endFrameName = nextRow ? `${index + 2}${getExtensionFromDataUrl(nextRow.asset)}` : "";

        return {
            startFrameName,
            endFrameName,
            prompt: row.videoPrompt,
            base64Data: row.asset,
        };
    });

    const jsonData = { frames };
    const dataStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(blob, filename);
};


export const createProjectAssetsZip = (tableData: TableRowData[], filename: string) => {
    const zip = new JSZip();
    let assetCount = 0;

    tableData.forEach(row => {
        if (row.generatedImages.length > 0) {
            const mainIndex = row.mainImageIndex ?? row.generatedImages.length - 1;
            const mainAsset = row.generatedImages[mainIndex];
            if (!mainAsset) return;

            const [header, base64Data] = mainAsset.split(',');
            
            let extension = '.png'; // Default
            if (header.includes('image/jpeg')) extension = '.jpeg';
            if (header.includes('video/mp4')) extension = '.mp4';
            
            const stt = String(row.originalRow[0] || `row_${row.id}`);
            const assetName = `${stt}${extension}`;
            zip.file(assetName, base64Data, { base64: true });
            assetCount++;
        }
    });

    if (assetCount === 0) {
        alert('No generated assets to download.');
        return;
    }

    zip.generateAsync({ type: 'blob' }).then(content => {
        downloadFile(content, filename);
    });
};

export const createRowAssetsZip = (row: TableRowData, filename: string) => {
    const zip = new JSZip();
    
    if (row.generatedImages.length === 0) {
        alert('No assets to download for this row.');
        return;
    }
    
    row.generatedImages.forEach((asset, index) => {
        const [header, base64Data] = asset.split(',');
        let extension = '.png';
        if (header.includes('image/jpeg')) extension = '.jpeg';
        if (header.includes('video/mp4')) extension = '.mp4';
        
        const assetName = `Asset_${row.id}_v${index + 1}${extension}`;
        zip.file(assetName, base64Data, { base64: true });
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
        downloadFile(content, filename);
    });
};

export const parseMarkdownTables = (text: string): string[][] => {
    const allRows: string[][] = [];
    const lines = text.split('\n');
    let inTable = false;

    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // A separator line marks the start of a table's body content. It must contain '---' and pipes.
        // This also handles separators with alignment colons, e.g., |:---|:--|
        const isSeparator = trimmedLine.startsWith('|') && /\|.*---.*\|/.test(trimmedLine);
        
        if (isSeparator) {
            inTable = true;
            continue; // Skip the separator line, we only want data rows.
        }

        if (inTable) {
            // Check if the line looks like a table data row.
            if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
                const cells = trimmedLine
                    .slice(1, -1) // Remove leading/trailing pipes
                    .split('|')
                    .map(cell => cell.trim());
                
                // A valid data row should not be another separator line.
                // We also check that it has some content.
                const isAnotherSeparator = cells.every(c => /^-+:?-+$/.test(c));
                if (!isAnotherSeparator && cells.some(c => c.length > 0)) {
                    allRows.push(cells);
                }
            } else {
                // Any non-pipe-enclosed line ends the current table parsing.
                // This allows capturing multiple tables from a single text block.
                inTable = false;
            }
        }
    }
    return allRows;
};
