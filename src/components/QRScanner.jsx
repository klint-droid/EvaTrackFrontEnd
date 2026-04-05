import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

function QRScanner({ onScan }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: 250,
          },
          (decodedText) => {
            if (!isMounted) return;

            console.log("Scanned:", decodedText);

            onScan(decodedText);

            scanner.stop().catch(() => {});
          },
          () => {}
        );
      } catch (err) {
        console.error("QR Scanner Error:", err);
      }
    };

    // ⏱ Delay to ensure DOM is ready
    const timeout = setTimeout(startScanner, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeout);

      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return <div id="reader" style={{ width: "300px" }} />;
}

export default QRScanner;