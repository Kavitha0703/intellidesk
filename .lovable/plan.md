

## Problem

Both the `ImageUpload` lightbox and the `ImageGallery` lightbox render a custom `X` close button inside `DialogContent`. However, the shadcn `DialogContent` component already includes a built-in close button (`DialogPrimitive.Close` with an `X` icon). This creates two overlapping close buttons.

## Solution

Remove the custom close `Button` from both lightbox dialogs:

1. **`src/components/complaints/ImageUpload.tsx`** (lines 267-275) — Remove the custom `X` close button from the lightbox `DialogContent`. The built-in dialog close button will handle closing.

2. **`src/components/complaints/ImageGallery.tsx`** (lines 96-103) — Same removal of the custom `X` close button.

No other changes needed. The built-in close button from `DialogContent` will remain and handle the close action via the `onOpenChange` prop already set on the `Dialog`.

