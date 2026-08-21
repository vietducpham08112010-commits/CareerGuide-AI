import React, { useState, useEffect } from 'react';
import { generateVietQRUrl } from '../utils/generateVietQR';
import { Copy, Check, Clock, AlertCircle } from 'lucide-react';

interface PaymentQRProps {
  amount: number;
  orderCode: string; // ví dụ: CGAI-PREM-240821-XYZ
  onExpire?: () => void;
}

const PAYMENT_TIMEOUT_SECONDS = 15 * 60; // 15 minutes

export const PaymentQR: React.FC<PaymentQRProps> = ({ amount, orderCode, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number>(PAYMENT_TIMEOUT_SECONDS);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const qrUrl = generateVietQRUrl(amount, orderCode);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpire]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (timeLeft / PAYMENT_TIMEOUT_SECONDS) * 100;

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(fieldKey);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  const accountNumber = "0975371794";

  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full mx-auto space-y-4">
      {/* Header & Countdown */}
      <div className="w-full flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/40 px-4 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">Thời gian giữ lệnh</span>
        </div>
        <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">Quét mã QR thanh toán</h3>
      
      {/* QR Code Container */}
      <div className="relative group p-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <img
          src={qrUrl}
          alt="Mã QR thanh toán VietQR"
          className="w-56 h-56 rounded-xl object-contain bg-white"
        />
        {timeLeft === 0 && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center text-white p-4 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-sm font-semibold">Mã QR đã hết hạn</p>
            <p className="text-xs text-gray-300">Vui lòng tạo lại giao dịch mới.</p>
          </div>
        )}
      </div>

      {/* Payment Details Card */}
      <div className="w-full bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Số tiền:</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">
              {amount.toLocaleString("vi-VN")}đ
            </span>
            <button
              onClick={() => handleCopy(amount.toString(), 'amount')}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
              title="Sao chép số tiền"
            >
              {copiedText === 'amount' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Nội dung (CK):</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold bg-white dark:bg-gray-900 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300 border border-gray-200 dark:border-gray-700 text-xs">
              {orderCode}
            </span>
            <button
              onClick={() => handleCopy(orderCode, 'orderCode')}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
              title="Sao chép nội dung chuyển khoản"
            >
              {copiedText === 'orderCode' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">PHAM VIET DUC</p>
            <p className="font-mono text-indigo-600 dark:text-indigo-400">{accountNumber} (MB Bank)</p>
          </div>
          <button
            onClick={() => handleCopy(accountNumber, 'acc')}
            className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 font-medium text-xs transition-colors shadow-2xs"
          >
            {copiedText === 'acc' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span>Sao chép STK</span>
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-center max-w-xs leading-relaxed">
        Hệ thống tự động xác nhận qua SePay Webhook ngay khi nhận được chuyển khoản chính xác nội dung & số tiền.
      </p>
    </div>
  );
};

export default PaymentQR;
