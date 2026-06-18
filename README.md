# React Modal Core

A lightweight, accessible, and highly customizable compound modal component library for React. Built with smooth animations, portal rendering, focus handling, and automatic body scroll locking with layout shift protection.

## Features

- 🏗️ **Compound Component API**: Clean, Radix-like declarative structure (`Modal.Trigger`, `Modal.Portal`, `Modal.Overlay`, etc.).
- 🎭 **CSS Transitions Ready**: Simple animation control via `data-state="open | closed"` attributes and configurable timing.
- 🚫 **Scroll Lock & Layout Shift Protection**: Automatically locks page scroll on mount and calculates scrollbar width to prevent visual layout shifts.
- 🌐 **Global Provider & Context**: Easily manage multiple modals globally using `ModalProvider` and the `useModalContext` hook.
- ⌨️ **Keyboard Support**: Automatically closes on `Escape` key press.
- ♿ **Accessible**: Follows WAI-ARIA guidelines (`role="dialog"`, `aria-modal`, `aria-hidden`).
- ⚡ **Zero Dependencies**: Lightweight and optimized for modern package bundle sizes.
- 🧩 **TypeScript Native**: Full typing support out of the box.

---

## Installation

```bash
npm install react-modal-core
```

---

## Basic Usage

The compound component API gives you complete flexibility over where to place the trigger, overlay, and content.

```tsx
import React from 'react';
import { Modal } from 'react-modal-core';

function App() {
  return (
    <Modal transitionDuration={300}>
      {/* 1. The trigger element */}
      <Modal.Trigger className="open-btn">
        Open Modal
      </Modal.Trigger>

      {/* 2. Renders content via React Portal */}
      <Modal.Portal>
        {/* 3. The backdrop overlay */}
        <Modal.Overlay className="modal-overlay" />

        {/* 4. The modal container */}
        <Modal.Content className="modal-content">
          <h2>Modal Title</h2>
          <p>This is the modal content!</p>
          
          {/* 5. A button to close the modal */}
          <Modal.Close className="close-btn">
            Close
          </Modal.Close>
        </Modal.Content>
      </Modal.Portal>
    </Modal>
  );
}
```

---

## Styling & Animations

React Modal Core provides state attributes to trigger CSS animations and transitions smoothly.

### 1. Data Attributes
Both `Modal.Overlay` and `Modal.Content` receive a `data-state` attribute which transitions between `"open"` and `"closed"` based on `transitionDuration`.

- `[data-state="open"]` when the modal has mounted and is visible.
- `[data-state="closed"]` when the modal is triggering its exit transition.

### 2. Styling Example (CSS)

```css
/* Backdrop Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  opacity: 0;
}
.modal-overlay[data-state="open"] {
  opacity: 1;
}
.modal-overlay[data-state="closed"] {
  opacity: 0;
}

/* Modal Content Container */
.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  z-index: 1001;
  opacity: 0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
.modal-content[data-state="open"] {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
.modal-content[data-state="closed"] {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
}
```

---

## Advanced Usage

### 1. Controlled State
You can fully control the open/close state from your parent component using the `open` and `onOpenChange` props:

```tsx
import React, { useState } from 'react';
import { Modal } from 'react-modal-core';

function ControlledExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Externally</button>
      
      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <Modal.Portal>
          <Modal.Overlay className="modal-overlay" />
          <Modal.Content className="modal-content">
            <h3>Controlled Modal</h3>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </Modal.Content>
        </Modal.Portal>
      </Modal>
    </div>
  );
}
```

### 2. Global Modal Provider
To easily trigger and close modals from anywhere in your component tree without prop drilling, wrap your app in `ModalProvider` and assign an `id` to your modals.

