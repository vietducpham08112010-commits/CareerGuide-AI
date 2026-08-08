import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';

function oklchToRgbStr(oklchInner: string): string {
  try {
    const raw = oklchInner.trim();
    const slashParts = raw.split('/');
    const colorStr = slashParts[0].trim();
    const colorParts = colorStr.replace(/,/g, ' ').split(/\s+/).filter(Boolean);

    if (colorParts.length < 1) return 'rgb(0, 0, 0)';

    let l = 0;
    if (colorParts[0] !== 'none') {
      l = parseFloat(colorParts[0]);
      if (colorParts[0].endsWith('%')) l /= 100;
    }

    let c = 0;
    if (colorParts[1] && colorParts[1] !== 'none') {
      c = parseFloat(colorParts[1]);
      if (colorParts[1].endsWith('%')) c /= 100;
    }

    let h = 0;
    if (colorParts[2] && colorParts[2] !== 'none') {
      const hStr = colorParts[2].toLowerCase();
      if (hStr.endsWith('deg')) h = parseFloat(hStr);
      else if (hStr.endsWith('rad')) h = (parseFloat(hStr) * 180) / Math.PI;
      else if (hStr.endsWith('turn')) h = parseFloat(hStr) * 360;
      else h = parseFloat(hStr);
    }

    if (isNaN(l)) l = 0;
    if (isNaN(c)) c = 0;
    if (isNaN(h)) h = 0;

    let alpha = 1;
    if (slashParts[1]) {
      const aStr = slashParts[1].trim();
      if (aStr !== 'none') {
        alpha = parseFloat(aStr);
        if (aStr.endsWith('%')) alpha /= 100;
      }
    } else if (colorParts[3] && colorParts[3] !== 'none') {
      const aStr = colorParts[3].trim();
      alpha = parseFloat(aStr);
      if (aStr.endsWith('%')) alpha /= 100;
    }
    if (isNaN(alpha)) alpha = 1;

    const hRad = (h * Math.PI) / 180;
    const aLab = c * Math.cos(hRad);
    const bLab = c * Math.sin(hRad);

    const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
    const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
    const s_ = l - 0.0894841775 * aLab - 1.2914855480 * bLab;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    const toSrgb = (val: number) => {
      if (val <= 0) return 0;
      if (val >= 1) return 255;
      const clamped = val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
      return Math.min(255, Math.max(0, Math.round(clamped * 255)));
    };

    const r = toSrgb(rLin);
    const g = toSrgb(gLin);
    const b = toSrgb(bLin);

    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${b}, ${parseFloat(alpha.toFixed(3))})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  } catch (err) {
    return 'rgb(0, 0, 0)';
  }
}

function oklabToRgbStr(oklabInner: string): string {
  try {
    const raw = oklabInner.trim();
    const slashParts = raw.split('/');
    const colorStr = slashParts[0].trim();
    const colorParts = colorStr.replace(/,/g, ' ').split(/\s+/).filter(Boolean);

    if (colorParts.length < 1) return 'rgb(0, 0, 0)';

    let l = parseFloat(colorParts[0]);
    if (colorParts[0].endsWith('%')) l /= 100;

    let aLab = parseFloat(colorParts[1] || '0');
    if (colorParts[1] && colorParts[1].endsWith('%')) aLab /= 100;

    let bLab = parseFloat(colorParts[2] || '0');
    if (colorParts[2] && colorParts[2].endsWith('%')) bLab /= 100;

    if (isNaN(l)) l = 0;
    if (isNaN(aLab)) aLab = 0;
    if (isNaN(bLab)) bLab = 0;

    let alpha = 1;
    if (slashParts[1]) {
      const aStr = slashParts[1].trim();
      if (aStr !== 'none') {
        alpha = parseFloat(aStr);
        if (aStr.endsWith('%')) alpha /= 100;
      }
    } else if (colorParts[3] && colorParts[3] !== 'none') {
      const aStr = colorParts[3].trim();
      alpha = parseFloat(aStr);
      if (aStr.endsWith('%')) alpha /= 100;
    }
    if (isNaN(alpha)) alpha = 1;

    const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
    const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
    const s_ = l - 0.0894841775 * aLab - 1.2914855480 * bLab;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    const toSrgb = (val: number) => {
      if (val <= 0) return 0;
      if (val >= 1) return 255;
      const clamped = val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
      return Math.min(255, Math.max(0, Math.round(clamped * 255)));
    };

    const r = toSrgb(rLin);
    const g = toSrgb(gLin);
    const b = toSrgb(bLin);

    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${b}, ${parseFloat(alpha.toFixed(3))})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  } catch (err) {
    return 'rgb(0, 0, 0)';
  }
}

