import { useState } from 'react';
import { useZxing } from 'react-zxing';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

interface BarcodeScannerProps {
    onScanSuccess: (isbn: string) => void;
    onScanFailure?: (error: string) => void;
}

export const BarcodeScanner = ({ onScanSuccess }: BarcodeScannerProps) => {
    const [scanError, setScanError] = useState<string | null>(null);

    // ...

    const { ref } = useZxing({
        onResult(result) {
            onScanSuccess(result.getText());
        },
        onError(error) {
            // Ignore trivial errors to avoid spamming UI
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setScanError("Camera access denied. Please enable permissions.");
            } else if (error.name !== 'NotFoundException' && error.name !== 'ChecksumException' && error.name !== 'FormatException') {
                console.warn("Scanner error:", error);
            }
        },
        hints: new Map<any, any>([
            [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]],
            [DecodeHintType.TRY_HARDER, true]
        ]),
        timeBetweenDecodingAttempts: 300,
        constraints: {
            video: {
                facingMode: 'environment',
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
            }
        }
    });

    return (
        <div className="w-full">
            {scanError ? (
                <div className="p-4 text-red-500 bg-red-50 rounded text-center">{scanError}</div>
            ) : (
                <div className="w-full h-64 bg-black rounded-xl overflow-hidden relative shadow-inner">
                    <video ref={ref} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-2 border-white/30 pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-32 border-2 border-white/80 rounded-lg"></div>
                    </div>
                    <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/80 font-medium z-10">
                        Align barcode within frame
                    </p>
                </div>
            )}
        </div>
    );
};
