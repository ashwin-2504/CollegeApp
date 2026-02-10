declare module "react-native-mlkit-ocr" {
  export interface OCRFrame {
    text: string;
    lines: OCRLine[];
    result: {
      text: string;
      blocks: OCRBlock[];
    };
  }

  export interface OCRLine {
    text: string;
    elements: OCRElement[];
    cornerPoints: Point[];
    frame: Rect;
  }

  export interface OCRElement {
    text: string;
    cornerPoints: Point[];
    frame: Rect;
  }

  export interface OCRBlock {
    text: string;
    lines: OCRLine[];
    cornerPoints: Point[];
    frame: Rect;
  }

  export interface Point {
    x: number;
    y: number;
  }

  export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  const TextRecognition: {
    recognize: (imageUri: string) => Promise<OCRBlock[]>;
  };

  export default TextRecognition;
}
