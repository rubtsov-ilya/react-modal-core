import '@testing-library/jest-dom';
import React, { useState } from 'react';
import { render, screen, act, fireEvent, cleanup } from '@testing-library/react';
import { Modal, ModalProvider, useModalContext } from '../src/index';

describe('Modal Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
    jest.useRealTimers();
    // Сброс стилей body
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('should render trigger and not render content by default', () => {
    render(
      <Modal>
        <Modal.Trigger>Open Modal</Modal.Trigger>
        <Modal.Portal>
          <Modal.Overlay data-testid="overlay" />
          <Modal.Content data-testid="content">Modal Content</Modal.Content>
        </Modal.Portal>
      </Modal>
    );

    expect(screen.getByText('Open Modal')).toBeInTheDocument();
    expect(screen.queryByTestId('overlay')).not.toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('should render content and overlay after trigger click', () => {
    render(
      <Modal>
        <Modal.Trigger>Open Modal</Modal.Trigger>
        <Modal.Portal>
          <Modal.Overlay data-testid="overlay" />
          <Modal.Content data-testid="content">Modal Content</Modal.Content>
        </Modal.Portal>
      </Modal>
    );

    const trigger = screen.getByText('Open Modal');
    fireEvent.click(trigger);

    // После клика элемент должен смонтироваться в DOM
    expect(screen.getByTestId('overlay')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();

    // Проверяем начальное состояние анимации
    expect(screen.getByTestId('overlay')).toHaveAttribute('data-state', 'closed');
    
    // Перематываем время для завершения перехода (таймаут 10мс в Modal.tsx)
    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(screen.getByTestId('overlay')).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('content')).toHaveAttribute('data-state', 'open');
  });

  it('should close when close button is clicked', () => {
    render(
      <Modal defaultOpen={true}>
        <Modal.Portal>
          <Modal.Overlay data-testid="overlay" />
          <Modal.Content data-testid="content">
            Modal Content
            <Modal.Close data-testid="close-btn">Close</Modal.Close>
          </Modal.Content>
        </Modal.Portal>
      </Modal>
    );

    // Прокручиваем время начального монтирования
    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(screen.getByTestId('content')).toBeInTheDocument();

    const closeButton = screen.getByTestId('close-btn');
    fireEvent.click(closeButton);

    // data-state должен сразу измениться на 'closed'
    expect(screen.getByTestId('overlay')).toHaveAttribute('data-state', 'closed');
    expect(screen.getByTestId('content')).toHaveAttribute('data-state', 'closed');

    // Контент все еще в DOM во время анимации закрытия (по умолчанию 150мс)
    expect(screen.getByTestId('content')).toBeInTheDocument();

    // Прокручиваем время анимации закрытия
    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('should close when overlay is clicked', () => {
    render(
      <Modal defaultOpen={true}>
        <Modal.Portal>
          <Modal.Overlay data-testid="overlay" />
          <Modal.Content data-testid="content">Modal Content</Modal.Content>
        </Modal.Portal>
      </Modal>
    );

    act(() => {
      jest.advanceTimersByTime(10);
    });

    const overlay = screen.getByTestId('overlay');
    fireEvent.click(overlay);

    expect(overlay).toHaveAttribute('data-state', 'closed');

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('should close on Escape key press', () => {
    render(
      <Modal defaultOpen={true}>
        <Modal.Portal>
          <Modal.Overlay data-testid="overlay" />
          <Modal.Content data-testid="content">Modal Content</Modal.Content>
        </Modal.Portal>
      </Modal>
    );

    act(() => {
      jest.advanceTimersByTime(10);
    });

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    expect(screen.getByTestId('overlay')).toHaveAttribute('data-state', 'closed');

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('should support controlled mode', () => {
    const ControlledComponent = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button onClick={() => setIsOpen(true)}>Open External</button>
          <Modal open={isOpen} onOpenChange={setIsOpen}>
            <Modal.Portal>
              <Modal.Overlay data-testid="overlay" />
              <Modal.Content data-testid="content">
                Modal Content
                <Modal.Close data-testid="close-btn">Close</Modal.Close>
              </Modal.Content>
            </Modal.Portal>
          </Modal>
        </div>
      );
    };

    render(<ControlledComponent />);

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Open External'));

    expect(screen.getByTestId('content')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(10);
    });

    fireEvent.click(screen.getByTestId('close-btn'));

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('should support custom appendTargetId', () => {
    const customTarget = document.createElement('div');
    customTarget.id = 'custom-target';
    document.body.appendChild(customTarget);

    render(
      <Modal defaultOpen={true} appendTargetId="custom-target">
        <Modal.Portal>
          <Modal.Content data-testid="content">Modal Content</Modal.Content>
        </Modal.Portal>
      </Modal>
    );

    expect(customTarget).toContainElement(screen.getByTestId('content'));

    document.body.removeChild(customTarget);
  });

  it('should lock body scroll and restore it when closed', () => {
    expect(document.body.style.overflow).toBe('');

    const { unmount } = render(
      <Modal defaultOpen={true}>
        <Modal.Portal>
          <Modal.Content data-testid="content">Modal Content</Modal.Content>
        </Modal.Portal>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('should integrate with ModalProvider and global IDs', () => {
    const GlobalModalsComponent = () => {
      const modalCtx = useModalContext();
      return (
        <div>
          <button onClick={() => modalCtx?.openModal('test-global-modal')}>
            Open Global
          </button>
          <Modal id="test-global-modal">
            <Modal.Portal>
              <Modal.Content data-testid="content">Global Content</Modal.Content>
            </Modal.Portal>
          </Modal>
        </div>
      );
    };

    render(
      <ModalProvider>
        <GlobalModalsComponent />
      </ModalProvider>
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Open Global'));

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
