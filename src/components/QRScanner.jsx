import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

function QRScanner({ onScan }) {
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);
  const isStoppingRef = useRef(false);

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
          async (decodedText) => {
            if (!isMounted || isStoppingRef.current) return;

            console.log("Scanned:", decodedText);
            isStoppingRef.current = true;

            // Stop scanner first while DOM is still active
            try {
              if (isScanningRef.current) {
                await scanner.stop();
                isScanningRef.current = false;
              }
            } catch (stopErr) {
              console.warn("Error stopping scanner on scan:", stopErr);
            }

            if (isMounted) {
              onScan(decodedText);
            }
          },
          () => {}
        );
        isScanningRef.current = true;
      } catch (err) {
        console.error("QR Scanner Error:", err);
      }
    };

    // Delay to ensure DOM is ready
    const timeout = setTimeout(startScanner, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeout);

      if (scannerRef.current) {
        const scanner = scannerRef.current;
        if (isScanningRef.current && !isStoppingRef.current) {
          isStoppingRef.current = true;
          try {
            scanner.stop()
              .then(() => {
                isScanningRef.current = false;
              })
              .catch((err) => {
                console.warn("Error stopping scanner on unmount promise:", err);
              });
          } catch (err) {
            console.warn("Synchronous error stopping scanner on unmount:", err);
          }
        }
      }
    };
  }, [onScan]);

  return <div id="reader" style={{ width: "300px" }} />;
}

export default QRScanner;