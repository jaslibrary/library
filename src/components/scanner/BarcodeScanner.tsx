import React, { useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanFailure?: (error: any) => void;
}

export const BarcodeScanner = ({ onScanSuccess, onScanFailure }: BarcodeScannerProps) => {
    const scannerRef = useRef<any>(null);
    const [scanError, setScanError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        let html5QrcodeScanner: any = null;

        const initScanner = async () => {
            try {
                // Dynamically import the library to prevent load-time crashes
                const { Html5QrcodeScanner } = await import('html5-qrcode');

                if (!isMounted) return;

                html5QrcodeScanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );

                scannerRef.current = html5QrcodeScanner;

                html5QrcodeScanner.render(
                    (decodedText: string) => {
                        if (isMounted) onScanSuccess(decodedText);
                    },
                    (error: any) => {
                        // console.warn(error); // Ignore scan errors they are spammy
                    }
                );
            } catch (err) {
                console.error("Failed to load html5-qrcode:", err);
                if (isMounted) setScanError("Failed to load camera library.");
            }
        };

        // Small timeout to ensure DOM is ready
        const timer = setTimeout(initScanner, 100);

        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch((error: any) => {
                        console.error("Failed to clear scanner", error);
                    });
                } catch (e) { /* ignore */ }
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="w-full">
            {scanError ? (
                <div className="p-4 text-red-500 bg-red-50 rounded text-center">{scanError}</div>
            ) : (
                <>
                    <div id="reader" className="w-full h-64 bg-black/5 rounded-xl overflow-hidden relative"></div>
                    <p className="text-center text-sm text-gray-500 mt-2">Point camera at book barcode</p>
                </>
            )}
        </div>
    );
};
