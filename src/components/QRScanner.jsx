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

        let cameraId = null;
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            // Find a back/rear camera if available
            const backCamera = devices.find((device) => {
              const label = device.label.toLowerCase();
              return label.includes("back") || label.includes("rear") || label.includes("environment");
            });
            cameraId = backCamera ? backCamera.id : devices[0].id;
          }
        } catch (camErr) {
          console.warn("Failed to get cameras, falling back to facingMode constraint:", camErr);
        }

        const constraint = cameraId ? cameraId : { facingMode: "environment" };

        await scanner.start(
          constraint,
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