import { ReactNode, useRef } from "react";
import { useClickOutside } from "./helpers";

export function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.style.display = "none";
}

export const ModalDisplay = ({ element }: { element: ReactNode }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, closeModal);

  return (
    <dialog
      id="modal"
      className="fixed top-0 left-0 z-5 hidden h-full w-full place-content-center overflow-auto bg-black/80 pt-15 text-inherit"
    >
      <button
        id="modal-close"
        onClick={closeModal}
        className="absolute top-4 right-8 cursor-pointer text-4xl font-bold text-white hover:text-gray-300"
      >
        &times;
      </button>
      <div className="mx-auto flex max-h-[80%] place-content-center overflow-auto">
        <div ref={modalRef}>{element}</div>
      </div>
      <div id="modal-caption"></div>
    </dialog>
  );
};
