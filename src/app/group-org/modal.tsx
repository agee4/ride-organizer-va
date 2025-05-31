"use client";

import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { useClickOutside, useOnKeyPress } from "./helpers";

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
export function useModal(
  initialValue: ReactNode = null,
  base: boolean = false
) {
  const [modalElement, setModalElementHelper] =
    useState<ReactNode>(initialValue);
  const modalRef = useRef<HTMLDivElement>(null);
  const [preventScroll, setPreventScroll] = useState<boolean>(false);
  useEffect(() => {
    if (base) {
      if (preventScroll) {
        if (
          !document.body.classList.replace("overflow-auto", "overflow-hidden")
        )
          document.body.classList.add("overflow-hidden");
      } else {
        if (
          !document.body.classList.replace("overflow-hidden", "overflow-auto")
        )
          document.body.classList.add("overflow-auto");
      }
      return () => {
        if (
          !document.body.classList.replace("overflow-hidden", "overflow-auto")
        )
          document.body.classList.add("overflow-auto");
      };
    }
  }, [base, preventScroll]);

  function setModal(element: ReactNode) {
    setModalElementHelper(element);
    setPreventScroll(true);
    if (modalRef.current) {
      modalRef.current.classList.add("block");
      modalRef.current.classList.remove("hidden");
    }
  }

  function closeModal() {
    setPreventScroll(false);
    setModalElementHelper(undefined);
    if (modalRef.current) {
      modalRef.current.classList.add("hidden");
      modalRef.current.classList.remove("block");
    }
  }

  const Modal = (
    <ModalDisplay
      element={modalElement}
      modalRef={modalRef}
      closeModal={closeModal}
    />
  );

  return { Modal, setModal, closeModal };
}

const ModalDisplay = ({
  element,
  modalRef,
  closeModal,
}: {
  element: ReactNode;
  modalRef: RefObject<HTMLDivElement | null>;
  closeModal: () => void;
}) => {
  const modalElementRef = useRef<HTMLDivElement>(null);

  useOnKeyPress("Escape", closeModal);
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
