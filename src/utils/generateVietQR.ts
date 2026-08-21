export function generateVietQRUrl(
  amount: number,
  description: string // mã đơn hàng
) {
  const bank = "mbbank";
  const accountNumber = "0975371794";
  const accountName = "PHAM VIET DUC";
  const template = "compact2"; // đẹp và đầy đủ thông tin

  const encodedName = encodeURIComponent(accountName);
  const encodedDesc = encodeURIComponent(description);

  return `https://img.vietqr.io/image/${bank}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodedDesc}&accountName=${encodedName}`;
}
