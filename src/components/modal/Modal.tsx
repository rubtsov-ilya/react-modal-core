import { createPortal } from 'react-dom';
import React, { FC, useLayoutEffect, useRef } from 'react';

interface ModalProps {
  children: React.ReactNode;
  divId: string;
  transitionDuration: number;
  transitionTimingFunction: string;
  isModalActive: boolean;
  isModalVisible: boolean;
  closeModal: () => void;
  styleBackdrop?: React.CSSProperties;
  styleModal?: React.CSSProperties;
  classNameBackdrop?: string;
  classNameModal?: string;
  eventsBackdrop? : React.DOMAttributes<HTMLDivElement>;
  eventsModal? : React.DOMAttributes<HTMLDivElement>;
  }

const Modal: FC<ModalProps> = ({
  children,
  divId,
  transitionDuration,
  transitionTimingFunction,
  isModalActive,
  isModalVisible,
  closeModal,
  styleBackdrop,
  styleModal,
  classNameBackdrop,
  classNameModal,
  eventsBackdrop,
  eventsModal,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);

  const styleBackdropDefault = {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    WebkitBackdropFilter: 'blur(2px)', // для Safari
    backdropFilter: 'blur(2px)',
    opacity: 0,
    pointerEvents: 'none' as const,
    overflow: 'hidden',
  };

  const styleBackdropTransitionDefault = {
    transition: `all ${transitionDuration}ms ${transitionTimingFunction}`,
  };

  const styleBackdropVisibleDefault = {
    opacity: 1,
    pointerEvents: 'auto' as const,
  };

  const styleModalDefault = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,

    padding: '8px 16px',
    backgroundColor: 'white',
    borderRadius: 8,
    userSelect: 'none' as const,
  };

  useLayoutEffect(() => {
    // Добавляем элемент в body при монтировании
    if (isModalActive && !divRef.current) {
      const newDiv = document.createElement('div');
      newDiv.id = divId;
      document.body.appendChild(newDiv);
      divRef.current = newDiv;
    }

    if (
      !isModalActive &&
      divRef.current &&
      document.body.contains(divRef.current)
    ) {
      document.body.removeChild(divRef.current);
      divRef.current = null;
    }

    return () => {
      // Удаляем элемент при размонтировании
      if (divRef.current && document.body.contains(divRef.current)) {
        document.body.removeChild(divRef.current);
        divRef.current = null;
      }
    };
  }, [isModalActive]);

  if (!divRef.current || !isModalActive) {
    return null;
  }

  return createPortal(
    <div
      style={
        styleBackdrop
          ? { ...styleBackdrop, ...styleBackdropTransitionDefault }
          : classNameBackdrop && !styleBackdrop
            ? {...styleBackdropTransitionDefault}
            : {
                ...styleBackdropDefault,
                ...styleBackdropTransitionDefault,
                ...(isModalVisible ? styleBackdropVisibleDefault : {}),
              }
      }
      className={`${classNameBackdrop ? classNameBackdrop : ''}`}
      onClick={closeModal}
      {...eventsBackdrop}
    >
      <div
        style={
          styleModal
            ? styleModal
            : classNameModal && !styleModal
              ? {}
              : {
                  ...styleModalDefault,
                }
        }
        className={`${classNameModal ? classNameModal : ''}`}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        {...eventsModal}
      >
        {children}
      </div>
    </div>,
    document.getElementById(divId) as HTMLDivElement,
  );
};

export { Modal };