export function replaceModernColorsInCss(cssText: string): string {
  if (!cssText || typeof cssText !== 'string') return cssText;

  let result = cssText;

  if (result.includes('oklch')) {
    result = result.replace(/oklch\(([^)]+)\)/gi, (_match, p1) => oklchToRgbStr(p1));
  }

  if (result.includes('oklab')) {
    result = result.replace(/oklab\(([^)]+)\)/gi, (_match, p1) => oklabToRgbStr(p1));
  }

  if (result.includes('lab(')) {
    result = result.replace(/lab\(([^)]+)\)/gi, () => 'rgb(128, 128, 128)');
  }

  if (result.includes('lch(')) {
    result = result.replace(/lch\(([^)]+)\)/gi, () => 'rgb(128, 128, 128)');
  }

  if (result.includes('color(')) {
    result = result.replace(/color\([^)]+\)/gi, () => 'rgb(128, 128, 128)');
  }

  return result;
}

export const cleanClonedDocumentForExport = (clonedDoc: Document) => {
  // 1. Process all <style> elements
  try {
    const styleEls = clonedDoc.querySelectorAll('style');
    styleEls.forEach((styleEl) => {
      if (styleEl.textContent) {
        styleEl.textContent = replaceModernColorsInCss(styleEl.textContent);
      }
    });
  } catch (e) {
    console.warn('Error cleaning style elements:', e);
  }

  // 2. Process all <link rel="stylesheet"> elements
  try {
    const linkEls = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
    linkEls.forEach((linkEl) => {
      try {
        const sheet = (linkEl as HTMLLinkElement).sheet;
        if (sheet && sheet.cssRules) {
          let cssText = '';
          for (let i = 0; i < sheet.cssRules.length; i++) {
            cssText += sheet.cssRules[i].cssText + '\n';
          }
          const newStyle = clonedDoc.createElement('style');
          newStyle.textContent = replaceModernColorsInCss(cssText);
          clonedDoc.head.appendChild(newStyle);
          linkEl.remove();
        }
      } catch (err) {
        // Ignore cross-origin sheet errors
      }
    });
  } catch (e) {
    console.warn('Error processing link stylesheets:', e);
  }

  // 3. Clean inline style attributes
  try {
    const allEls = clonedDoc.querySelectorAll('*');
    allEls.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.getAttribute) {
        const styleAttr = htmlEl.getAttribute('style');
        if (styleAttr) {
          htmlEl.setAttribute('style', replaceModernColorsInCss(styleAttr));
        }
      }
      if (htmlEl.style && htmlEl.style.cssText) {
        htmlEl.style.cssText = replaceModernColorsInCss(htmlEl.style.cssText);
      }
    });
  } catch (e) {
    console.warn('Error cleaning element styles:', e);
  }

  // 4. Proxy getComputedStyle on defaultView
  try {
    if (clonedDoc.defaultView) {
      const origGetComputedStyle = clonedDoc.defaultView.getComputedStyle;
      clonedDoc.defaultView.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
        const style = origGetComputedStyle.call(this, elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            const val = Reflect.get(target, prop);
            if (typeof val === 'string') {
              return replaceModernColorsInCss(val);
            }
            if (typeof val === 'function') {
              if (prop === 'getPropertyValue') {
                return (property: string) => {
                  const res = target.getPropertyValue(property);
                  if (typeof res === 'string') {
                    return replaceModernColorsInCss(res);
                  }
                  return res;
                };
              }
              return val.bind(target);
            }
            return val;
          },
        });
      };
    }
  } catch (e) {
    console.warn('Error setting getComputedStyle proxy:', e);
  }
};

export const captureElementToCanvasDataUrl = async (
  element: HTMLElement,
  bgColor: string = '#ffffff'
): Promise<string> => {
  const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSU5ErkJggg==';

  // Attempt 1: html-to-image
  try {
    return await htmlToImage.toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: bgColor,
      skipFonts: true,
      cacheBust: true,
      imagePlaceholder: transparentPixel,
    });
  } catch (err) {
    console.warn('htmlToImage failed, attempting html2canvas with color sanitizer fallback:', err);
  }

  // Attempt 2: html2canvas with modern color sanitizer onclone
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: bgColor,
    logging: false,
    onclone: (clonedDoc) => {
      cleanClonedDocumentForExport(clonedDoc);
    },
  });

  return canvas.toDataURL('image/png');
};