```tsx
// 1. Wrap your app
import { ModalProvider, Modal, useModalContext } from 'react-modal-core';

function App() {
  return (
    <ModalProvider>
      <MainScreen />
      
      {/* 2. Declare modal anywhere with a unique ID */}
      <Modal id="settings-modal">
        <Modal.Portal>
          <Modal.Overlay className="modal-overlay" />
          <Modal.Content className="modal-content">
            <h2>Settings</h2>
            <Modal.Close>Save & Close</Modal.Close>
          </Modal.Content>
        </Modal.Portal>
      </Modal>
    </ModalProvider>
  );
}

// 3. Trigger it from any child component
function MainScreen() {
  const modalContext = useModalContext();

  return (
    <button onClick={() => modalContext?.openModal('settings-modal')}>
      Open Settings
    </button>
  );
}
```

### 3. Custom Portal Target
By default, `Modal.Portal` appends the modal to `document.body`. You can direct it to render inside a specific container using the `appendTargetId` prop on the root `Modal`:

```tsx
<div id="modal-container"></div>

<Modal appendTargetId="modal-container">
  <Modal.Portal>
    {/* Renders inside #modal-container instead of body */}
    <Modal.Overlay className="modal-overlay" />
    <Modal.Content className="modal-content">Content</Modal.Content>
  </Modal.Portal>
</Modal>
```

### 4. Customizing Trigger / Close Buttons (`asChild`)
By default, `Modal.Trigger` and `Modal.Close` render as `<button>` elements. To use your own custom components, pass the `asChild` prop. The component will clone its child and merge click handlers and data attributes automatically.

```tsx
<Modal.Trigger asChild>
  <button className="my-custom-styled-button">
    Click Me!
  </button>
</Modal.Trigger>
```

---

## API Reference

### 1. `Modal` (Root Component)
Controls the modal state, context, and animation setup.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | `-` | Optional. A unique global ID to pair with `ModalProvider`. |
| `defaultOpen` | `boolean` | `false` | The initial open state when uncontrolled. |
| `open` | `boolean` | `-` | Used to control the open state programmatically. |
| `onOpenChange` | `(open: boolean) => void` | `-` | Callback fired when the open state changes. |
| `transitionDuration` | `number` | `150` | The duration (in ms) of transitions before unmounting the modal content from DOM. |
| `transitionTimingFunction` | `string` | `'ease'` | The CSS transition timing function. |
| `isBodyOverflowDisable` | `boolean` | `false` | If `true`, body scroll locking and padding compensation will be completely disabled. |
| `appendTargetId` | `string` | `-` | Target element ID where the portal will be mounted. Defaults to `document.body`. |

### 2. `Modal.Trigger`
Triggers the modal to open. Inherits all standard HTML button attributes unless `asChild` is set.

| Prop | Type | Default | Description |
|---|---|---|---|
| `asChild` | `boolean` | `false` | If true, merges behavior onto its immediate child instead of rendering a `<button>`. |

### 3. `Modal.Portal`
Renders its children into the target DOM element.

### 4. `Modal.Overlay`
The backdrop element of the modal. Inherits all standard HTML div attributes (like `className`, `style`, etc.).

### 5. `Modal.Content`
The dialog box wrapper. Inherits all standard HTML div attributes.

| Prop | Type | Default | Description |
|---|---|---|---|
| `renderItem` | `(modal: { isOpen: boolean, open: () => void, close: () => void }) => ReactNode` | `-` | Optional render prop to access modal state and control actions directly within content. |

### 6. `Modal.Close`
A helper component to close the modal. Inherits all standard HTML button attributes unless `asChild` is set.

| Prop | Type | Default | Description |
|---|---|---|---|
| `asChild` | `boolean` | `false` | If true, merges behavior onto its immediate child instead of rendering a `<button>`. |

---

### Legacy `useModal` Hook
For backwards compatibility, the legacy `useModal` hook is still supported.

```tsx
import { useModal, Modal } from 'react-modal-core';

const modal = useModal({
  divId: 'modal-root',
  transitionDuration: 150,
});

// Pass returned props down to old-style modal layout
<Modal {...modal}>
  <div>Legacy Modal Content</div>
</Modal>
```

---

## License

MIT
