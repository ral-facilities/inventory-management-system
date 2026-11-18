import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
// Inlined as a data URL so the icon still renders once the SVG is serialised for download, and
// regardless of where the plugin is hosted
import iconSrc from '../../public/logo192.png?inline';

const PADDING = 16;
const QR_SIZE = 160;
const QR_MARGIN_MODULES = 2;
const ICON_SIZE = 35;
const TEXT_GAP = 12;
const LINE_HEIGHT = 20;
const FONT_SIZE = 14;
const CHAR_WIDTH_RATIO = 0.6;
const MAX_LINE_CHARS = 38;
const FONT_FAMILY = 'Arial, Helvetica, sans-serif';

export interface QRCodeLabelProps {
  value: string;
  lines: {
    label: string;
    value: string;
    rendered: boolean;
  }[];
  showIcon: boolean;
  layout: 'vertical' | 'horizontal';
}

const truncate = (text: string, maxLength: number): string =>
  text.length <= maxLength
    ? text
    : `${text.slice(0, Math.max(0, maxLength - 1))}…`;

/**
 * A printable label of a QR code with lines of text beneath it, rendered as a single SVG so the
 * preview in the dialog is exactly what gets downloaded.
 */
const QRCodeLabel = React.forwardRef<SVGSVGElement, QRCodeLabelProps>(
  function QRCodeLabel(props, ref) {
    const { value, lines, showIcon, layout } = props;

    const renderedLines = lines.filter((line) => line.rendered);
    const renderedLineHeight = renderedLines.length * LINE_HEIGHT;
    const width =
      layout === 'vertical'
        ? 320
        : PADDING * 2 +
          QR_SIZE +
          Math.ceil(Math.max(
            0,
            ...renderedLines.map(
              (line) => `${line.label}: ${line.value}`.length
            )
          ) * FONT_SIZE * CHAR_WIDTH_RATIO);
    const height =
      layout === 'vertical'
        ? PADDING * 2 +
          QR_SIZE +
          (renderedLines.length === 0
            ? 0
            : TEXT_GAP + renderedLineHeight)
        : PADDING * 2 +
          QR_SIZE;

    return (
      <svg
        aria-label="QR code"
        fontFamily={FONT_FAMILY}
        fontSize={FONT_SIZE}
        width={width}
        height={height}
        ref={ref}
        role="img"
        style={{ maxWidth: '100%', height: 'auto' }}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect fill="#FFFFFF" height={height} width={width} />
        <QRCodeSVG
          aria-hidden
          // Higher error correction level needed when icon is covering some modules
          level={showIcon ? 'Q' : 'M'}
          marginSize={QR_MARGIN_MODULES}
          imageSettings={
            showIcon
              ? {
                  src: iconSrc,
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                  excavate: true,
                }
              : undefined
          }
          size={QR_SIZE}
          value={value}
          x={layout === 'vertical' ? (width - QR_SIZE) / 2 : PADDING}
          y={PADDING}
        />
        {renderedLines.map((line, index) => {
          const key = `${line.label}:`;
          return (
            <text
              fill="#212121"
              key={line.label}
              textAnchor={layout === 'vertical' ? 'middle' : 'start'}
              x={
                layout === 'vertical' ? width / 2 : PADDING + QR_SIZE + TEXT_GAP
              }
              y={
                layout === 'vertical'
                  ? PADDING + QR_SIZE + TEXT_GAP + LINE_HEIGHT * (index + 0.5)
                  : PADDING + ((QR_SIZE - renderedLineHeight) / 2) + LINE_HEIGHT * (index + 0.5)
              }
            >
              <tspan fill="#000000" fontWeight="bold">
                {key}
              </tspan>{' '}
              {layout === 'vertical' ? truncate(line.value, MAX_LINE_CHARS - key.length - 1) : line.value}
            </text>
          );
        })}
      </svg>
    );
  }
);

export default QRCodeLabel;
