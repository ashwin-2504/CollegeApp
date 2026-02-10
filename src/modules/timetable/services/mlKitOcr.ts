interface OcrModule {
  recognize: (imagePath: string) => Promise<{ text?: string }>;
}

export async function runOnDeviceOcrWithMlKit(imageUri: string): Promise<string> {
  const moduleRef = getMlKitModule();

  if (!moduleRef) {
    throw new Error(
      'ML Kit OCR module is not installed. Add @react-native-ml-kit/text-recognition to enable OCR.',
    );
  }

  const result = await moduleRef.recognize(imageUri);
  return result.text?.trim() ?? '';
}

function getMlKitModule(): OcrModule | null {
  try {
    // Optional native dependency.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loaded = require('@react-native-ml-kit/text-recognition') as OcrModule;
    return loaded;
  } catch {
    return null;
  }
}
