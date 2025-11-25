export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <>
      <div className="overlay" onClick={onClose}></div>

      <div className="modal">
        <h2>{title}</h2>

        <div className="modal-content">{children}</div>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}
