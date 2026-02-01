

import { Modality } from "@google/genai";

export interface Style {
  title: string;
  description: string;
  tooltip: string;
  locked: boolean;
  promptTemplate?: string;
  imageUrls?: string[];
}

export interface Character {
  name:string;
  // Store images as base64 data URLs
  images: string[];
  stylePrompt: string;
}

// Represents a row from the processed Excel file
// Index 0: STT
// Index 1: Phân cảnh tiếng [Đức]
// Index 2: Phân cảnh tiếng Việt
// Index 3: Tên prompt
// Index 4: Prompt bối cảnh
export type ExcelRow = (string | number)[];

export interface TableRowData {
  id: number; // Use STT or index as a unique ID
  originalRow: ExcelRow;
  contextPrompt: string;
  selectedCharacterIndices: number[];
  generatedImages: string[]; // Store a history of generated images/videos (as base64 data URLs)
  mainImageIndex: number; // Index of the main image/video in the generatedImages array
  isGenerating: boolean;
  error: string | null;
  lastUsedPrompt?: string; // The exact prompt used for the last generation
  videoPrompt?: string;
  isGeneratingPrompt?: boolean;
}

export interface ProjectData {
  projectName: string;
  selectedStylePrompt: string;
  tableData: TableRowData[];
  characters: Character[];
  videoPromptNote?: string;
}

export interface AdjustmentOptions {
  options: string[];
  manualPrompt: string;
}

export type MappedColumn = 'stt' | 'otherLang' | 'vietnamese' | 'promptName' | 'contextPrompt';
export type ColumnMapping = { [key in MappedColumn]?: number };

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}