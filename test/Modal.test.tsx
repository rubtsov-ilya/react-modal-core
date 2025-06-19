import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
import { Modal } from '../src/components/modal/Modal';
import { useModal } from '../src/index';

// Мокаем createPortal для тестирования
jest.mock('react-dom', () => {
  const actualDom = jest.requireActual('react-dom');
  return {
    ...actualDom,
    createPortal: (element: React.ReactNode) => element,
  };
});

describe('Modal component', () => {
  beforeEach(() => {
    // Очищаем все порталы перед каждым тестом
    document.querySelectorAll('#test-modal').forEach(el => el.remove());
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should not render when isModalActive is false', () => {
    render(
      <Modal
        divId="test-modal"
        isModalActive={false}
        isModalVisible={false}
        transitionDuration={0}
        transitionTimingFunction="ease"
        closeModal={() => {}}
      >
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('should apply default styles', async () => { 
    const TestComponent = () => {
      const modal = useModal({ divId: 'test-modal' });

      return (
        <div>
          <button onClick={modal.openModal}>Open Modal</button>
          <Modal
            {...modal}
          >
            <div>Modal Content</div>
          </Modal>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();

    await act(async () => {
      screen.getByText('Open Modal').click();
    });

    // Ждём выполнения setTimeout(0)
    await act(async () => {
      jest.runAllTimers();
    });

    const backdrop = screen.getByText('Modal Content').parentElement
      ?.parentElement;

    expect(backdrop).toHaveStyle('position: fixed');
    expect(backdrop).toHaveStyle('opacity: 1');
  });

  it('should apply custom styles', async () => {
    const customStyle = {
      backgroundColor: 'red',
    };
 
    const TestComponent = () => {
      const modal = useModal({ divId: 'test-modal' });

      return (
        <div>
          <button onClick={modal.openModal}>Open Modal</button>
          <Modal
            {...modal}
            styleBackdrop={customStyle}
            styleModal={customStyle}
          >
            <div>Modal Content</div>
          </Modal>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();

    await act(async () => {
      screen.getByText('Open Modal').click();
    });

    // Ждём выполнения setTimeout(0)
    await act(async () => {
      jest.runAllTimers();
    });

    const backdrop = screen.getByText('Modal Content').parentElement
      ?.parentElement;
    const modal = screen.getByText('Modal Content').parentElement;

    expect(backdrop).toHaveStyle('background-color: red');
    expect(modal).toHaveStyle('background-color: red');
  });

  it('should apply className', async () => {
    const TestComponent = () => {
      const modal = useModal({ divId: 'test-modal' });

      return (
        <div>
          <button onClick={modal.openModal}>Open Modal</button>
          <Modal
            {...modal}
            classNameBackdrop="custom-backdrop"
            classNameModal="custom-modal"
          >
            <div>Modal Content</div>
          </Modal>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();

    await act(async () => {
      screen.getByText('Open Modal').click();
    });

    // Ждём выполнения setTimeout(0)
    await act(async () => {
      jest.runAllTimers();
    });

    const backdrop = screen.getByText('Modal Content').parentElement
      ?.parentElement;
    const modal = screen.getByText('Modal Content').parentElement;

    expect(backdrop).toHaveClass('custom-backdrop');
    expect(modal).toHaveClass('custom-modal');
  });

  it('should close when clicking on backdrop', async () => {
    const closeMock = jest.fn(); // Мок функция для закрытия

    const TestComponentWithMock = () => {
      const modal = useModal({ divId: 'test-modal' });

      return (
        <div>
          <button onClick={modal.openModal}>Open Modal</button>
          <Modal {...modal} closeModal={closeMock}>
            <div>Modal Content</div>
          </Modal>
        </div>
      );
    };

    render(<TestComponentWithMock />);

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();

    await act(async () => {
      screen.getByText('Open Modal').click();
    });

    // Ждём выполнения setTimeout(0)
    await act(async () => {
      jest.runAllTimers();
    });

    expect(
      screen.getByText('Modal Content').parentElement?.parentElement
    ).toBeInTheDocument();

    await act(async () => {
      screen.getByText('Modal Content').parentElement?.parentElement?.click();
    });

    await act(async () => {
      jest.runAllTimers();
    });

    // Проверяем, что модальное окно было разрендерено
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it('should not close when clicking on modal content', async () => {
    const closeMock = jest.fn(); // Мок функция для закрытия

    const TestComponentWithMock = () => {
      const modal = useModal({ divId: 'test-modal' });

      return (
        <div>
          <button onClick={modal.openModal}>Open Modal</button>
          <Modal {...modal} closeModal={closeMock}>
            <div>Modal Content</div>
          </Modal>
        </div>
      );
    };

    render(<TestComponentWithMock />);

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();

    await act(async () => {
      screen.getByText('Open Modal').click();
    });

    // Ждём выполнения setTimeout(0)
    await act(async () => {
      jest.runAllTimers();
    });

    expect(screen.getByText('Modal Content')).toBeInTheDocument();

    await act(async () => {
      screen.getByText('Modal Content').click();
    });

    await act(async () => {
      jest.useFakeTimers();
      jest.runAllTimers();
    });

    // Проверяем, что модальное окно не было разрендерено
    expect(closeMock).not.toHaveBeenCalled();
  });

  it('should add and remove div from DOM', () => {
    const { unmount } = render(
      <Modal
        divId="test-modal"
        isModalActive={true}
        isModalVisible={true}
        transitionDuration={0}
        transitionTimingFunction="ease"
        closeModal={() => {}}
      >
        <div>Modal Content</div>
      </Modal>
    );

    expect(document.getElementById('test-modal')).toBeInTheDocument();

    unmount();

    expect(document.getElementById('test-modal')).not.toBeInTheDocument();
  });

  it('should work with useModal hook', async () => {
    const TestComponent = () => {
      const modal = useModal({ divId: 'test-modal' });

      return (
        <div>
          <button onClick={modal.openModal}>Open Modal</button>
          <Modal {...modal}>
            <div>Modal Content</div>
          </Modal>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();

    await act(async () => {
      screen.getByText('Open Modal').click();
    });

    // Ждём выполнения setTimeout(0)
    await act(async () => {
      jest.runAllTimers();
    });

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });
});
