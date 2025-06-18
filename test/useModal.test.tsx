import { renderHook, act } from '@testing-library/react-hooks';
import { useModal } from '../src/hooks/useModal';

describe('useModal hook', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    // Мокаем userAgent для тестирования мобильных устройств
    Object.defineProperty(window.navigator, 'userAgent', {
      value: '',
      writable: true,
    });
  });

  afterEach(() => {
    // Очищаем body после каждого теста
    document.body.style.paddingRight = '';
    document.body.style.overflowY = '';
    jest.clearAllTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useModal({ divId: 'test-modal' }));

    expect(result.current.isModalActive).toBe(false);
    expect(result.current.isModalVisible).toBe(false);
    expect(result.current.transitionDuration).toBe(0);
    expect(result.current.transitionTimingFunction).toBe('ease');
  });

  it('should initialize with custom values', () => {
    const onOpenMock = jest.fn();
    const onCloseMock = jest.fn();

    const { result } = renderHook(() =>
      useModal({
        divId: 'test-modal',
        initialModalState: true,
        transitionDuration: 300,
        transitionTimingFunction: 'linear',
        onOpenModal: onOpenMock,
        onCloseModal: onCloseMock,
      }),
    );

    expect(result.current.isModalActive).toBe(true);
    expect(result.current.transitionDuration).toBe(300);
    expect(result.current.transitionTimingFunction).toBe('linear');
  });

  it('should open and close modal', () => {
    const { result } = renderHook(() => useModal({ divId: 'test-modal' }));

    // Открываем модалку
    act(() => {
      result.current.openModal();
    });

    expect(result.current.isModalActive).toBe(true);
    expect(document.body.style.overflowY).toBe('hidden');
    expect(result.current.isModalVisible).toBe(false); // пока еще не видна

    // Проверяем видимость после setTimeout
    act(() => {
      jest.runAllTimers();
    });
    expect(result.current.isModalVisible).toBe(true);

    // Закрываем модалку
    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isModalVisible).toBe(false);

    act(() => {
      jest.runAllTimers();
    });
    expect(result.current.isModalActive).toBe(false);
    expect(document.body.style.overflowY).toBe('');
  });

  it('should call callbacks when opening and closing', () => {
    const onOpenMock = jest.fn();
    const onCloseMock = jest.fn();

    const { result } = renderHook(() =>
      useModal({
        divId: 'test-modal',
        onOpenModal: onOpenMock,
        onCloseModal: onCloseMock,
      }),
    );

    act(() => {
      result.current.openModal();
    });
    expect(onOpenMock).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.closeModal();
      jest.runAllTimers();
    });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should handle body padding on desktop', () => {
    // Эмулируем десктоп
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      writable: true,
    });

    // Создаем root элемент для тестирования padding-right
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    const { result } = renderHook(() =>
      useModal({ divId: 'test-modal', isBodyOverflowDisable: false }),
    );

    act(() => {
      result.current.openModal();
    });

    const scrollbarWidth = window.innerWidth - root.offsetWidth;
    expect(document.body.style.paddingRight).toBe(`${scrollbarWidth}px`);

    act(() => {
      result.current.closeModal();
      jest.runAllTimers();
    });

    expect(document.body.style.paddingRight).toBe('');

    document.body.removeChild(root);
  });

  it('should not handle body padding on mobile', () => {
    // Эмулируем мобильное устройство
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      writable: true,
    });

    const { result } = renderHook(() =>
      useModal({ divId: 'test-modal', isBodyOverflowDisable: false }),
    );

    act(() => {
      result.current.openModal();
    });

    expect(document.body.style.paddingRight).toBe('');

    act(() => {
      result.current.closeModal();
      jest.runAllTimers();
    });

    expect(document.body.style.paddingRight).toBe('');
  });

  it('should not handle body padding when isBodyOverflowDisable is true', () => {
    const { result } = renderHook(() =>
      useModal({ divId: 'test-modal', isBodyOverflowDisable: true }),
    );

    act(() => {
      result.current.openModal();
    });

    expect(document.body.style.paddingRight).toBe('');

    act(() => {
      result.current.closeModal();
      jest.runAllTimers();
    });

    expect(document.body.style.paddingRight).toBe('');
  });
});