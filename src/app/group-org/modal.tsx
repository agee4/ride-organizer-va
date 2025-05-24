"use client";

import { ReactNode, RefObject, useRef, useState } from "react";
import { useClickOutside } from "./helpers";

/**Custom Hook intended for use in conjunction with ModalDisplay
 * Returns { Modal, setModal, closeModal }
 * 
 * Modal is a ModalDisplay component connected to setModal & closeModal
 * 
 * setModal is a function that accepts a ReactNode parameter "element"
 * When called, the corresponding Modal is made visible and displays "element"
 * 
 * closeModal is a auxiliary function that hides and clears Modal
 * Intended to be used in elements displayed in Modal to close upon certain actions
 */
export function useModal(initialValue: ReactNode = null) {
  const [modalElement, setModalElementHelper] =
    useState<ReactNode>(initialValue);
  const modalRef = useRef<HTMLDivElement>(null);

  function setModal(element: ReactNode) {
    if (modalRef.current) modalRef.current.style.display = "block";
    setModalElementHelper(element);
  }

  function closeModal() {
    setModalElementHelper(undefined);
    if (modalRef.current) modalRef.current.style.display = "none";
  }

  const Modal = <ModalDisplay element={modalElement} modalRef={modalRef} />;

  return { Modal, setModal, closeModal };
}

const ModalDisplay = ({
  element,
  modalRef,
}: {
  element: ReactNode;
  modalRef: RefObject<HTMLDivElement | null>;
}) => {
  const modalElementRef = useRef<HTMLDivElement>(null);

  const closeModal = () => {
    if (modalRef.current) modalRef.current.style.display = "none";
  };

  useClickOutside(modalElementRef, closeModal);

  return (
    <div
      id="modal"
      className="fixed top-0 left-0 z-5 hidden h-full w-full place-content-center overflow-auto bg-white/80 pt-15 text-inherit dark:bg-black/80"
      ref={modalRef}
    >
      <button
        id="modal-close"
        onClick={closeModal}
        className="absolute top-4 right-8 cursor-pointer text-4xl font-bold text-white hover:text-gray-300"
      >
        &times;
      </button>
      <div className="mx-auto flex max-h-[80%] place-content-center overflow-auto">
        <div ref={modalElementRef}>{element}</div>
      </div>
      <div id="modal-caption"></div>
    </div>
  );
};
