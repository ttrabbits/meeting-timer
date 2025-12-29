/**
 * フォーム形式秒数を MM:SS または -MM:SS 形式に変換します。
 */
export const formatTime = (seconds: number): string => {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return isNegative ? `-${formatted}` : formatted;
};
