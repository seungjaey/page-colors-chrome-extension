export type ExtractAttributeName = "COLOR" | "BG_COLOR" | "BORDER_COLOR" | "OUTLINE_COLOR";

export const ExtractAttributeNames: Record<ExtractAttributeName, ExtractAttributeName> = {
  COLOR: "COLOR",
  BG_COLOR: "BG_COLOR",
  BORDER_COLOR: "BORDER_COLOR",
  OUTLINE_COLOR: "OUTLINE_COLOR"
};

export type ExtractAttributeData = {
  label: string;
  attr: string;
};

export const EXTRACT_ATTRIBUTES_ORDER: ExtractAttributeName[] = ['COLOR', 'BG_COLOR', 'BORDER_COLOR', 'OUTLINE_COLOR'];

export const EXTRACT_ATTRIBUTES: Record<ExtractAttributeName, ExtractAttributeData> = {
  COLOR: {
    label: '글자 색상',
    attr: 'color'
  },
  BG_COLOR: {
    label: '배경 색상',
    attr: 'background-color'
  },
  // NOTE: Multi-Dimension : rgb(255, 0, 0) OR rgb(255, 0, 0) rgb(255, 0, 0) rgb(255, 0, 0) rgb(0, 128, 0)
  BORDER_COLOR: {
    label: '테두리 색상',
    attr: 'border-color'
  },
  OUTLINE_COLOR: {
    label: '바깥 테두리 색상',
    attr: 'outline-color'
  }
};