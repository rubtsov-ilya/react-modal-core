# React Modal Core

A lightweight and customizable modal solution for React applications with smooth animations and body scroll locking.

## Features

- 🎭 Smooth mounting/unmounting animations
- 🚫 Body scroll locking with padding compensation
- 📱 Mobile-friendly
- 🎨 Customizable styles and transitions
- 🖱️ Easy event handling
- 🏗️ Portal-based implementation

## Installation

```bash
npm install react-modal-core
```

## Basic Usage

```tsx
import { useModal, Modal } from 'react-modal-core';

function Component() {
  const modal = useModal({
    divId: 'modal-root',
    transitionDuration: 300,
  });

  const { openModal, closeModal } = modal;

  return (
    <div>
      <button onClick={openModal}>Open Modal</button>

      <Modal {...modal}>
        <h1>Modal Content</h1>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
}
```

## Default Styles

### Backdrop Styles

```css
 {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}
```

### Backdrop Styles active

```css
 {
  opacity: 1;
  pointer-events: 'auto';
}
```

### Modal Styles

```css
 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 16px;
  background-color: white;
  border-radius: 8px;
  user-select: none;
}
```

## API Reference

### useModal Hook

#### Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `divId` | string | - | Required. The ID for the portal container |
| `transitionDuration?` | number | 0 | Duration of the transition in milliseconds |
| `transitionTimingFunction?` | string | 'ease' | CSS transition timing function |
| `initialModalState?` | boolean | false | Initial state of the modal |
| `isBodyOverflowDisable?` | boolean | false | Disables body overflow handling |
| `onOpenModal?` | function | - | Callback when modal opens |
| `onCloseModal?` | function | - | Callback when modal closes |

#### Return Values

| Value                      | Type     | Description                           |
| -------------------------- | -------- | ------------------------------------- |
| `divId`                    | string   | The portal container ID               |
| `transitionDuration`       | number   | Transition duration                   |
| `transitionTimingFunction` | string   | Transition timing function            |
| `isModalActive`            | boolean  | If modal is mounted                   |
| `isModalVisible`           | boolean  | If modal is visible (for transitions) |
| `openModal`                | function | Opens the modal                       |
| `closeModal`               | function | Closes the modal                      |

### Modal Component

#### Props
| Prop | Type | Description |
|------|------|-------------|
| `children` | ReactNode | Modal content |
| `divId` | string | Portal container ID |
| `transitionDuration` | number | Transition duration |
| `transitionTimingFunction` | string | Transition timing function |
| `isModalActive` | boolean | If modal is mounted |
| `isModalVisible` | boolean | If modal is visible |
| `closeModal` | function | Function to close modal |
| `styleBackdrop?` | CSSProperties | Custom backdrop styles |
| `styleModal?` | CSSProperties | Custom modal styles |
| `classNameBackdrop?` | string | Backdrop className |
| `classNameModal?` | string | Modal className |
| `eventsBackdrop?` | DOMAttributes | Backdrop event handlers |
| `eventsModal?` | DOMAttributes | Modal event handlers |

## Advanced Usage

### Custom Styles and Class Names

```tsx
import { useModal, Modal } from 'react-modal-core';

function Component() {
  const modal = useModal({
    divId: 'modal-root',
    transitionDuration: 300,
  });

  const { openModal, closeModal, isModalVisible } = modal;

  return (
    <div>
      <button onClick={openModal}>Open Modal</button>

      <Modal
        {...modal}
        classNameBackdrop="custom-backdrop"
        classNameModal="custom-modal"
        styleBackdrop={{
          ...(isModalVisible && { opacity: '1' }),
          ...(!isModalVisible && { opacity: '0' }),
        }}
        styleModal={{
          ...(isModalVisible ? { width: '80%' } : { width: ' 100%' }),
        }}
      >
        {/* content */}
      </Modal>
    </div>
  );
}
```

### Custom Event Handlers

```tsx
<Modal
  {...modal}
  eventsBackdrop={{
    onMouseEnter: () => console.log('Backdrop hover'),
  }}
  eventsModal={{
    onClick: () => console.log('Modal clicked'),
  }}
>
  {/* content */}
</Modal>
```

## Why React Modal Core?

- **Smooth Animations**: Properly handles mounting/unmounting with transitions
- **Body Scroll Lock**: Prevents background scrolling while modal is open
- **Mobile Ready**: Handles mobile devices appropriately
- **Customizable**: Full control over styles and behavior
- **Lightweight**: Minimal dependencies and bundle size

## License

MIT
