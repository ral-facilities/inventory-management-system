import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
// Inlined as a data URL so the icon still renders once the SVG is serialised for download, and
// regardless of where the plugin is hosted
import iconSrc from '../../public/logo192.png?inline';

const WIDTH = 320;
const PADDING = 16;
const QR_SIZE = 160;
/** Quiet zone around the symbol itself, in QR modules, in addition to the label padding. */
const QR_MARGIN_MODULES = 2;
/** Kept small enough that error correction can still recover the modules hidden behind it. */
const ICON_SIZE = 35;
const TEXT_GAP = 12;
const LINE_HEIGHT = 20;
const FONT_SIZE = 14;
/** SVG text can't be measured before it is rendered, so lines are capped by character count,
 * which at this font size keeps them within the label width. */
const MAX_LINE_CHARS = 38;
/** A font every viewer will have, as the downloaded image can't rely on the app's fonts. */
const FONT_FAMILY = 'Arial, Helvetica, sans-serif';

export interface QRCodeLabelProps {
  value: string;
  lines: {
    label: string;
    value: string;
    rendered: boolean;
  }[];
  showIcon: boolean;
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
    const { value, lines, showIcon } = props;

    const renderedLines = lines.filter((line) => line.rendered);
    const height =
      PADDING * 2 +
      QR_SIZE +
      (renderedLines.length === 0
        ? 0
        : TEXT_GAP + renderedLines.length * LINE_HEIGHT);

    return (
      <svg
        aria-label="QR code"
        fontFamily={FONT_FAMILY}
        fontSize={FONT_SIZE}
        height={height}
        ref={ref}
        role="img"
        style={{ maxWidth: '100%', height: 'auto' }}
        viewBox={`0 0 ${WIDTH} ${height}`}
        width={WIDTH}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect fill="#FFFFFF" height={height} width={WIDTH} />
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
          x={(WIDTH - QR_SIZE) / 2}
          y={PADDING}
        />
        {renderedLines.map((line, index) => {
          const key = `${line.label}:`;
          return (
            <text
              fill="#212121"
              key={line.label}
              textAnchor="middle"
              x={WIDTH / 2}
              y={PADDING + QR_SIZE + TEXT_GAP + LINE_HEIGHT * (index + 0.5)}
            >
              <tspan fill="#000000" fontWeight="bold">
                {key}
              </tspan>{' '}
              {truncate(line.value, MAX_LINE_CHARS - key.length - 1)}
            </text>
          );
        })}
      </svg>
    );
  }
);

export default QRCodeLabel;
