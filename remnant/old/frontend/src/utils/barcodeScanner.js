import React, { useState, useEffect } from "react";

function BarcodeScanner({ onBarcodeScanned }) {
    const [barcode, setBarcode] = useState("");
    const [lastKeyTime, setLastKeyTime] = useState(0);
    const [timer, setTimer] = useState(null);

    useEffect(() => {
        const handleKeydown = (event) => {
            const currentTime = Date.now();

            if (!/^\d$/.test(event.key)) return;

            if (currentTime - lastKeyTime > 100) setBarcode("");

            setBarcode((prev) => prev + event.key);

            setLastKeyTime(currentTime);

            if (timer) clearTimeout(timer);

            setTimer(
                setTimeout(() => {
                    setBarcode((currentBarcode) => {
                        if (currentBarcode.length >= 5) {
                            onBarcodeScanned(currentBarcode);
                        }
                        return ""; // Сбрасываем штрихкод после отправки
                    });
                }, 300)
            );
        };

        window.addEventListener("keydown", handleKeydown);
        return () => {
            window.removeEventListener("keydown", handleKeydown);
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [lastKeyTime, timer, onBarcodeScanned]);
}

export default BarcodeScanner;
