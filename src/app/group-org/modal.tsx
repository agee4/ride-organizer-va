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
    setModalElementHelper(element);
    if (modalRef.current) modalRef.current.style.display = "block";
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
      className="fixed top-0 left-0 z-5 hidden h-full w-full place-content-center overflow-auto bg-white/60 pt-15 text-inherit dark:bg-black/60"
      ref={modalRef}
    >
      <button
        onClick={closeModal}
        className="absolute top-4 right-8 cursor-pointer text-4xl font-bold text-black hover:text-gray-300 dark:text-white"
      >
        &times;
      </button>
      <div className="mx-auto flex max-h-[80%] place-content-center overflow-auto">
        <div ref={modalElementRef}>{element}</div>
      </div>
    </div>
  );
};
