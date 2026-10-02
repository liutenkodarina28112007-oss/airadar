export default function CompareBar({ count, max, onClear, onOpen }) {
  if (!count) return null;
  return (
    <div className="bar on">
      <div className="wrap">
        <span>Обрано для порівняння: {count} з {max}</span>
        <span>
          <button className="btn ghost" type="button" onClick={onClear}>Очистити</button>{" "}
          <button className="btn" type="button" onClick={onOpen} disabled={count < 2}>Порівняти</button>
        </span>
      </div>
    </div>
  );
}
