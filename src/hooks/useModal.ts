import { useState } from 'react';

interface useModalProps {
  divId: string;
  transitionDuration?: number;
  transitionTimingFunction?: React.CSSProperties['transition'];
  initialModalState?: boolean;
  isBodyOverflowDisable?: boolean;
  onOpenModal?: () => void;
  onCloseModal?: () => void;
}

export function useModal({
  divId,
  transitionDuration = 0,
  transitionTimingFunction = 'ease',
  initialModalState = false,
  isBodyOverflowDisable = false,
  onOpenModal,
  onCloseModal,
}: useModalProps): {
  divId: string;
  transitionDuration: number;
  transitionTimingFunction: string;
  isModalActive: boolean;
  isModalVisible: boolean;
  openModal: () => void;
  closeModal: () => void;
} {
  const [isModalActive, setIsModalActive] =
    useState<boolean>(initialModalState);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  const openModal = () => {
    const bodyPadding =
      window.innerWidth -
      (document.querySelector('#root') as HTMLDivElement)?.offsetWidth;
    setIsModalActive(true);
    onOpenModal && onOpenModal();
    if (!isMobile && !isBodyOverflowDisable) {
      document.body.style.paddingRight = `${bodyPadding}px`;
    }
    document.body.style.overflowY = 'hidden';
    setTimeout(() => {
      setIsModalVisible(true);
    }, 0);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      onCloseModal && onCloseModal();
      setIsModalActive(false);
      if (!isMobile && !isBodyOverflowDisable) {
        document.body.style.removeProperty('padding-right');
      }
      document.body.style.removeProperty('overflow-y');
    }, transitionDuration);
  };

  return {
    divId,
    transitionDuration,
    transitionTimingFunction,
    isModalActive,
    isModalVisible,
    openModal,
    closeModal,
  };
}
