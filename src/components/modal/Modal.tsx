'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { useModalContext } from '../providers/ModalProvider';

// Context to share modal state between compound components
export interface ModalInstanceContextProps {
  id?: string;
  isOpen: boolean;
  isMounted: boolean;
  isVisible: boolean;
  open: () => void;
  close: () => void;
  transitionDuration: number;
  transitionTimingFunction: string;
  isBodyOverflowDisable: boolean;
  appendTargetId?: string;
}

const ModalInstanceContext = createContext<ModalInstanceContextProps | null>(null);

export const useModalInstance = () => {
  const context = useContext(ModalInstanceContext);
  if (!context) {
    throw new Error('Modal compound components must be rendered within a Modal wrapper');
  }
  return context;
};

export interface ModalProps {
  id?: string; // Optional global ID to sync with ModalProvider
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  transitionDuration?: number;
  transitionTimingFunction?: string;
  isBodyOverflowDisable?: boolean;
  appendTargetId?: string;
  children: React.ReactNode;
}

const ModalRoot: React.FC<ModalProps> = ({
  id,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  transitionDuration = 150,
  transitionTimingFunction = 'ease',
  isBodyOverflowDisable = false,
  appendTargetId,
  children,
}) => {
  const globalContext = useModalContext();
  const [localOpen, setLocalOpen] = useState(defaultOpen);

  // Resolve current open state
  const isOpen = controlledOpen !== undefined
    ? controlledOpen
    : id && globalContext
    ? globalContext.isModalOpen(id)
    : localOpen;

  const setOpen = useCallback((value: boolean) => {
    if (controlledOpen !== undefined && onOpenChange) {
      onOpenChange(value);
    } else if (id && globalContext) {
      if (value) {
        globalContext.openModal(id);
      } else {
        globalContext.closeModal(id);
      }
    } else {
      setLocalOpen(value);
    }
  }, [controlledOpen, onOpenChange, id, globalContext]);

  const open = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);

  // Transition states
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isOpen) {
      setIsMounted(true);
      // Wait one tick to toggle visual active class to trigger css transitions
      timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 10);
    } else {
      setIsVisible(false);
      timeoutId = setTimeout(() => {
        setIsMounted(false);
      }, transitionDuration);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOpen, transitionDuration]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  // Lock body scroll and prevent layout shifts
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    if (!isBodyOverflowDisable) {
      // Calculate scrollbar width to prevent page shift
      const hasScrollbar = window.innerWidth > document.documentElement.clientWidth;
      if (hasScrollbar) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
    }

    return () => {
      // Check if other modals are still open before restoring scroll
      const openModals = document.querySelectorAll('[data-modal-content][data-state="open"]');
      if (openModals.length === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      }
    };
  }, [isMounted, isBodyOverflowDisable]);

  return (
    <ModalInstanceContext.Provider
      value={{
        id,
        isOpen,
        isMounted,
        isVisible,
        open,
        close,
        transitionDuration,
        transitionTimingFunction,
        isBodyOverflowDisable,
        appendTargetId,
      }}
    >
      {children}
    </ModalInstanceContext.Provider>
  );
};

// --- Compound Components ---

// 1. Trigger Component
export interface ModalTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const ModalTrigger: React.FC<ModalTriggerProps> = ({ asChild, children, ...props }) => {
  const { open, isOpen } = useModalInstance();

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    props.onClick?.(e);
    open();
  }, [open, props.onClick]);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      onClick: (e: React.MouseEvent) => {
        (children.props as any).onClick?.(e);
        handleClick(e as any);
      },
      'data-state': isOpen ? 'open' : 'closed',
      'data-modal-trigger': '',
    });
  }

  return (
    <button
      onClick={handleClick}
      data-state={isOpen ? 'open' : 'closed'}
      data-modal-trigger=""
      {...props}
    >
      {children}
    </button>
  );
};

// 2. Portal Component
export interface ModalPortalProps {
  children: React.ReactNode;
}

export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const { appendTargetId, isMounted } = useModalInstance();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isMounted) return null;

  const target = appendTargetId
    ? document.getElementById(appendTargetId)
    : document.body;

  if (!target) return null;

  return createPortal(children, target);
};

// 3. Overlay / Backdrop Component
export interface ModalOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({
  className,
  style,
  ...props
}) => {
  const { close, isVisible, transitionDuration, transitionTimingFunction, appendTargetId } = useModalInstance();

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    close();
  }, [close]);

  const state = isVisible ? 'open' : 'closed';

  return (
    <div
      onClick={handleOverlayClick}
      data-state={state}
      data-modal-overlay=""
      data-has-target={!!appendTargetId ? "true" : undefined}
      className={className}
      style={{
        transition: `all ${transitionDuration}ms ${transitionTimingFunction}`,
        ...style,
      }}
      {...props}
    />
  );
};

// 4. Content Component
export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  renderItem?: (modal: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  }) => React.ReactNode;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  renderItem,
  className,
  style,
  ...props
}) => {
  const {
    isOpen,
    open,
    close,
    isVisible,
    transitionDuration,
    transitionTimingFunction,
  } = useModalInstance();

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid closing modal when clicking inside it
  }, []);

  const state = isVisible ? 'open' : 'closed';

  const renderedContent = renderItem
    ? renderItem({ isOpen, open, close })
    : children;

  return (
    <div
      onClick={handleContentClick}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      data-state={state}
      data-modal-content=""
      className={className}
      style={{
        transition: `all ${transitionDuration}ms ${transitionTimingFunction}`,
        ...style,
      }}
      {...props}
    >
      {renderedContent}
    </div>
  );
};

// 5. Close Component
export interface ModalCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const ModalClose: React.FC<ModalCloseProps> = ({ asChild, children, ...props }) => {
  const { close } = useModalInstance();

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    props.onClick?.(e);
    close();
  }, [close, props.onClick]);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      onClick: (e: React.MouseEvent) => {
        (children.props as any).onClick?.(e);
        handleClick(e as any);
      },
      'data-modal-close': '',
    });
  }

  return (
    <button onClick={handleClick} data-modal-close="" {...props}>
      {children}
    </button>
  );
};

// Assign compound components
export const Modal = Object.assign(ModalRoot, {
  Trigger: ModalTrigger,
  Portal: ModalPortal,
  Overlay: ModalOverlay,
  Content: ModalContent,
  Close: ModalClose,
});
