export function renderSvgToCanvas(
  svgContent: string,
  size: number,
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new Image();

    const svgBlob = new Blob([svgContent], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Draw the SVG scaled to fit the canvas
      ctx.drawImage(img, 0, 0, size, size);

      // Clean up blob URL
      URL.revokeObjectURL(url);

      resolve(canvas);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG image"));
    };

    img.src = url;
  });
}

export async function svgToPngDataUrl(
  svgContent: string,
  size: number,
): Promise<string> {
  const canvas = await renderSvgToCanvas(svgContent, size);
  return canvas.toDataURL("image/png");
}
